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
           <p>{{getCompanyName(ui.dictionary.invitations.acceptDescriptionCompanyUser)}}</p>
    
               <div v-show="ui.saving" class="working"></div>
    
               <div v-show="!ui.saving">
                   <button class="primary" v-on:click="acceptInvitation()">{{ui.dictionary.invitations.acceptCompanyUserInvitation}}</button>
                   <div class="line-spacer"></div><div class="line-spacer"></div>
                   <div class="skip-link" v-on:click="declineInvitation()">{{ui.dictionary.invitations.declineInvitation}}</div>
               </div>
           </div>
    
        </article>
    `;

     const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            saving : false,
        },
        reason: '',
        presetReason : false
    });

    const methods = {
        getCompanyName(string) {
            if (!InviteTokenModel.getInfo() || !InviteTokenModel.getInfo().company_name || !string || !string.replace) {
                return string;
            }

            return string.replace(':company', InviteTokenModel.getInfo().company_name);
        },

        acceptInvitation() {
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
                            scope.$router.push('/account/overview');
                            InviteTokenModel.forget();
                        }

                        scope.ui.saving = false;
                    });
            }

        },

        declineInvitation(confirm) {
            if (!confirm) {
                this.$modal.show(showDeclineDialogue, {getCompanyName: this.getCompanyName, currentIndex: 1 }, {height: 'auto'});
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
