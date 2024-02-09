define([
    'Vue',
    'moment',
    'elements/modals/modal',
    'elements/modals/add-new-connection',
    'elements/modals/manage-account-modal',
    'elements/tutorial-slide',
    'elements/modals/invite-to-crediwire',
    'models/UserModel',
    'models/CompanyModel',
    'models/DictionaryModel',
    'models/UniqueConnectionModel',
    'models/SeeConnectionModel',
    'models/SharedConnectionModel',
    'views/ConnectionsListView',
    'collections/PresentationTemplateCollection',
    'services/Tutorial',
    'collections/CompanyCollection',
    'collections/ConnectionStoreCollection',
    'elements/modals/show-connection-confirm',
    'views/CompanyErpView',
    'mixins/addConnectionMixin',
    'services/EventBus',
    'services/Track'
], function (Vue, moment, modal, addNewConnection, manageAccountModal, tutorialSlide, inviteToCrediwire, UserModel,
             CompanyModel, DictionaryModel, UniqueConnectionModel, SeeConnectionModel,
             SharedConnectionModel, ConnectionsListView, PresentationTemplateCollection, Tutorial, CompanyCollection, ConnectionStoreCollection, showConnectionConfirm, CompanyErpView, addConnectionMixin, EventBus, Track) {
    const template = `
        <modal :title="dictionary.connections.add" :close="close" :hideScroll="ui.newSearch.length > 1 && suggestions.length > 0">                                        
            <template v-slot:content>
                <v-popover :open="newConnectionDialogTutorial()" placement="left" class="blocker">
                    <div class="search input-field" v-show="!company">
                        <input type="text" v-model="ui.newSearch" v-on:keyup="getSuggestions(ui.newSearch)">
                        <label v-bind:class="{ filled: ui.newSearch.length > 0 }">{{dictionary.connections.search}}</label>
                        <div class="autocomplete autocomplete-dynamic-height" v-show="ui.newSearch.length > 1 && suggestions.length > 0">
                           <div v-for="suggestion in filterSuggestions(suggestions)" class="clickable" v-on:click="company = suggestion; ui.addingError = false;"><span v-show="suggestion.name">{{suggestion.name}}</span><span v-show="!suggestion.name">{{suggestion.vat}}</span></div>
                        </div>
                    </div>
                    <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>
                </v-popover>
                    
               <div class="company" v-if="company">
                   <div class="remove" v-on:click="company = null; ui.addingError = false;"><i class="cwi-close"></i></div>
                   {{company.name}}
               </div>
    
               <section class="types types-from-modal" v-show="company && (permissions.owner || permissions.permissionType == 'full')">
                   <p>{{dictionary.connections.type}}</p>
                   <div class="flex-space-between">
                        <div class="type-choose" :class="{ active : addConnectionType == 'see' }" v-on:click="addConnectionType = 'see'"><span>{{dictionary.connections.typeNormal}}</span>{{dictionary.connections.typeSee}}</div>
                        <div class="type-choose" :class="{ active : addConnectionType == 'show' }" v-on:click="addConnectionType = 'show'"><span>{{dictionary.connections.typeShared}}</span>{{dictionary.connections.typeShow}}</div>
                    </div>
               </section>

               <div v-show="ui.addingError" class="message-bar">
                   <div class="warning">{{dictionary.connections.alreadyAdded}}</div>
               </div>
               <div v-show="ui.uniqueError" class="message-bar">
                   <div class="warning">{{dictionary.connections.alreadyAddedUnique}}</div>
               </div>
    
               
            </template> 
                            
            <template v-slot:footer>
                 <div class="zero-padding-top zero-padding-bottom buttons-container" style="width: 100%;">
                    <v-popover :open="showInvitationButtonTutorial()" placement="left" class="blocker blocker-modal-btn zero-padding">
                        <div v-show="!company" class="invite-area buttons-invite zero-padding">
                           <button v-show="(thisCompany && thisCompany.settings && thisCompany.settings.client_flows && thisCompany.settings.client_flows.indexOf('bankruptcy') >= 0 && thisCompany.settings.client_flows.indexOf('client') < 0) || (profile && profile.roles && (profile.roles.indexOf('erp_admin_role') >= 0 || profile.roles.indexOf('erp_admin') >= 0) && (!thisCompany.settings || !thisCompany.settings.client_flows || (thisCompany.settings.client_flows.indexOf('bankruptcy') < 0 && thisCompany.settings.client_flows.indexOf('client') < 0)) )" class="primary zero-margin-bottom" v-on:click="openManagedAccountDialog(false)">
                               <span v-show="thisCompany && thisCompany.settings && thisCompany.settings.client_flows && thisCompany.settings.client_flows.indexOf('bankruptcy') >= 0">{{dictionary.client.bankruptcyFlow}}</span>
                               <span v-show="!thisCompany || !thisCompany.settings || !thisCompany.settings.client_flows || thisCompany.settings.client_flows.indexOf('bankruptcy') < 0">{{dictionary.client.clientFlow}}</span>
                           </button>
                         <button v-show="thisCompany && thisCompany.settings && thisCompany.settings.client_flows && thisCompany.settings.client_flows.indexOf('client') >= 0" class="primary zero-margin-bottom" v-on:click="openManagedAccountDialog(true)">{{dictionary.client.clientFlow}}</button>
            
                           <div class="selector client-flow-selector" v-show="thisCompany && thisCompany.settings && thisCompany.settings.client_flows && thisCompany.settings.client_flows.indexOf('client') >= 0 &&  thisCompany.settings.client_flows.indexOf('bankruptcy') >= 0">
                               <div class="label" v-on:click.stop="ui.clientFlowOptions = true">
                                   <span>{{dictionary.client.selectFlow}}</span> <i class="cwi-down"></i>
                                  <div class="options" v-bind:class="{ show : ui.clientFlowOptions }">
                                       <div class="option" v-on:click.stop="openManagedAccountDialog(false)">
                                           <span>{{dictionary.client.bankruptcyFlow}}</span>
                                       </div>
                                       <div class="option" v-on:click.stop="openManagedAccountDialog(true)">
                                           <span>{{dictionary.client.clientFlow}}</span>
                                       </div>
                                   </div>
                               </div>
                           </div>
                           <button class="primary zero-margin-bottom" v-on:click="showInvitation(); trackEvent('INVITE_TO_CREDIWIRE_BUTTON_CLICK')">{{dictionary.connections.invite}}</button>
                        </div>
                        <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>
                    </v-popover>   
                    <div class="button-container" style="width: 100%;" v-show="company">
                        <span class="working" v-show="ui.adding"></span>
                        <button class="primary zero-margin" style="float: right;" v-on:click="checkCompanyUniqueness()" v-show="!ui.adding" v-handle-enter-press="checkCompanyUniqueness">{{dictionary.connections.add}}</button>
                    </div>  
                </div>
            </template>                                  
        </modal>
    `;

    const data = function () {
        return {
            dictionary: DictionaryModel.getHash(),
            ui: {
                search: '',
                newSearch: '',
                addingError: false,
                uniqueError: false,
                adding: false,
                clientFlowOptions: false,
                newConnectionDialog : false,
                invitationDialog: false,
                userInviteAdding: false,
                addClientConnectionDialog: false,
                settingsDialog: false
            },
            tutorial : Tutorial,
            suggestions : [],
            connections : false,
            company : null,
            invitationTutorialReady : false,
            connectionType : 'see',
            addConnectionType : 'see',
            currentCompanyToAdd : null,
            connectionTutorialReady : false,
            rawConnections : [],
            thisCompany : CompanyModel.getCompany(),
            currentConnection : null,
            confirmedConnect : false,
            suggestionTimeout : null,
            connectionCompanyIDs : [],
            profile : UserModel.profile(),
            connectionFilter : 'all',
            portfolio : [],
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
            reportCreateError: false,
            working: false,
            permissions : UserModel.getCompanyUserInfo(),
        };
    };

    const methods = {
        init() {
            this.addConnectionType = this.$route.meta.connectionType;
        },

        trackEvent(event) {
            Track.am.log(event)
        },

        close() {
            this.$emit('close');
        },

        newConnectionDialogTutorial : function() {
            return !!(this.tutorial.current && this.tutorial.current.name === 'findCompany' && !this.tutorial.state.loading && !this.tutorial.state.finished);
        },

        openManagedAccountDialog : function(requireApproval) {
            this.client.requiresOwnerApproval = requireApproval;
            this.client.adding = false;
            this.ui.userInviteAdding = false;
            this.ui.clientFlowOptions = false;
            // this.ui.newConnectionDialog = false;
            this.close();
            this.$modal.show(manageAccountModal, {requiresOwnerApproval: this.client.requiresOwnerApproval}, {height: 'auto'});
           // this.ui.addClientConnectionDialog = true;
        },

        checkCompanyUniqueness : function () {
            this.ui.adding = true;
            this.ui.uniqueError = false;

            UniqueConnectionModel.checkUniqueness('connection-' + this.addConnectionType, this.company.id)
                .then(function (res) {
                    if (res.total_items && res.total_items > 0) {
                        this.ui.uniqueError = true;
                        this.ui.adding = false;
                    } else {
                        this.addConnection(this.company);
                    }
                }.bind(this));
        },

        getSuggestions : function(query) {
            clearTimeout(this.suggestionTimeout);

            if (query.length === 0) {
                this.suggestions = [];
                return false;
            }

            var scope = this;

            this.suggestionTimeout = setTimeout(function() {
                var cc = new CompanyCollection({
                    query : query
                });

                cc.getCompanies()
                    .then(function(list) {
                        scope.suggestions = [];

                        list.contents.forEach(function(company) {
                            if (company.id != CompanyModel.getCompany().id) {
                                scope.suggestions.push(company);
                            }
                        });

                        if (scope.ui.newSearch.length === 0) {
                            scope.suggestions = [];
                        }

                    });
            }, 400);
        },

        filterSuggestions : function (suggestions) {
            var list = suggestions.slice();

            return list.filter(function (suggestion) {
                return this.connectionCompanyIDs.indexOf(suggestion.id) < 0;
            }.bind(this));
        },

        showInvitationButtonTutorial: function() {
            if (this.tutorial.current && this.tutorial.current.name === 'useInviteButton' && !this.tutorial.state.loading && !this.tutorial.state.finished) {
                this.$modal.hide(inviteToCrediwire);
                return true;
            }

            return false;
        },
    };

    return Vue.extend({
        name: 'add-new-connection',
        template,
        data,
        methods,
        mixins: [addConnectionMixin],
        components: {
            modal,
            'tutorial-slide' : tutorialSlide,
        },
        mounted: function () {
            EventBus.$on('closeAddConnection', (res) => {
                res ? this.close() : '';
            });
            this.init();
        },
    });
});
