define([
    'Vue',
    'moment',
    'elements/modals/modal',
    'models/DictionaryModel',
    'models/CompanyModel',
    'models/SharedConnectionModel',
    'collections/PresentationTemplateCollection',
    'collections/CompanyCollection',
    'views/ConnectionsListView',
    'collections/ConnectionStoreCollection',
    'services/Validator',
    'services/Toast',
    'views/CompanyErpView',
    'elements/dropdown/countries-dropdown',
    'models/CompanyUserInvitationModel',
    'services/EventBus'
], function (Vue, moment, modal, DictionaryModel, CompanyModel, SharedConnectionModel, PresentationTemplateCollection, CompanyCollection, ConnectionsListView, ConnectionStoreCollection, Validator, Toast, CompanyErpView, CountriesDropdown, CompanyUserInvitationModel, EventBus) {
    const template = `
        <modal :title="isErpBlockOpen" :close="isClose">                                        
            <template v-slot:content>
                <div v-if="!isErpBlock && !isManageBlock && !isCompleteAdminDialog && !isOpenDialog">
                   <div class="input-field" >
                       <input type="text" v-model="client.name.value" v-on:keyup="validateClientName()" v-on:blur="validateClientName(true)">
                       <label v-bind:class="{ filled: client.name.value.length > 0 }">{{ui.dictionary.company.name}}</label>
                       <div class="warning" v-bind:class="{ show : !client.name.valid }">{{ui.dictionary.general.validation.name}}</div>
                       <div class="warning" v-bind:class="{ show : client.name.error }">{{ui.dictionary.erp.economicAdmin.errors.company}}</div>
                       <div class="warning" v-bind:class="{ show : errors.existsName && client.name.valid }">{{ui.dictionary.company.existsName}}</div>
                   </div>
                   <countries-dropdown @countryChanged="countryChanged"></countries-dropdown>
                   <div class="input-field" >
                       <input type="text" v-model="client.vat.value" v-on:keyup="validateClientVat()" v-on:blur="validateClientVat(true)">
                       <label v-bind:class="{ filled: client.vat.value.length > 0 }">{{ui.dictionary.company.vat}}</label>
                       <div class="warning" v-bind:class="{ show : !client.vat.valid }">{{ui.dictionary.general.validation.vat}}</div>
                       <div class="warning" v-bind:class="{ show : client.vat.error }">{{ui.dictionary.erp.economicAdmin.errors.vat}}</div>
                       <div class="warning" v-bind:class="{ show : errors.existsVat && client.vat.valid }">{{ui.dictionary.company.exists}}</div>
                   </div>
               </div>
               
               <div v-if="isErpBlock && !isManageBlock && !isCompleteAdminDialog && !isOpenDialog">
                 <div>                
                    <company-erp-view :setup="true" :presetCompany="client.company.obj" :presetConnection="client.connection.obj"
                   :presetParentCompany="thisCompany" :completedCallback="erpConnectionCompleted" :requiresOwnerApproval="requiresOwnerApproval" 
                   :showUserInviteForm="showUserInviteForm"></company-erp-view>
                </div>  
               </div>
               
                <div v-if="(isErpBlock || isManageBlock) && isOpenDialog">
                    <div>                
                       <p>{{ui.dictionary.erp.economicAdmin.exitWarning}}</p>
                    </div>  
               </div>
               
                <div v-if="isManageBlock && !isCompleteAdminDialog && !isOpenDialog">
                    <p style="padding: 0;">{{ui.dictionary.company.userInvitation.description}}</p>
                    <div class="input-field">
                        <input type="text" v-model="userInvitation.name.value" v-bind:class="{ invalid : !userInvitation.name.valid }" v-on:keyup="validateUserInviteName()" v-on:blur="validateUserInviteName(true)">
                        <label v-bind:class="{ filled: userInvitation.name.value.length > 0 }">{{ui.dictionary.company.userInvitation.name}}</label>
                        <div class="warning" v-bind:class="{ show : !userInvitation.name.valid }">{{ui.dictionary.general.validation.generic}}</div>
                    </div>

                   <div class="input-field">
                       <input type="text" v-model="userInvitation.email.value" v-bind:class="{ invalid : !userInvitation.email.valid }" v-on:keyup="validateUserInviteEmail()" v-on:blur="validateUserInviteEmail(true)">
                       <label v-bind:class="{ filled: userInvitation.email.value.length > 0 }">{{ui.dictionary.company.userInvitation.email}}</label>
                       <div class="warning" v-bind:class="{ show : !userInvitation.email.valid }">{{ui.dictionary.general.validation.email}}</div>
                   </div>
                   
                </div>
                
                <div v-if="isCompleteAdminDialog">
                    <h4>{{ui.dictionary.erp.economicAdmin.completed}}</h4>
                </div>
                
               </template>
               
                <template v-slot:footer>
                    <div class="button-container" style="width: 100%; padding: 0 20px;">
                    <div v-if="!isErpBlock && !isManageBlock && !isCompleteAdminDialog && !isOpenDialog" class="zero-padding">
                        <span class="working inline float-right" v-show="client.adding"></span>
                        <button class="primary" type="submit" style="float: right" @click="addClientConnection()" v-show="!client.adding" v-handle-enter-press="addClientConnection">{{ui.dictionary.erp.economicAdmin.addManaged}}</button>
                    </div>
                    
                    <div v-if="(isErpBlock || isManageBlock) && isOpenDialog" style="justify-content: space-between; display: flex;" class="zero-padding">
                        <button class="highlighted-text" @click="closeDialog()">{{ui.dictionary.erp.economicAdmin.exitCancel}}</button>
                        <button class="warning" @click="updateConnectionList(); close()">{{ui.dictionary.erp.economicAdmin.exitConfirm}}</button>
                    </div>
                    
                     <div v-if="isManageBlock && !isCompleteAdminDialog && !isOpenDialog" class="zero-padding">
                        <span class="working inline" v-show="ui.userInviteAdding"></span>
                        <button class="primary" type="submit" style="float: right;" v-show="!ui.userInviteAdding" @click.prevent="addUser(userInvitation)">{{ui.dictionary.company.userInvitation.inviteUser}}</button>
                    </div>
                    
                    <div v-if="isCompleteAdminDialog && !isOpenDialog" class="flex-space-between">
                        <div class="centered"><a href="" v-on:click.prevent="updateConnectionList(); close()">{{ui.dictionary.client.exitClientDialog}}</a></div>
                        <div class="centered"><a class="button primary" v-on:click="updateConnectionList(); addAnotherClientConnection()">{{ui.dictionary.erp.economicAdmin.another}}</a></div>
                    </div>
                    
                    </div>
                </template>  
        </modal>
    `;


    const data = function () {
        return {
            ui: {
                dictionary: DictionaryModel.getHash(),
                addClientConnectionDialog: false,
                inviteUserPrompt: false,
                userInviteAdding: false
            },
            changeTitle: '',
            isErpBlock: false,
            errors : {
                existsVat : false,
                existsName : false
            },
            thisCompany : CompanyModel.getCompany(),
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
            companies : [],
            addConnectionType : 'see',
            rawConnections : [],
            isInviteUser: false,
            isManageBlock: false,
            isCompleteAdminDialog: false,
            isOpenDialog: false,
            selectedCountry: null
        };
    };

    const methods = {
        init() {
            this.getCompanies();
        },

        isClose() {
            if (this.isManageBlock && !this.isCompleteAdminDialog && !this.isOpenDialog) {
                if (this.client.started) {
                    this.isOpenDialog = true;
                    return false;
                }
                this.resetClient();
                EventBus.$emit('newCompanyCreatedRefresh');
            } else if (!this.isOpenDialog && (this.isErpBlock || this.isManageBlock)) {
                this.isOpenDialog = true;
            } else {
                this.isOpenDialog = false;
                this.close();
            }
        },

        countryChanged(country) {
            this.selectedCountry = country;
        },

        validateUserInviteName : function(force) {
            if (force || !this.userInvitation.name.valid) {
                this.userInvitation.name.valid = Validator.minLength(this.userInvitation.name.value, 2);
            }

            return this.userInvitation.name.valid;
        },

        validateUserInviteEmail : function(force) {
            if (force || !this.userInvitation.email.valid) {
                this.userInvitation.email.valid = Validator.email(this.userInvitation.email.value);
            }

            return this.userInvitation.email.valid;
        },

        addUser : function(email) {
            if ( !this.validateUserInviteName(true) || !this.validateUserInviteEmail(true) ) {
                return false;
            }

            var scope = this;
            scope.ui.invalidEmail = false;
            scope.ui.userError = false;
            scope.ui.addingError = false;
            scope.ui.userInviteAdding = true;


            var cuim = new CompanyUserInvitationModel(this.client.company.obj.id);
            cuim.inviteUser({
                name : scope.userInvitation.name.value,
                language : scope.userInvitation.language,
                permission_type : scope.userInvitation.permissionType,
                kpi_definition_access : scope.userInvitation.kpiDefinitionAccess,
                company_connection_access : scope.userInvitation.companyConnectionAccess,
                share_all_dashboards : scope.userInvitation.shareAllDashboards,
                valid_from : scope.userInvitation.validFrom ? moment(scope.userInvitation.validFrom).format('YYYY-MM-DD') : null,
                valid_to : scope.userInvitation.validTo ? moment(scope.userInvitation.validTo).format('YYYY-MM-DD') : null,
                department_id : null,
                // make_owner : scope.client.requiresOwnerApproval ? true : scope.userInvitation.make_owner,
                make_owner : scope.requiresOwnerApproval ? true : scope.userInvitation.make_owner,
                remove_inviter : scope.userInvitation.remove_inviter,
                //   request_erp_approval : scope.client.requiresOwnerApproval ? true : false,
                request_erp_approval : scope.requiresOwnerApproval ? true : false,
                initiator_company : scope.thisCompany.id
            }).then(function(res) {
                if (res.id) {
                    cuim.addEmail(res.id, scope.userInvitation.email.value)
                        .then(function(eres) {
                            if (eres.id) {
                                scope.ui.newUserDialog = false;

                                scope.userInvitation = {
                                    name : { value : '', valid : true },
                                    email : { value : '', valid : true },
                                    permissionType : 'extended',
                                    kpiDefinitionAccess : false,
                                    companyConnectionAccess : false,
                                    shareAllDashboards : false,
                                    language : DictionaryModel.getHash().meta.code
                                };
                                scope.ui.showMoreOptions = false;

                                scope.completeClientCompany();
                            } else {
                                //Failed to create email
                                scope.ui.invalidEmail = true;
                            }

                            scope.ui.inviteUserAdding = false;
                        });
                } else {
                    //Failed to create invitation
                    scope.ui.inviteUserAdding = false;
                    scope.ui.addingError = true;
                }
            });
        },


        getCompanies : function () {
            var cc = new CompanyCollection({ type : '_all' });

            cc.getCompanies()
                .then(function (res) {
                    if (res.contents) {
                        this.companies = res.contents;
                    }
                }.bind(this));
        },

        addClientConnection : function() {
            if ( !this.validateClientName(true) || !this.validateClientVat(true) ) {
                return false;
            }

            this.errors.existsName = false;
            this.errors.existsVat = false;

            if (this.companyNameExists(this.client.name.value)) {
                this.errors.existsName = true;
                return false;
            }

            if (this.companyVatExists(this.client.vat.value)) {
                this.errors.existsVat = true;
                return false;
            }

            this.client.started = true;
            this.addClientCompany();
        },

        addClientCompany : function() {
            if (this.client.company.completed) {
                this.connectClientCompany();
                return false;
            }

            this.client.name.error = false;
            this.client.adding = true;

            CompanyModel.createCompanyApproval(this.client.name.value, this.client.vat.value, this.requiresOwnerApproval)
                .then(function(res) {
                    if (res.id) {
                        this.client.company.obj = res;
                        this.client.company.completed = true;
                        this.client.adding = false;
                        this.connectClientCompany();
                        sessionStorage.setItem('target-client-company', JSON.stringify(res));
                        this.updateConnectionList();
                    } else {
                        this.client.name.error = true;
                        this.client.adding = false;
                    }
                   // this.close();
                }.bind(this));
        },

        addErpClientCompany : function() {
            if (this.client.erp.completed) {
                this.completeClientCompany();
                return false;
            }

            this.client.agreement.error = false;
            this.selectClientErp();

            // TODO it was commited by Jamal 04.05.2018 on the ConnectionListView:

            /**
             if ( (!this.erp || !this.erp.erp) || (this.erp && this.erp.erp && this.erp.erp != 'e-conomic-admin-parent') ) {
                this.selectClientErp();
                return false;
            }

             ErpModel.economicClientConnection(this.client.agreement.value, this.thisCompany.id, this.client.connection.obj.id)
             .then(function(res) {
                    if (res.id) {
                        this.client.erp.obj = res;
                        this.client.erp.completed = true;
                        this.client.connection.obj.company.erp = res;
                        this.completeClientCompany();
                    } else {
                        this.client.agreement.error = true;
                        this.client.adding = false;
                    }
                }.bind(this));
             */
        },

        completeClientCompany : function() {
            sessionStorage.removeItem('target-client-company');
            this.client.adding = false;
            //  this.ui.addClientConnectionDialog = false;
            this.isErpBlock = false;

           // this.close();
            this.ui.inviteUserPrompt = false;

            this.isManageBlock = false;

            this.isCompleteAdminDialog = true;

            if (this.addConnectionType == 'see') {
                this.$router.push('/account/connections/all');
            } else {
                this.$router.push('/account/connections/shared');
            }
        },

        selectClientErp : function () {
            this.ui.addClientConnectionDialog = false;
            this.isErpBlock = true;
        },

        erpConnectionCompleted : function () {
            this.promptUserInvite();
            //this.completeClientCompany();
        },

        promptUserInvite : function () {
            this.client.adding = false;
            // this.ui.addClientConnectionDialog = false;
            this.isErpBlock = false;

            if (this.requiresOwnerApproval) {
                //this.ui.inviteUserPrompt = true;
                this.showUserInviteForm();
            } else {
                this.completeClientCompany();
            }
        },

        showUserInviteForm : function (hideErpModal) {
            this.ui.inviteUserPrompt = false;
            this.isErpBlock = false;
            this.isManageBlock = true;

            if (hideErpModal) {
                this.close();
            }

        },

        connectClientCompany : function() {
            if (this.client.connection.completed) {
                this.addErpClientCompany();
                return false;
            }

            this.client.company.error = false;
            this.client.adding = true;

            var scm = new SharedConnectionModel();

            scm.request({
                company : this.thisCompany.id,
                permissionType : 'full',
                approved : true
            }, this.client.company.obj.id).then(function(res) {
                if (res.id) {
                    res.company = {
                        id : res.company,
                        name : this.client.name.value,
                        vat : this.client.vat.value,
                        created : moment('YYYY-MM-DD')
                    };
                    this.client.connection.obj = res;
                    this.client.adding = false;
                    this.client.connection.completed = true;

                    if (this.addConnectionType == 'see') {
                        this.rawConnections.push(res);
                        this.categorize(this.rawConnections);
                        ConnectionStoreCollection.set(this.rawConnections);
                    }

                    this.addErpClientCompany();
                } else {
                    this.client.name.error = true;
                    this.client.adding = false;
                }
            }.bind(this));
        },

        categorize : function(connections) {
            var scope = this;
            scope.connections = {};

            this.ui.dictionary.meta.alphabet.forEach(function(letter) {
                scope.connections[letter] = [];
            });

            if (scope.connections._ === undefined) {
                scope.connections._ = [];
            }

            if (scope.connections.pending === undefined) {
                scope.connections.pending = [];
            }

            if (scope.connections.all === undefined) {
                scope.connections.all = [];
            }

            /**
             if (scope.connections.direct === undefined) {
                scope.connections.direct = [];
            }

             if (scope.connections.app === undefined) {
                scope.connections.app = [];
            }

             if (scope.connections.partner === undefined) {
                scope.connections.partner = [];
            }
             */


            if (!connections) {
                return false;
            }

            connections.forEach(function(connection) {
                if (scope.connectionFilter == 'portfolio' && scope.portfolio && scope.portfolio.indexOf && scope.portfolio.indexOf(connection.id) < 0) {
                    return false;
                }

                if (scope.connectionType == 'show' && connection.processed && !connection.approved) {
                    return false;
                }

                if (!connection.processed) {
                    scope.connections.pending.push(connection);
                } else if (connection.company.name) {
                    var firstLetter = connection.company.name.toLowerCase().charAt(0);
                    if (scope.connections[firstLetter]) {
                        scope.connections[firstLetter].push(connection);
                    } else {
                        scope.connections._.push(connection);
                    }
                } else {
                    scope.connections._.push(connection);
                }

                /**
                 if (connection.adminData && connection.adminData.owner && connection.adminData.owner.source && connection.adminData.owner.source.type) {
                    scope.connections[connection.adminData.owner.source.type].push(connection);
                } else {
                    scope.connections.direct.push(connection);
                }
                 */


                scope.connections.all.push(connection);
                scope.connections._id = CompanyModel.getCompany().id;
            });
        },


        companyVatExists : function (vat) {
            var found = false;

            this.companies.forEach(function (company) {
                if (company.vat == vat) {
                    found = true;
                }
            });

            return found;
        },

        companyNameExists : function (name) {
            var found = false;

            this.companies.forEach(function (company) {
                if (company.name == name) {
                    found = true;
                }
            });

            return found;
        },

        validateClientName : function(force) {
            if (force || !this.client.name.valid) {
                this.client.name.valid = Validator.minLength(this.client.name.value, 2);
            }

            return this.client.name.valid;
        },

        validateClientVat : function(force) {
            if (force || !this.client.vat.valid) {
                this.client.vat.valid = this.vatValidator(this.client.vat.value);
            }

            return this.client.vat.valid;
        },


        close() {
            this.$emit('close');
        },

        addAnotherClientConnection : function() {
            this.resetClient(this.client.requiresOwnerApproval);
            this.isCompleteAdminDialog = false;
            this.isErpBlock = false;
            this.isManageBlock = false;

            // this.$modal.show(manageAccountModal);
        },

        resetClient : function(requiresOwnerApproval) {
            this.client =  {
                started : false,
                adding : false,
                name : { value: '', valid : true, error : false},
                vat : { value: '', valid : true, error : false},
                agreement : { value: '', valid : true, error : false},
                company : { obj : null, completed : false },
                connection : { obj : null, completed : false },
                erp : { obj : null, completed : false },
                requiresOwnerApproval : requiresOwnerApproval || false
            };

            this.ui.userInviteAdding = false;
        },

        closeDialog() {
            this.updateConnectionList();
            this.isOpenDialog = false;
        },

        updateConnectionList() {
            EventBus.$emit('updateListConnections', true);
        }
    };

    const computed = {
        isErpBlockOpen() {
            if (this.isErpBlock) {
                return this.ui.dictionary.erp.title;
            } else if (this.isManageBlock) {
                return this.ui.dictionary.company.userInvitation.title;
            } else if (this.isCompleteAdminDialog) {
                return this.ui.dictionary.erp.economicAdmin.completed;
            } else {
                return this.ui.dictionary.erp.economicAdmin.addManaged;
            }
        },
        vatValidator() {
            if (!this.selectedCountry && this.selectedCountry.reference === 'other') {
                return Validator.otherVat
            } else if (this.selectedCountry.reference === 'sweden') {
                return Validator.swedenVat
            } else if (this.selectedCountry.reference === 'norway') {
                return Validator.norwegianVat
            }
            return Validator.vat;
        }
    };

    const watch = {
      selectedCountry() {
          this.validateClientVat(true);
      }
    };

    return Vue.extend({
        name: 'manage-account-modal',
        template,
        data,
        methods,
        computed,
        props: ['requiresOwnerApproval'],
        watch,
        components: {
            modal,
            'company-erp-view' : CompanyErpView,
            'countries-dropdown': CountriesDropdown
        },
        created: function () {
            EventBus.$on('closePopup', close => {
                close ? this.close() : '';
            });
        },
        mounted: function() {
            this.init();
        },
    });
});
