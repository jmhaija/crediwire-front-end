define([

    'Vue',
    'models/CompanyModel',
    'models/DictionaryModel',
    'models/ErpModel',
    'models/UserModel',
    'models/ContextModel',
    'models/InviteTokenModel',
    'models/BudgetModel',
    'services/EventBus',
    'services/API',
    'services/ManualRun',
    'collections/ConnectionStoreCollection',
    'store/companyMutationTypes'

], function(Vue, CompanyModel, DictionaryModel, ErpModel, UserModel, ContextModel, InviteTokenModel, BudgetModel, EventBus, API, ManualRun, ConnectionStoreCollection, companyMutationTypes) {
    /**
     * Element template
     */
    var template = `
        <article class="company-list" :class="{ active : ui.options || !ready }">
           <section v-show="!ready">
               <div class="working compact"></div>
           </section>
           <section v-show="ready">
               <div v-show="!singleCompany && (!company || !companies || companies.length === 0)">
                   <router-link to="/account/create-company">{{ui.dictionary.company.create}}</router-link>
               </div>
               <div class="selector company" v-if="company && companies && companies.length > 0 && !singleCompany">
                   <div class="label" v-on:click.stop="ui.options = true; search = ''; focusOnSearch();">
                       <span data-test-id="selectCompany" class="overflow-label" v-show="company.name">{{company.name}}</span><span v-show="!company.name">{{company.vat}}</span> <i class="cwi-down"></i>
        
                       <div class="small-text faded">
                           <span v-if="company.cvrCompanyInfo && company.cvrCompanyInfo.industryName">{{company.cvrCompanyInfo.industryName}}</span>
                           <span v-if="company.cvrCompanyInfo && company.cvrCompanyInfo.industryName && company.cvrCompanyInfo.industryCode">-</span>
                           <span v-if="company.cvrCompanyInfo && company.cvrCompanyInfo.industryCode"> - {{company.cvrCompanyInfo.industryCode}}</span>
                       </div>
        
                       <div class="options" v-bind:class="{ show : ui.options }">
                           <div class="option divider bottom" v-on:click.stop="companySettings()" v-show="!noOptions">
                               {{ui.dictionary.company.settings}}
                           </div>
        
                           <div class="filter" v-show="companies && companies.length > 10">
                               <input ref="searchinput" type="search" v-model="search" :placeholder="ui.dictionary.company.searchCompanies">
                           </div>
        
                           <div class="in-scroll">
                               <div class="option" v-bind:class="{ selected : comp.id == company.id }" v-for="comp in sortCompanies(filterCompanies(companies))" v-on:click.stop="setCompany(comp);checkUrl();setErpCompany()">
                                   <span v-show="profile.settings && profile.settings.defaultCompany && profile.settings.defaultCompany == comp.id"
                                         class="default-company active"
                                         v-on:click.stop="removeDefaultCompany(comp.id)"><i class="cwi-star-on"></i></span>
                                   <span v-show="!profile.settings || !profile.settings.defaultCompany || profile.settings.defaultCompany != comp.id"
                                         class="default-company"
                                         v-on:click.stop="addDefaultCompany(comp.id)"><i class="cwi-star-off"></i></span>
                                   <span v-show="comp.name">{{comp.name}}</span>
                                   <span v-show="!comp.name">{{comp.vat}}</span>
                               </div>
                           </div>
        
                           <div data-test-id="createCompany" class="option divider top" v-on:click.stop="createCompany()">
                               {{ui.dictionary.company.create}}
                           </div>
                       </div>
                   </div>
               </div>
               <div v-if="singleCompany">
                   <router-link to="/account/company/settings">{{company.name}}</router-link>
               </div>

           </section>
        </article>
    `

    /**
     * Data bindings
     */
    var bindings = function() {
        return {
            ui: {
                dictionary : DictionaryModel.getHash(),
                options : false
            },
            company : CompanyModel.getCompany(),
            contextChangeEvent : null,
            profile : {},
            counter : 0,
            search : ''
        };
    };


    /**
     * Methods
     */
    var methods = {
        /**
         * Initialize view
         */
        init : function() {
            var scope = this;


            /**
             * Event listeners
             */
            document.addEventListener('clickAppBody', function() {
                scope.ui.options = false;
            });

            EventBus.$on('clickAppBody', function() {
                scope.ui.options = false;
            });

            EventBus.$on('newCompanyCreated', function() {
                //scope.company = CompanyModel.getCompany();
                scope.setCompany();
            });


            EventBus.$on('connectionContextClosed', scope.handleContextClose);


            EventBus.$on('uiLanguageChanged', this.languageListener);

            EventBus.$on('CompanySettingsSaved', function() {
                scope.company = CompanyModel.getCompany();
            });

            EventBus.$on('CompanySelected', function() {
                scope.setCompany();
            });


            //document.addEventListener('contextChanged', this.setErp);
            this.contextChangeEvent = document.createEvent('Event');
            this.contextChangeEvent.initEvent('contextChange', true, true);
        },

        languageListener() {
            this.ui.dictionary = DictionaryModel.getHash();
        },

        focusOnSearch : function() {
            setTimeout(function() {
                this.$refs.searchinput.focus();
            }.bind(this), 250);
        },

        filterCompanies : function(companies) {
            var list = companies.slice();

            if (this.search.length === 0) {
                return list;
            }

            return list.filter(function(company) {
                var searchStrings = this.search.split(' ');
                var found = false;

                for (var i = 0; i < searchStrings.length; i++) {
                    if (searchStrings[i].length > 0 && company.name && company.name.toLowerCase().indexOf(searchStrings[i].toLowerCase()) >= 0) {
                        found = true;
                    }
                }

                return found;
            }, this);
        },

        sortCompanies : function (companies) {
            var list = companies.slice();

            return list.sort(function(a, b) {
                if (a.name === null) {
                    if (b.name == null) {
                        return 0;
                    }

                    return 1;
                }

                if (b.name === null) {
                    if (a.name == null) {
                        return 0;
                    }

                    return -1;
                }

                return a.name.toLocaleLowerCase()>b.name.toLocaleLowerCase()? 1 : (a.name.toLocaleLowerCase()<b.name.toLocaleLowerCase() ? -1 : 0);
            });
        },

        addDefaultCompany : function (id) {
            if (!this.profile.settings.defaultCompany) {
                this.profile.settings.defaultCompany = null;
            }

            this.profile.settings.defaultCompany = id;
            this.saveProfile();
        },

        removeDefaultCompany : function (id) {
            this.profile.settings.defaultCompany = null;
            this.saveProfile();
        },


        saveProfile : function () {
            this.counter++;
            UserModel.profile(this.profile);
            UserModel.save();
        },

        checkUrl : function() {
            if (this.$route.query.hide_list) {
                this.$router.replace(this.$route.path);
                sessionStorage.removeItem('hideConnectionList');
            }
        },

        handleContextClose : function() {
            this.setCompany(this.company, true);
        },

        companyInList : function(company) {
            var found = false;

            this.companies.forEach(function(listedCompany) {
                if (listedCompany.id == company.id || listedCompany.id == company) {
                    found = true;
                }
            });

            return found;
        },


        getCompanyById : function(id) {
            var found = false;

            this.companies.forEach(function(listedCompany) {
                if (listedCompany.id == id) {
                    found = listedCompany;
                }
            });

            return found;
        },

        /**
         * Set company
         */
        setCompany : function(newComp, ignoreClearSession) {
            API.abortAllPendingRequests();
            this.profile = UserModel.profile();
            ManualRun.resetJobs();

            if (newComp) {
                this.company = newComp;
            } else if ( !this.singleCompany && CompanyModel.getCompany() && this.companyInList(CompanyModel.getCompany()) ) {
                this.company = CompanyModel.getCompany();
            } else if (this.profile.settings && this.profile.settings.defaultCompany && this.companyInList(this.profile.settings.defaultCompany)) {
                this.company = this.getCompanyById(this.profile.settings.defaultCompany);
            } else if (this.companies[0]) {
                this.company = this.companies[0];
            }

            if (!ignoreClearSession) {
                ConnectionStoreCollection.remove();
            }

            CompanyModel.setCompany(this.company, this.$store);
            this.ui.options = false;
            EventBus.$emit('companyContextChanged');
            EventBus.$emit('notificationsReadyToLoad');

            if (this.entryDepartmentsEnabled) {
                EventBus.$emit('getEntryDepartments')
            }


            //Set off new company ERP
            if (this.company) {
                this.setErp(ignoreClearSession);
                //Get contextual user permissions
                this.getCompanyUserInfo();
            }
        },

        /**
         * Redirect to create company view
         */
        createCompany : function() {
            this.ui.options = false;
            this.$router.push('/account/create-company');
        },

        /**
         * Redirect to company settings view
         */
        companySettings : function() {
            this.ui.options = false;
            this.$router.push('/account/company/settings');
            EventBus.$emit('selectCompany', true);
        },

        /**
         * Set ERP
         */
        setErp : function(ignoreClearSession) {
            var scope = this;
            const { SET_REDIRECT_TO_CONNECTIONS, SET_REDIRECT_TO_OVERVIEW } = companyMutationTypes;
            ErpModel.setErp('loading');
            EventBus.$emit('companyErpChanged');

            ErpModel.fromCompany()
                .then(function(response) {
                    if (response.errors) {
                        scope.$store.dispatch('setRedirectToConnections', true);
                    }
                    if (response.id) {
                        ErpModel.setErp(response);
                        scope.$store.dispatch('setRedirectToConnections', false);
                        BudgetModel.getStatus()
                            .then(function(res) {
                                if (res && res.latest_date) {
                                    BudgetModel.setLastBudgetDate(res.latest_date);
                                }
                            });

                    } else if (response == 'forbidden') {
                        ErpModel.setErp(response);
                        BudgetModel.setLastBudgetDate(false);
                    } else {
                        ErpModel.forgetErp();

                        //Redirect to connections if on overview and there is no ERP
                        if (!ignoreClearSession && (scope.$route.path === '/account/overview') && scope.company.settings && scope.company.settings.invitation_metric && !InviteTokenModel.getInfo()) {
                            scope.$router.push('/account/invitation-metrics');
                        } else if ( (scope.$route.path === '/account/overview' || scope.$route.path === '/account/overview/generaloverview' || scope.$route.path === '/account/overview/trialbalance' || scope.$route.path === '/account/overview/financialreport' || scope.$route.path === '/account/overview/budget' || scope.$route.path === '/account/overview/invoices') && (!ContextModel.getContext() || (ContextModel.getContext() && ContextModel.getContext().erp == 'e-conomic-admin-parent')) ) {
                            scope.$store.dispatch('setRedirectToOverview', false);
                            scope.$store.dispatch('setRedirectToConnections', true);
                            scope.$router.push('/account/connections?r=1');
                        }

                        BudgetModel.setLastBudgetDate(false);
                    }

                    EventBus.$emit('companyErpChanged');

                    if (!ignoreClearSession && scope.$route.path != '/account/company/mapping' && scope.company.settings && scope.company.settings.invitation_metric && !InviteTokenModel.getInfo()) {
                        scope.$router.push('/account/invitation-metrics');
                    }


                    if ( scope.$route.path == '/account/company/delete-company' && response.id ) {
                        scope.$router.push('/account/overview');
                    } else if (scope.$route.path == '/account/company/delete-company') {
                        scope.$router.push('/account/connections?r=1');
                    }
                });
        },

        /**
         * Get user permissions
         */
        getCompanyUserInfo : function() {
            var scope = this;

            UserModel.fetchCompanyUserInfo()
                .then(function(userInfo) {
                    UserModel.setCompanyUserInfo(userInfo);

                    if (userInfo.id && (!userInfo.permissionType || userInfo.permissionType == 'limited')) {
                        UserModel.getDashboardPermissions()
                            .then(function(res) {
                                if (res.contents) {
                                    userInfo.dashboardPermissions = res.contents;
                                    UserModel.setCompanyUserInfo(userInfo);
                                }

                                EventBus.$emit('companyUserChanged');
                                document.dispatchEvent(scope.contextChangeEvent);
                            });
                    } else {
                        EventBus.$emit('companyUserChanged');
                        document.dispatchEvent(scope.contextChangeEvent);
                    }

                    if (scope.readyCallback) {
                        scope.readyCallback();
                    }
                });
        },

        setErpCompany : function () {
            this.$store.dispatch('selectCompany', true);
            this.$store.dispatch('setActiveFinReport', false);
            this.$store.dispatch('setActiveBudget', false);
            EventBus.$emit('selectCompany', true);
        }
    };

    const computed = {
        entryDepartmentsEnabled() {
            const context = ContextModel.getContext();
            const company = context ? context.company : CompanyModel.getCompany();
            return company?.settings?.entry_department && this.profile?.roles?.indexOf && this.profile.roles.indexOf('entry_department_role') >= 0
        }
    }

    return Vue.extend({
        template : template,
        data : bindings,
        computed,
        methods : methods,
        props : ['ready', 'companies', 'singleCompany', 'readyCallback', 'noOptions'],
        watch : {
            ready : function(val) {
                if (val) {
                    this.init();
                    this.setCompany();
                }
            }
        },
        beforeDestroy : function() {
            EventBus.$off('clickAppBody');
            EventBus.$off('newCompanyCreated');
            EventBus.$off('connectionContextClosed');
            EventBus.$off('uiLanguageChanged', this.languageListener);
        }
    });
});
