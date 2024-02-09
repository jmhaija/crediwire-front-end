    import Vue from 'Vue'
    import AccountCollection from 'collections/AccountCollection'
    import DictionaryModel from 'models/DictionaryModel'
    import ErpModel from 'models/ErpModel'
    import UserModel from 'models/UserModel'
    import CompanyModel from 'models/CompanyModel'
    import ContextModel from 'models/ContextModel'
    import featuresSlides from 'components/featuresSlides.vue'
    import loadingBar from 'components/loadingBar.vue'
    import updatingDataModal from 'elements/modals/updating-data'
    import EventBus from 'services/EventBus'

    const template = `
        <article >
           <section>

               <div>
                    <features-slides></features-slides>
                  <div class="loading-data">
                       <p class="status-text">{{ui.dictionary.accounts.gatheringData}}</p>
                       <loading-bar :percent="percent"></loading-bar>
                       <p class="tour-text">{{ui.dictionary.accounts.tiredOfWaiting}}</p>
                       <button
                            data-test-id="gatheringDataTakeTourButton"
                            v-show="this.permissions && this.permissions.owner"
                            class="tour-button"
                            v-on:click="requestTour()"
                        >{{ui.dictionary.accounts.productTour}}</button>
                   </div>
               </div>

               <div v-show="ui.partiallyMapped" class="splash">
                   <h1>{{ui.dictionary.accounts.crediwireAccounts}}</h1>
                   <p v-show="profile.roles.indexOf('accountant') < 0">{{ui.dictionary.accounts.automapPartial}}</p>
                   <p v-show="profile.roles.indexOf('accountant') >= 0">{{ui.dictionary.accounts.automapPartialAccountant}} <router-link to="/account/company/mapping">{{ui.dictionary.accounts.clickHere}}</router-link>.</p>
                   <p><button class="primary" v-on:click="gotoOverview()">{{ui.dictionary.company.updating.gotoOverview}}</button></p>
               </div>
           </section>
        </article>
    `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            working : true,
            partiallyMapped : false
        },
        erpIntervalHandler : false,
        erpInterval : 10000,
        accounts : {},
        profile : UserModel.profile(),
        percent : 2,
        factor : 0,
        decreaseBy : 2,
        maxIncrease : 20,
        timeout : 3000,
        timeoutIncrease : 250,
        stopAt : 96,
        permissions : ContextModel.getContext() || UserModel.getCompanyUserInfo()
    });


    const methods = {
        init() {
            this.checkErp();
            this.loadProgress();

            if (this.profile.settings.fromLandingPage) {
                this.setDelayedPopup();
            }
        },

        setDelayedPopup() {
            setTimeout(function () {
                if (!ErpModel.getErp().fetchData && this.$route.path == '/account/updating') {
                    this.$modal.show(updatingDataModal, {}, {height: 'auto'});
                    ErpModel.sendSyncNotification();
                }
            }.bind(this), 1000 * 60 * 3);
        },

        loadProgress() {
            setTimeout(function() {
                var random = Math.floor((Math.random() * (this.maxIncrease - this.factor) ) + 1);
                if ( (this.percent + random) > 100) {
                    this.percent = 100;
                } else if ( (this.percent + random) > this.stopAt) {
                    this.percent = this.stopAt;
                } else {
                    this.percent += random;
                    this.loadProgress();
                }

                if (this.factor < (this.maxIncrease - this.decreaseBy)) {
                    this.factor += this.decreaseBy;
                } else {
                    this.factor = this.maxIncrease - this.decreaseBy;
                    this.timeout += this.timeoutIncrease;
                }
            }.bind(this), this.timeout);
        },

        checkErp() {
            var scope = this;

            this.erpIntervalHandler = setInterval(function() {
                ErpModel.fromCompany()
                    .then(function(response) {
                        if (response.fetchData || response.updatable) {
                            ErpModel.setErp(response);
                            clearInterval(scope.erpIntervalHandler);
                            scope.getAccounts();
                        } else if (response.errors && response.errors[0] && response.errors[0].type == 'ResourceNotFound') {
                            scope.$router.push('/account/company/erp');
                        }
                    });
            }, this.erpInterval);
        },

        getAccounts() {
            var scope = this;
            var accounts = new AccountCollection();

            scope.ui.working = true;

            accounts.getAccounts()
                .then(function(res) {
                    if (res.success) {
                        scope.accounts = res.data;
                        scope.checkMapping();
                    }

                    scope.ui.working = false;
                });
        },

        checkMapping() {
            if (this.isPartiallyMapped()) {
                this.ui.partiallyMapped = true;
            } else {
                setTimeout(function() {
                    if (this.$route.path == '/account/updating') {
                        this.$router.push('/account/overview/generaloverview');
                    }
                }.bind(this), this.timeout);
            }

            this.percent = 100;
        },

        gotoOverview() {
            this.$router.push('/account/overview');
        },

        isPartiallyMapped() {
            var partial = false;

            this.accounts.chartOfAccounts.forEach(function(account) {
                if (account.type == 'pal' || account.type == 'bal') {
                    partial = true;
                }
            });

            return partial;
        },

        requestTour() {
            EventBus.$emit('requestRMTutorial');
        }
    };

    export default Vue.extend({
        template,
        data,
        methods,
        components : {
            'features-slides' : featuresSlides,
            'loading-bar' : loadingBar
        },
        created() {
            this.init();
        },
        beforeDestroy() {
            clearInterval(this.erpIntervalHandler);
        }
    });
