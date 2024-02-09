define([

    'Vue',
    'moment',
    'models/DictionaryModel',
    'models/CompanyModel',
    'models/ContextModel',
    'models/UserModel',
    'models/ErpModel',
    'models/SharedConnectionModel',
    'models/SeeConnectionModel',
    'models/AssetModel',
    'models/DateRangeModel',
    'models/PartnerModel',
    'collections/ConnectionCollection',
    'collections/LanguageCollection',
    'collections/DepartmentCollection',
    'elements/connection-grid',
    'elements/tutorial-slide',
    'services/Validator',
    'services/PersistentSettings',
    'services/Toast',
    'services/EventBus',
    'services/Tutorial',
    'services/Track',
    'elements/invite-user-settings',
    'elements/date-field',
    'elements/modals/modal',
    'elements/modals//manage-account-modal',
    'elements/modals/add-new-connection',
    'models/CompanyUserInvitationModel',
    'models/UniqueConnectionModel',
    'collections/ConnectionStoreCollection',
    'elements/modals/invite-to-crediwire',
    'elements/modals/connection-settings',
    'mixins/addConnectionMixin',
    'store/connectionsMutationTypes',
    'store/companyMutationTypes'
], function(Vue, moment, DictionaryModel, CompanyModel, ContextModel, UserModel, ErpModel, SharedConnectionModel, SeeConnectionModel, AssetModel, DateRangeModel, PartnerModel,
            ConnectionCollection, LanguageCollection, DepartmentCollection, connectionGrid, tutorialSlide, Validator, PersistentSettings,
            Toast, EventBus, Tutorial, Track, inviteUserSettings, dateField, modal, manageAccountModal, addNewConnection,
            CompanyUserInvitationModel, UniqueConnectionModel, ConnectionStoreCollection, inviteToCrediwire, connectionSettings, addConnectionMixin, connectionsMutationTypes, companyMutationTypes) {
    /**
     * View template
     */
    var template = [
        '<article class="connections" ref="connections">',

        /**
         * Connection list
         */
        '   <section class="working" v-show="ui.loading"></section>',

        '   <section v-show="forbidden">',
        '       {{ui.dictionary.general.forbidden}}',
        '   </section>',

        `   <section
                data-test-id="connectionsSplash"
                class="splash"
                v-show="!ui.loading && ( (connections.all && connections.all.length === 0) || ui.hideConnectionsForTutorial) &&  !forbidden"
            >`,
        '       <h1>{{ui.dictionary.connections.splash.title}}</h1>',
        '       <p>{{ui.dictionary.connections.splash.text}}</p>',

        '       <v-popover :open="showConnectionAddTutorial()" placement="bottom">',
        '           <button class="primary" v-on:click="addNewConnectionModal()" v-show="permissions.owner || permissions.permissionType == \'full\' || (permissions.permissionType == \'extended\' && connectionType == \'see\') || permissions.companyConnectionAccess">{{ui.dictionary.connections.splash.action}}</button>',
        '           <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>',
        '       </v-popover>',
        '   </section>',

        '   <section v-show="!ui.loading && connections.all && connections.all.length > 0 && !forbidden && !ui.hideConnectionsForTutorial">',


        '       <div class="search input-field" ref="filtersearch" v-show="!isNordea">',
        '           <input type="text" id="search-field" v-on:keyup="searchConnections($event)">',
        '           <label v-bind:class="{ filled: ui.search.length > 0 }">{{ui.dictionary.connections.search}}</label>',

        '           <div class="add" v-on:click="addNewConnectionModal()" v-show="permissions.owner || permissions.permissionType == \'full\' || permissions.permissionType == \'extended\' || permissions.companyConnectionAccess">',
        '               {{ui.dictionary.connections.add}} <i class="cwi-add"></i>',
        '           </div>',
        '       </div>',


        '       <div v-if="connections.all && connections.all.length && !isNordea" class="faded float-right no-margin">{{ui.dictionary.connections.totalConnections}}: {{connections.all.length}}</div>',

        '       <div class="sort" v-show="!isNordea">',
        '           {{ui.dictionary.connections.sortBy}}',
        '           <select v-on:change="sortParam($event)" :style="{ backgroundImage : getDropdownArrow() }"><option value="name">{{ui.dictionary.connections.name}}</option><option value="created" :selected="sort.param == \'created\'">{{ui.dictionary.connections.created}}</option><option value="activity" :selected="sort.param == \'activity\'">{{ui.dictionary.connections.activity}}</option><option v-show="profile.roles.indexOf(\'admin\') >= 0" value="source" :selected="sort.param == \'source\'">{{ui.dictionary.connections.source}}</option></select>',
        '           {{ui.dictionary.connections.in}}',
        '           <select v-on:change="sortOrder($event)" :style="{ backgroundImage : getDropdownArrow() }"><option value="asc">{{ui.dictionary.connections.asc}}</option><option value="desc" :selected="sort.order == \'desc\'">{{ui.dictionary.connections.desc}}</option></select>',
        '           <span v-show="profile.roles.indexOf(\'department_role\') >= 0">',
        '               {{ui.dictionary.connections.in}}',
        '               <select v-model="departmentFilter" :style="{ backgroundImage : getDropdownArrow() }"><option value="all">{{ui.dictionary.connections.allDepartments}}</option><option v-for="dept in departments" :value="dept.id">{{dept.name}}</option><option :value="null">{{ui.dictionary.connections.noDepartment}}</option></select>',
        '           </span>',
        '           {{ui.dictionary.connections.show}}',
        '           <select v-model="validationFilter" :style="{ backgroundImage : getDropdownArrow() }"><option value="all">{{ui.dictionary.connections.all}}</option><option value="validated">{{ui.dictionary.connections.validated}}</option><option value="notvalidated">{{ui.dictionary.connections.notValidated}}</option></select>',
        '       </div>',

        '       <div v-show="!isNordea">',
        '           <connection-grid :departmentFilter="departmentFilter" :validationFilter="validationFilter" :search="ui.search" :connections="connections" :sort="sort" :portfolio="portfolio" :connectionType="connectionType" :connectionFilter="connectionFilter" :showSettings="showSettings" :permissions="permissions" :showDeleteConfirmation="showDeleteConfirmation" :showRevokeConfirmation="showRevokeConfirmation" :approveConnection="approveConnection" :declineConnection="declineConnection" :openOverview="openOverview" :departments="departments"></connection-grid>',
        '       </div>',

        '       <div v-show="isNordea" class="splash">',
        '           <p>{{ui.dictionary.connections.nordeaConnectionNotFound}}</p>',
        '           <div class="form" style="margin: 0 auto;">',
        '               <form v-on:submit.prevent="redirectToVat(nordea.vat)">',


        '                   <v-popover :open="showEnterVatToSearch()" placement="left"  class="blocker">',
        '                       <div class="input-field">',
        '                           <input type="text" v-model="nordea.vat" v-bind:class="{ invalid : !nordea.valid }" v-on:keyup="validateVatNordea()" v-on:blur="validateVatNordea(true)">',
        '                           <label v-bind:class="{ filled: nordea.vat.length > 0 }">{{ui.dictionary.company.vat}}</label>',
        '                           <div class="warning" v-bind:class="{ show : !nordea.valid }">{{ui.dictionary.general.validation.vat8}}</div>',
        '                           <div class="warning" v-bind:class="{ show : nordea.valid && nordea.vat.length > 0 && nordea.notfound }">{{ui.dictionary.connections.connectionNotFound}}</div>',
        '                       </div>',
        '                       <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>',
        '                   </v-popover>',



        '                   <div class="toolbar" style="margin-top: -4rem;">',
        '                       <v-popover :open="showClickGoToSearch()" placement="right">',
        '                           <button type="submit" class="primary">{{ui.dictionary.general.go}}</button>',
        '                           <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>',
        '                       </v-popover>',
        '                   </div>',


        '               </form>',
        '           </div>',
        '       </div>',

        '   </section>',
        '</article>'
    ].join("\n");

    /**
     * Data bindings
     */
    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                loading : true,
                search : '',
                specifiedConnectionNotFound : false,
                hideConnectionsForTutorial : false,
                chooseClientFlowDialog : false,
                clientFlowOptions : false
            },
            connectionType : 'see',
            addConnectionType : 'see',
            connectionFilter : 'all',
            departmentFilter : 'all',
            validationFilter : 'all',
            connections : false,
            started : false,
            portfolio : [],
            company : null,
            currentConnection : null,
            rawConnections : [],
            invitation: {
                name : { value : '', valid : true },
                email : { value : '', valid : true },
                vat : { value : '', valid : true },
                language : DictionaryModel.getLanguage(),
                reminders : false
            },
            langOptions : [],
            permissions : UserModel.getCompanyUserInfo(),
            profile : UserModel.profile(),
            sort : {
                param : 'created',
                order: 'desc',
                showParam : false,
                showOrder : false
            },
            startedRequest : false,
            searchTimer : null,
            textboxReference : null,
            redirectAfterSettings : false,
            partner : PartnerModel.getPartner(),
            currentLink : null,
            forbidden : false,
            isNordea : sessionStorage.getItem('hideConnectionList') ? true : false, //CompanyModel.getCompany() && CompanyModel.getCompany().id && CompanyModel.getCompany().id == '88e3f6bf-6448-45f3-a674-63d469f0735c',
            nordea : {
                vat : '',
                valid : true,
                notfound : false
            },
            erp : ErpModel.getErp(),
            client : {
                started : false,
                adding : false,
                name : { value: '', valid : true, error : false},
                vat : { value: '', valid : true, error : false},
                agreement : { value: '', valid : true, error : false},
                company : { obj : null, completed : false },
                connection : { obj : null, completed : false },
                erp : { obj : null, completed : false },
                requiresOwnerApproval : false
            },
            thisCompany : CompanyModel.getCompany(),
            tutorial : Tutorial,
            connectionTutorialReady : false,
            invitationTutorialReady : false,
            confirmedConnect : false,
            currentCompanyToAdd : null,
            userInvitation : {
                name : { value : '', valid : true },
                email : { value : '', valid : true },
                permissionType : 'extended',
                kpiDefinitionAccess : false,
                companyConnectionAccess : false,
                shareAllDashboards : false,
                language : DictionaryModel.getHash().meta.code,
                validFrom : null,
                validTo : null,
                make_owner : false,
                remove_inviter : false
            },
            connectionCompanyIDs : [],
            errors : {
                existsVat : false,
                existsName : false
            },
            departments : []
        };
    };

    /**
     * Methods
     */
    var methods = {
        /**
         * Initialize the view
         */
        init : function() {
            /**
             * Set connection type and filter
             */
            this.connectionType = this.$route.meta.connectionType;
            this.addConnectionType = this.$route.meta.connectionType;
            this.connectionFilter = this.$route.meta.filter;
            this.langOptions = LanguageCollection.getList();
            EventBus.$on('getCompanyFromConnection', (company) => {
               this.setConnectConfirmation(company);
            });

            EventBus.$on('setConnectionConfirm', (company) => {
                company.connectionType ? this.addConnectionType = company.connectionType : '';
                this.addConnection(company.company, company.confirmed);
            });

            /**
             * Get portfolio
             */
            if (UserModel.getCompanyUserInfo().settings && UserModel.getCompanyUserInfo().settings.portfolio && Array.isArray(UserModel.getCompanyUserInfo().settings.portfolio)) {
                this.portfolio = UserModel.getCompanyUserInfo().settings.portfolio || [];
            }

            /**
             * Event listeners
             */
            //EventBus.$on('companyContextChanged', this.getConnections);
            EventBus.$on('companyUserChanged', this.updatePermissions);
            EventBus.$on('companyErpChanged', this.updateErp);
            EventBus.$on('click', this.closeMenus);
            EventBus.$on('endRMTutorial', this.removeMockConnection);
            //EventBus.$on('continueRMTutorial', this.continueRMTutorial);
            document.addEventListener('clickAppBody', this.closeMenus);

            if (this.ui.dictionary.meta.alphabet.indexOf('_') < 0) {
                this.ui.dictionary.meta.alphabet.push('_');
            }

            if (this.ui.dictionary.meta.alphabet.indexOf('pending') < 0) {
                this.ui.dictionary.meta.alphabet.unshift('pending');
            }

            if (this.ui.dictionary.meta.alphabet.indexOf('all') < 0) {
                this.ui.dictionary.meta.alphabet.push('all');
            }

            if (this.permissions) {
                this.getConnections(true);
            }

            EventBus.$on('startTutorial', this.addMockConnection);
            EventBus.$on('tutorialEndUIReady', this.cleanUpTutorialState);
            this.getDepartments();

            EventBus.$emit('clearConnectionContext');
        },

        getDepartments : function () {
            DepartmentCollection.getDepartments()
                .then(function (res) {
                    if (res._embedded && res._embedded.items && res._embedded.items.length > 0) {
                        this.departments = res._embedded.items;
                    }
                }.bind(this));
        },

        cleanUpTutorialState : function() {
            if (this.profile.roles.indexOf('accountant') >= 0) {
                this.$modal.hide(addNewConnection);
                this.$modal.hide(inviteToCrediwire);
              //  this.$modal.show(inviteToCrediwire, {}, {height: 'auto'});
            }
        },

        openClientConnection : function() {
            EventBus.$emit('newCompanyCreatedRefresh');
            this.openOverview(this.client.connection.obj, true);
        },

        initBankrupcyFlow : function () {
            this.ui.chooseClientFlowDialog = false;
            this.client.requiresOwnerApproval = false;
            this.$modal.show(manageAccountModal, {client: this.client,
                errors: this.errors, requiresOwnerApproval: this.client.requiresOwnerApproval}, {height: 'auto'});
        },

        initApprovalFlow : function () {
            this.ui.chooseClientFlowDialog = false;
            this.client.requiresOwnerApproval = true;
            this.$modal.show(manageAccountModal, {client: this.client,
                errors: this.errors, requiresOwnerApproval: this.client.requiresOwnerApproval}, {height: 'auto'});
        },

        gotoErp : function() {
            this.$router.push('/account/company/erp');
        },


        showEnterVatToSearch : function() {
            return this.tutorial.current && this.tutorial.current.name == 'enterVatToSearch' && !this.tutorial.state.loading && !this.tutorial.state.finished;
        },

        showClickGoToSearch : function() {
            return this.tutorial.current && this.tutorial.current.name == 'clickGoToSeeData' && !this.tutorial.state.loading && !this.tutorial.state.finished;
        },

        showConnectionAddTutorial : function() {
            if (this.tutorial.current && this.tutorial.current.name == 'connectionAdd' && !this.tutorial.state.loading && !this.tutorial.state.finished) {
                this.closeAddNewConnection();
                this.removeMockConnection();
                this.connectionTutorialReady = false;
                return true;
            }

            return false;
        },

        newConnectionDialogTutorial : function() {
            if (this.tutorial.current && this.tutorial.current.name === 'findCompany' && !this.tutorial.state.loading && !this.tutorial.state.finished) {
                this.$modal.hide(inviteToCrediwire);
                this.$modal.show(addNewConnection, {},{height: 'auto'});
                setTimeout(function() {
                    this.connectionTutorialReady = true;
                }.bind(this), 500);

                if (this.connectionTutorialReady) {
                    return true;
                }
            }

            return false;
        },

        showInviteFieldTutorialName : function() {
            if (this.tutorial.current && this.tutorial.current.name === 'invitationNameInput' && !this.tutorial.state.loading && !this.tutorial.state.finished) {
                this.closeAddNewConnection();
                this.$modal.show(inviteToCrediwire, {}, {height: 'auto'});

                setTimeout(function() {
                    this.invitationTutorialReady = true;
                }.bind(this), 500);

                if (this.invitationTutorialReady) {
                    return true;
                }
            }

            return false;
        },

        showInvitationPopupTutorial : function() {
            this.ui.showInvitationButtonTutorial = false;
            this.$modal.hide(addNewConnection);
            this.$modal.show(inviteToCrediwire, {}, {height: 'auto'});

            setTimeout(function() {
                this.ui.showInviteFieldTutorialName = true;
            }.bind(this), 500);
        },

        inviteTutorialEmail : function() {
            this.ui.showInviteFieldTutorialName = false;
            this.ui.showInviteFieldTutorialEmail = true;
        },

        inviteTutorialVat : function() {
            this.ui.showInviteFieldTutorialEmail = false;
            this.ui.showInviteFieldTutorialVat = true;
        },

        inviteTutorialSubmit : function() {
            this.ui.showInviteFieldTutorialVat = false;
            this.ui.showInviteFieldTutorialSubmit = true;
        },

        startInvitationTutorial : function() {
            this.ui.newConnectionDialogTutorial = false;
            this.ui.showInvitationButtonTutorial = true;
        },

        rmTutorialShowConnectionDialog : function() {
            this.ui.showConnectionAddTutorial = false;
            setTimeout(function() {
                this.$modal.show(addNewConnection, {},{height: 'auto'});
            }.bind(this), 500);
        },

        finishRMTutorial : function() {
            this.ui.showConnectionAddTutorial = false;
            this.ui.newConnectionDialogTutorial = false;
            this.ui.showInvitationButtonTutorial = false;
            this.ui.showInviteFieldTutorialName = false;
            this.ui.showInviteFieldTutorialEmail = false;
            this.ui.showInviteFieldTutorialVat = false;
            this.ui.showInviteFieldTutorialSubmit = false;
            EventBus.$emit('endRMTutorial');
        },

        addMockConnection : function() {
            this.ui.loading = true;

            var newConnection = {
                mock : true,
                approved : true,
                company : {
                    erp : {
                        connected : true,
                        created : "2017-04-07T02:01:23Z",
                        currency : "DKK",
                        currentMapping : null,
                        currentMappingValidity : true,
                        dateFrom : "2012-01-01T00:00:00Z",
                        dateTo : "2012-12-31T00:00:00Z",
                        erp : "e-conomic",
                        firstYearDateFrom : "2011-01-01T00:00:00Z",
                        firstYearDateTo : "2011-12-31T00:00:00Z",
                        id : "085b414a-d86f-4c7c-bf0b-1435586aff0a",
                        kpiMapHash : "68dc45e1cfca7d4f6ae7af1e66e99299a96a3297",
                        latestDate : "2015-07-23T00:00:00Z",
                        mappingUpToDate : true,
                        newUnvalidatedAccount : false,
                        parent : null
                    },
                    id : "a89ac61e-9d78-4911-9386-37711b842a19",
                    logo : null,
                    name : "ABC Company",
                    officialIndustryCode : null,
                    officialName : null,
                    owner : "5e1a4ee1-5893-4851-a04a-89ae56c7bf2c",
                    parentCompany : null,
                    settings : {
                        invitation_metric : false
                    },
                    vat : "230597350",
                    verifications : []
                },
                created : "2017-05-01T20:54:39Z",
                department : null,
                id : "97f1a528-bca7-46cf-9208-65e3534f3e17",
                kpiDefinitionAccess : false,
                new : false,
                permissionType : "extended",
                processed : true,
                shareAllDashboards : false
            };

            this.connections = {
                all : [],
                a : []
            };
            this.connections.all.push(newConnection);
            this.connections.a.push(newConnection);
            this.ui.loading = false;
            this.sort.order = 'asc';
            this.sort.order = 'desc';
        },


        removeMockConnection : function() {
            this.ui.hideConnectionsForTutorial = true;
            /**
            this.connections.all = [];
            this.connections.a = [];
            this.sort.order = 'asc';
            this.sort.order = 'desc';
            */
        },

        validateVatNordea : function(force) {
            if (force || !this.nordea.valid) {
                this.nordea.valid = Validator.vat(this.nordea.vat) && Validator.maxLength(this.nordea.vat, 8);
            }

            return this.nordea.valid;
        },

        redirectToVat : function(vat) {
            if (!this.validateVatNordea(true)) {
                return false;
            }

            window.location.href = '/account/connections/all?hide_list=true&vat='+vat;
        },

        updatePermissions : function() {
            this.permissions = UserModel.getCompanyUserInfo();
            this.getConnections();
            this.getDepartments();
            this.isNordea = sessionStorage.getItem('hideConnectionList') ? true : (this.$route.query.hide_list ? true : false); //CompanyModel.getCompany() && CompanyModel.getCompany().id && CompanyModel.getCompany().id == '88e3f6bf-6448-45f3-a674-63d469f0735c';

            if (this.isNordea) {
                sessionStorage.setItem('hideConnectionList', JSON.stringify(true));
            }

            this.erp = ErpModel.getErp();
        },

        updateErp : function() {
            this.thisCompany = CompanyModel.getCompany();
            this.erp = ErpModel.getErp();
        },


        getDropdownArrow : function() {
            var path = new AssetModel('/assets/img/elements/arrow-down.png').path;
            return 'url(' + path + ')';
        },


        showRevokeConfirmation : function(connection) {
            this.currentConnection = connection;
            this.revokeConfirmation();
        },

        showDeleteConfirmation : function(connection) {
            this.currentConnection = connection;
            this.showDeleteDialog(this.currentConnection);
        },

        searchConnections : function(event) {
            Track.am.log('SEARCH_CONNECTIONS_BY_NAME_VAT');
            var scope = this;

            if (this.searchTimer) {
                clearTimeout(this.searchTimer);
                this.searchTimer = null;
            }

            this.searchTimer = setTimeout(function() {
                scope.ui.search = event.target.value;
                scope.textboxReference = event.target;
            }, 500);
        },

        sortParam : function(event) {
            var scope = this;

            setTimeout(function() {
                scope.sort.param = event.target.value;

                if (scope.textboxReference) {
                    scope.textboxReference.value = '';
                }
                scope.ui.search = '';
            }, 100);

            //sessionStorage.setItem('connections.sort.param', param);
            //this.sort.showParam = false;
        },

        sortOrder : function(event) {
            var scope = this;

            setTimeout(function() {
                scope.sort.order = event.target.value;

                if (scope.textboxReference) {
                    scope.textboxReference.value = '';
                }
                scope.ui.search = '';
            }, 100);

            //sessionStorage.setItem('connections.sort.order', order);
            //this.sort.showOrder = false;
        },

        validateClientAgreement : function(force) {
            if (force || !this.client.agreement.valid) {
                this.client.agreement.valid = this.client.agreement.value.length > 3;
            }

            return this.client.agreement.valid;
        },

        highlightTextbox : function(id) {
            var query = '#invitelink';
            var i = this.$refs.invitations.querySelector(query);

            i.select();
        },

        getConnections : function(onInit) {
            if (Tutorial.state.started && !Tutorial.state.finished) {
                this.addMockConnection();
                return false;
            }

            this.permissions = UserModel.getCompanyUserInfo();
            this.ui.specifiedConnectionNotFound = false;

            if (!CompanyModel.getCompany()
                || !this.permissions.id) {

                //EventBus.$on('companyUserChanged', this.getConnections);
                return false;
            }

            if (this.$route.path == '/account/connections/shared' && !CompanyModel.getCompany().owned) {
                this.$router.push('/account/connections/all');
                return false;
            }

            this.ui.loading = true;

            var scope = this;

            if (this.profile.roles.indexOf('admin') >= 0) {
                this.sort.param = PersistentSettings.getItem('connections-sort-param') || 'created';
                this.sort.order = PersistentSettings.getItem('connections-sort-order') || 'desc';
            } else {
                this.sort.param = PersistentSettings.getItem('connections-sort-param') || 'name';
                this.sort.order = PersistentSettings.getItem('connections-sort-order') || 'asc';
            }

            this.connections = false;
            this.rawConnections = [];
            this.startedRequest = true;
            this.forbidden = false;

            //From memory
            if (ConnectionStoreCollection.get() && this.getLastConnectionType === this.connectionType) {
                scope.rawConnections = ConnectionStoreCollection.get();
                scope.categorize(ConnectionStoreCollection.get());

                if (scope.connectionSpecified()) {
                    scope.openSpecifiedConnection();
                } else {
                    scope.ui.loading = false;
                }

                return false;
            }


            //From API
            var connections = new ConnectionCollection(this.connectionType);
            connections.getConnections(false, (this.profile.roles.indexOf('admin') >= 0) )
                .then(function(list) {
                    if (!list) {
                        scope.forbidden = true;
                    } else if (!list.errors && list.contents) {
                        //Get permissions again
                        scope.portfolio = UserModel.getCompanyUserInfo().settings.portfolio || [];

                        if (list.contents) {
                            scope.rawConnections = list.contents;
                            scope.categorize(list.contents);
                            scope.getIDs(list.contents);
                            ConnectionStoreCollection.set(list.contents);
                            scope.$store.dispatch('setLastConnectionType', {
                                type: scope.connectionType
                            });
                        }


                        if (scope.connectionType == 'see') {
                            EventBus.$emit('seeConnectionsViewed');
                        } else {
                            EventBus.$emit('showConnectionsViewed');
                        }
                        scope.ui.loading = false;
                    }

                    if (scope.connectionSpecified()) {
                        scope.openSpecifiedConnection();
                    }
                });
        },


        getIDs : function (connections) {
            if (!connections) {
                return false
            }
            this.connectionCompanyIDs = [];

            connections.forEach(function (connection) {
                this.connectionCompanyIDs.push(connection.company.id);
            }.bind(this));
        },

        connectionSpecified : function() {
            if (this.connectionType == 'see' && (this.$route.query.id || this.$route.query.org_id || this.$route.query.vat) ) {
                return true;
            }

            return false;
        },


        openSpecifiedConnection : function() {
            //Set active dashboard
            if (this.$route.query.dashboard) {
                sessionStorage.setItem('requestDashboard', JSON.stringify(decodeURIComponent(this.$route.query.dashboard)));
            }

            //Set date range
            if (this.$route.query.from && this.$route.query.to) {
                var fromQuery = decodeURIComponent(this.$route.query.from);
                var toQuery = decodeURIComponent(this.$route.query.to);

                var fromDate = moment(fromQuery, 'YYYY-MM-DD');
                var toDate = moment(toQuery, 'YYYY-MM-DD');

                if (fromDate.isValid()
                    && toDate.isValid()
                    && fromDate.unix() < toDate.unix()) {

                    sessionStorage.setItem('useQueryDate', JSON.stringify(true));
                    DateRangeModel.setFromDate(fromDate.toDate());
                    DateRangeModel.setToDate(toDate.toDate());
                }
            }


            if (this.$route.query.org_id || this.$route.query.vat) {
                var vat = this.$route.query.org_id || this.$route.query.vat;
                this.openByVat(vat);
            } else if (this.$route.query.id) {
                this.openById(this.$route.query.id);
            }

            //this.$router.replace(this.$route.path);
        },


        openByVat : function(vat) {
            this.ui.specifiedConnectionNotFound = false;
            this.nordea.notfound = false;

            if (this.isNordea) {
                this.nordea.vat = vat;
                this.validateVatNordea(true);
            }

            if (this.$refs.filtersearch && !this.$route.query.hide_list) {
                this.ui.search = vat;
                this.$refs.filtersearch.querySelector('#search-field').value = vat;
            }

            var found = 0;
            var lastFound = false;

            this.rawConnections.forEach(function(connection) {
                if (connection.company.vat == vat) {
                    found++;
                    lastFound = connection;
                }
            });

            if (found === 1) {
                this.openOverview(lastFound);
            } else {
                this.ui.specifiedConnectionNotFound = true;
                this.ui.loading = false;
                this.nordea.notfound = true;
            }
        },

        openById : function(id) {
            var found = false;
            this.ui.specifiedConnectionNotFound = false;

            this.rawConnections.forEach(function(connection) {
                if (connection.id == id) {
                    found = connection;
                }
            });

            if (found) {
                this.openOverview(found);
            } else {
                this.ui.specifiedConnectionNotFound = true;
                this.ui.loading = false;
            }
        },

        openOverview : function(connection, splash) {
            Track.am.log('CONNECTION_OVERVIEW_OPENED');
            if (this.connectionFilter == 'portfolio') {
                connection.fromPortfolio = true;
            } else {
                connection.fromPortfolio = false;
            }

            var scope = this;
            var cm = new SeeConnectionModel();

            if (!connection.permissionType || connection.permissionType == 'limited') {
                cm.getDashboardPermissions(connection.id)
                    .then(function(res) {
                        if (res.contents) {
                            connection.dashboardPermissions = res.contents;
                        }

                        ContextModel.setContext(connection);
                        EventBus.$emit('contextChanged');
                        scope.setErp(splash);
                        //scope.$router.push('/account/overview');
                    });
            } else {
                ContextModel.setContext(connection);
                EventBus.$emit('contextChanged');
                this.setErp(splash);
                //this.$router.push('/account/overview');
            }
            EventBus.$emit('callManualRun');
            EventBus.$emit('getEntryDepartments');
            this.$store.dispatch('setRedirectToOverview', true);
        },

        /**
         * Set ERP
         */
        setErp : function(splash) {
            var scope = this;
            let userInfo = UserModel.getCompanyUserInfo();
            ErpModel.setErp('loading');

            ErpModel.fromCompany()
                .then(function(response) {
                    if (response.id) {
                        ErpModel.setErp(response);
                    } else if (response == 'forbidden') {
                        ErpModel.setErp(response);
                    } else {
                        ErpModel.forgetErp();
                    }

                    if (splash) {
                        scope.$router.push('/account/updating');
                    } else {
                        if (response.id && userInfo.settings?.activeDashboards?.company.indexOf('_general') >= 0) {
                            scope.$router.push('/account/overview/generaloverview');
                        } else if (!response.id) {
                            scope.$router.push('/account/overview/generaloverview');
                        } else {
                            scope.$router.push('/account/overview');
                        }
                    }
                });
        },

        approveConnection : function(connection) {
            var scm = new SharedConnectionModel();
            scm.approve(connection.id);

            connection.processed = true;
            connection.approved = true;

            this.categorize(this.rawConnections);
            ConnectionStoreCollection.set(this.rawConnections);
            this.showSettings(connection);
        },

        declineConnection : function(connection) {
            var scm = new SharedConnectionModel();
            scm.decline(connection.id);

            connection.processed = true;
            connection.approved = false;

            this.categorize(this.rawConnections);
            ConnectionStoreCollection.set(this.rawConnections);
        },

        deleteConnection : function(connection) {
            var cm = new SeeConnectionModel();
            cm.delete(connection.id);

            var index = null;
            this.rawConnections.forEach(function(c, idx) {
                if (c.id == connection.id) {
                    index = idx;
                }
            });

            if (index !== null) {
                this.rawConnections.splice(index, 1);
                this.categorize(this.rawConnections);
                ConnectionStoreCollection.set(this.rawConnections);
            }
        },


        setConnectConfirmation : function (company) {
            this.confirmedConnect = true;
            company ? this.currentCompanyToAdd = company : '';
            this.addConnection(this.currentCompanyToAdd);
        },

        addNewConnectionModal : function () {
            Track.am.log('ADD_NEW_CONNECTION_BUTTON_CLICKED');
            this.$modal.show(addNewConnection, {}, {height: 'auto'});
        },

        closeMenus : function () {
            this.ui.clientFlowOptions = false;
        },

        showDeleteDialog : function (connection) {
            this.$modal.show('dialog', {
                text: this.ui.dictionary.connections.deleteConfirmation,
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.connections.deleteNo,
                        class: 'highlighted-text',
                    },
                    {
                        title: this.ui.dictionary.connections.deleteYes,
                        class: 'warning',
                        handler: () => { this.deleteConnection(connection); this.$modal.hide('dialog')}
                    }
                ]
            })
        },

        revokeConfirmation : function () {
            this.$modal.show('dialog', {
                text: this.ui.dictionary.connections.revokeConfirmation,
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.connections.revokeNo,
                        class: 'highlighted-text',
                    },
                    {
                        title: this.ui.dictionary.connections.revokeYes,
                        class: 'warning',
                        handler: () => { this.declineConnection(this.currentConnection); this.$modal.hide('dialog')}
                    }
                ]
            })
        },

        showAdminConnectDialog() {
            this.$modal.show('dialog', {
                title: this.ui.dictionary.erp.economicAdmin.addManaged,
                text: this.ui.dictionary.erp.economicAdmin.connectAdmin,
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.connections.revokeYes,
                        class: 'primary',
                        handler: () => { this.gotoErp(); this.$modal.hide('dialog')}
                    }
                ]
            })
        },

        // this code not using, but showUserInviteForm and completeClientCompany functions located on the manage-account-modal
        showInviteUserPrompt() {
            this.$modal.show('dialog', {
                text: this.ui.dictionary.company.userInvitation.inviteNewUser,
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.company.userInvitation.inviteNewUserConfirm,
                        class: 'primary',
                        handler: () => { this.showUserInviteForm(); this.$modal.hide('dialog'); }
                    },
                    {
                        title: this.ui.dictionary.company.userInvitation.inviteNewUserDecline,
                        class: 'primary',
                        handler: () => { this.completeClientCompany(); this.$modal.hide('dialog')}
                    }
                ]
            })
        },

        showChooseClientFlowDialog() {

            this.$modal.show('dialog', {
                text: this.ui.dictionary.company.userInvitation.inviteNewUser,
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.client.doNotUseApproval,
                        class: 'primary',
                        handler: () => { this.initBankrupcyFlow(); this.$modal.hide('dialog'); }
                    },
                    {
                        title: this.ui.dictionary.client.useApproval,
                        class: 'primary',
                        handler: () => { this.initApprovalFlow(); this.$modal.hide('dialog')}
                    }
                ]
            })
        },

        closeAddNewConnection() {
            EventBus.$emit('closeAddConnection', true);
        }
    };

    const computed = {
        getLastConnectionType() {
            return this.$store.getters.lastConnectionType;
        }
    }


    return Vue.extend({
        name : 'ConnectionsListView',
        template : template,
        data : bindings,
        methods : methods,
        computed,
        mixins: [addConnectionMixin],
        components : {
            'connection-grid' : connectionGrid,
            'tutorial-slide' : tutorialSlide,
            'invite-user-settings' : inviteUserSettings,
            'date-field' : dateField
        },
        created : function() {
            EventBus.$on('updateListConnections', update => {
                update ? this.getConnections() : '';
            })
        },
        mounted : function() {
            this.init();
        },
        beforeUpdate : function() {
            if (this.tutorial.current && this.tutorial.current.name === 'findCompany' && !this.tutorial.state.loading && !this.tutorial.state.finished) {
                this.newConnectionDialogTutorial();
            } else if (this.tutorial.current && this.tutorial.current.name === 'invitationNameInput' && !this.tutorial.state.loading && !this.tutorial.state.finished) {
                this.showInviteFieldTutorialName();
            }
        },
        beforeDestroy : function() {
            EventBus.$off('companyUserChanged');
            EventBus.$off('click');
            EventBus.$on('continueRMTutorial');
            EventBus.$off('tutorialEndUIReady');
            document.removeEventListener('clickAppBody', this.closeMenus);
        },
        watch : {
            'sort.param' : function(val) {
                Track.am.log('SORT_CONNECTIONS_BY_PARAMETER');
                PersistentSettings.setItem('connections-sort-param', val);
            },

            'sort.order' : function(val) {
                Track.am.log('SORT_CONNECTIONS_ORDER');
                PersistentSettings.setItem('connections-sort-order', val);
            },

            'departmentFilter' : function () {
                Track.am.log('FILTER_CONNECTIONS_BY_DEPARTMENT');
            },

            'validaationFilter' : function () {
                Track.am.log('FILTER_CONNECTIONS_BY_VALIDATION_STATUS');
            }
        }
    });
});
