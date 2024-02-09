    import Vue from 'Vue'
    import DictionaryModel from 'models/DictionaryModel'
    import InviteTokenModel from 'models/InviteTokenModel'
    import CompanyModel from 'models/CompanyModel'
    import CompanyCollection from 'collections/CompanyCollection'
    import EventBus from 'services/EventBus'
    import Toast from 'services/Toast'
    import showDeclineDialogue from 'elements/modals/show-decline-dialogue'

    const template = `
        <article>
    
           <header class="section-heading">{{ui.dictionary.invitations.acceptInvitation}}</header>
           <p>{{getCompanyName(ui.dictionary.invitations.acceptDescription)}}</p>
    
           <div class="working" v-show="!ui.companiesReady"></div>
    
    
           <div v-show="ui.companiesReady" class="form">
               <div class="selector">
                   <div class="label" v-on:click.stop="ui.options = true">
                       <span v-if="company && company.name">{{company.name}}</span><span v-if="company && !company.name">{{company.vat}}</span><span v-show="!company">{{ui.dictionary.invitations.chooseCompany}}</span> <i class="cwi-down"></i>
    
                       <div class="options" v-bind:class="{ show : ui.options }">
                           <div class="option" v-bind:class="{ selected : company && company.id == comp.id }" v-for="comp in companyList" v-on:click.stop="company = comp; ui.options = false">
                               <span v-show="comp.name">{{comp.name}}</span><span v-show="!comp.name">{{comp.vat}}</span>
                           </div>
    
                           <div class="option divider top" v-on:click.stop="createCompany()">
                               {{ui.dictionary.company.create}}
                           </div>
    
                       </div>
    
                   </div>
               </div>
    
               <div v-show="ui.saving" class="working"></div>
    
               <div v-show="!ui.saving">
                   <button class="primary" v-on:click="setCompany(company)">{{ui.dictionary.invitations.acceptInvitationConfirm}}</button>
                   <div class="line-spacer"></div><div class="line-spacer"></div>
                   <div class="skip-link" v-on:click="declineInvitation()">{{ui.dictionary.invitations.declineInvitation}}</div>
               </div>
           </div>
    
        </article>
    `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            companiesReady : false,
            options : false,
            saving : false,
            presetReasonsOptions : false
        },
        companyList : [],
        company : CompanyModel.getCompany(),
        singleCompany : JSON.parse(sessionStorage.getItem('singleCompany')) || false,
        reason: '',
        currentCompanyToAdd : null,
        confirmedConnect : false,
        presetReason : false
    });


    const methods = {
        init() {
            if (!InviteTokenModel.getInfo()) {
                this.$router.push('/account/overview');
                return false;
            } else if (this.singleCompany) {
                this.setCompany(this.singleCompany);
                return false;
            }

            var scope = this;

            document.addEventListener('clickAppBody', function() {
                scope.ui.options = false;
            });

            this.getCompanies();
        },

        selectReason(reason) {
            this.presetReason = reason;
            this.ui.presetReasonsOptions = false;
        },

        getCompanyName(string) {
            if (!InviteTokenModel.getInfo() || !InviteTokenModel.getInfo().company_name || !string || !string.replace) {
                return string;
            }

            return string.replace(':company', InviteTokenModel.getInfo().company_name).replace(':company', InviteTokenModel.getInfo().company_name);
        },

        getCompanies() {
            var scope = this;
            var companies = new CompanyCollection({ type : '_all' });
            scope.ui.companiesReady = false;

            companies.getCompanies()
                .then(function(list) {
                    scope.ui.companiesReady = true;
                    scope.companyList = list.contents;
                });
        },


        setConnectConfirmation(company) {
            this.confirmedConnect = true;
            this.setCompany(this.currentCompanyToAdd);
        },

        setConnectionDecline() {
            this.reason = 'User did not accept connection terms and conditions.';
            this.declineInvitation(true);
        },

        setCompany(company) {
            this.currentCompanyToAdd = company;

            if (!this.confirmedConnect) {
                this.showConnectConfirmDialog();
                return false;
            }

            if (!company) {
                return false;
            }
            var scope = this;

            scope.ui.saving = true;

            InviteTokenModel.setConnect(true);
            if (InviteTokenModel.getInfo()) {
                InviteTokenModel.process()
                    .then(function(res) {
                        if (res.errors) {
                            Toast.show(scope.ui.dictionary.invitations.alreadyConnected , 'warning');
                        } else {
                            Toast.show(scope.getCompanyName(scope.ui.dictionary.invitations.connectedSuccess));
                            scope.$store.dispatch('setCompany', company);
                            CompanyModel.setCompany(company);
                            EventBus.$emit('CompanySelected');
                            scope.$router.push('/account/overview');
                            InviteTokenModel.forget();
                        }

                        scope.confirmedConnect = false;
                        scope.ui.saving = false;
                    });
            }

        },

        declineInvitation(confirm) {
            if (!confirm) {
                this.$modal.show(showDeclineDialogue, {getCompanyName: this.getCompanyName, currentIndex: 0}, {height: 'auto'});
                return false;
            }

            var scope = this;
            var token = InviteTokenModel.getToken();

            InviteTokenModel.decline(token, this.reason, this.presetReason)
                .then(function() {
                    InviteTokenModel.forget();
                    Toast.show(scope.ui.dictionary.invitations.declineSubmitted);
                });

            this.$router.push('/account/overview');
        },

        createCompany() {
            this.$router.push('/account/create-company');
        },

        showConnectConfirmDialog() {
            this.$modal.show('dialog', {
                text: this.getCompanyName(this.ui.dictionary.connections.connectConfirmation),
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.connections.connectConfirmationNegative,
                        class: 'highlighted-text',
                        handler: () => {this.setConnectionDecline(); this.$modal.hide('dialog')}
                    },
                    {
                        title: this.ui.dictionary.connections.connectConfirmationPositive,
                        class: 'warning',
                        handler: () => {this.setConnectConfirmation(); this.$modal.hide('dialog')}
                    }
                ]
            })
        }
    };

    export default Vue.extend({
        template,
        data,
        methods,
        created() {
            this.init();
        }
    });
