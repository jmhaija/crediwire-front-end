    import Vue from 'Vue'
    import DictionaryModel from 'models/DictionaryModel'
    import CompanyModel from 'models/CompanyModel'
    import UserModel from 'models/UserModel'
    import ErpModel from 'models/ErpModel'
    import SharedConnectionModel from 'models/SharedConnectionModel'
    import companyList from 'elements/company-list'
    import CompanyCollection from 'collections/CompanyCollection'
    import Validator from 'services/Validator'
    import Toast from 'services/Toast'
    import EconomicSelf from 'services/EconomicSelf'
    import EventBus from 'services/EventBus'
    import Track from 'services/Track'

    const template = `
        <article>
           <header class="section-heading">{{ui.dictionary.invitations.chooseCompany}}</header>
           <section class="form">
               <company-list :ready="ui.companiesReady" :companies="companyList" noOptions="true"></company-list>
               <section class="toolbar">
                   <div class="working" v-show="ui.working"></div>
                   <button v-show="!ui.working" class="primary" v-on:click="selectCompany()">{{ui.dictionary.invitations.acceptInvitationConfirm}}</button>
               </section>
           </section>
        </article>
    `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            companiesReady : false,
            working : false
        },
        companyList : [],
        presetToken : EconomicSelf.getToken()
    });

    const methods = {
        init() {
            var scope = this;
            this.companyList = [];

            var companies = new CompanyCollection({ type : '_all' });

            companies.getCompanies()
                .then(function(list) {
                    scope.ui.companiesReady = true;
                    scope.companyList = list.contents;

                    if (scope.companyList && scope.companyList.length === 0) {
                        scope.gotoCreateCompany();
                    }
                });
        },

        selectCompany() {
            this.ui.working = true;

            ErpModel.fromCompany()
                .then(function(response) {
                    if (response.id) {
                        ErpModel.setErp(response);
                        Toast.show(this.ui.dictionary.company.alreadyConnected, 'warning');
                        this.ui.working = false;
                    } else {
                        EventBus.$emit('CompanySelected');
                        this.autoConnectEconomic(this.presetToken);
                    }
                }.bind(this));
        },

        gotoCreateCompany() {
            this.$router.push('/account/create-company');
        },

        autoConnectEconomic(token) {
            ErpModel.createConnection('e-conomic', token)
                .then(function(response) {
                    if (response.status) {
                        ErpModel.setErp(response);

                        Toast.show(this.ui.dictionary.erp.saved);

                        /**
                         * Pageview for GA conversions
                         */
                        Track.ga.setPage('erp-connected');
                        Track.ga.sendPageView();

                        this.$router.push('/account/updating');

                        EconomicSelf.forgetAll();
                    } else {
                        ErpModel.forgetErp();
                        this.$router.push('/account/company/erp');
                        Toast.show(this.ui.dictionary.erp.notsaved, 'warning');

                    }
                }.bind(this));
        }
    };

    export default Vue.extend({
        template,
        data,
        methods,
        components : {
            'company-list' : companyList
        },
        mounted() {
            this.init();
        }
    });
