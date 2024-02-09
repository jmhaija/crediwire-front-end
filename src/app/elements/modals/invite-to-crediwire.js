define([
    'Vue',
    'moment',
    'elements/modals/modal',
    'elements/modals/define-copy-link-modal',
    'elements/modals/manage-account-modal',
    'elements/tutorial-slide',
    'models/UserModel',
    'models/CompanyModel',
    'models/InvitationModel',
    'models/DictionaryModel',
    'models/UniqueConnectionModel',
    'models/SeeConnectionModel',
    'models/SharedConnectionModel',
    'models/InvitationEmailModel',
    'views/ConnectionsListView',
    'services/Validator',
    'collections/PresentationTemplateCollection',
    'collections/LanguageCollection',
    'services/Tutorial',
    'collections/CompanyCollection',
    'collections/ConnectionStoreCollection',
    'services/Track'
], function (Vue, moment, modal, copyLink, manageAccountModal, tutorialSlide, UserModel,
             CompanyModel, InvitationModel, DictionaryModel, UniqueConnectionModel, SeeConnectionModel,
             SharedConnectionModel, InvitationEmailModel, ConnectionsListView, Validator, PresentationTemplateCollection, LanguageCollection, Tutorial, CompanyCollection, ConnectionStoreCollection, Track) {
    const template = `
        <modal :title="ui.dictionary.connections.invite" :close="close">                                        
            <template v-slot:content>
                <v-popover :open="showInviteFieldTutorialName()" placement="left" class="blocker">
                           <div class="input-field" >
                               <input type="text" v-model="invitation.name.value" v-on:keyup="validateName()" v-on:blur="validateName(true)">
                               <label v-bind:class="{ filled: invitation.name.value.length > 0 }">{{ui.dictionary.general.labels.firstname}}</label>
                               <div class="warning" v-bind:class="{ show : !invitation.name.valid }">{{ui.dictionary.general.validation.name}}</div>
                           </div>

                           <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>
                       </v-popover>

                   <v-popover :open="showInviteFieldTutorialEmail()" placement="left" class="blocker">
                       <div class="input-field">
                           <input type="text" v-model="invitation.email.value" v-bind:class="{ invalid : !invitation.email.valid }" v-on:keyup="validateEmail()" v-on:blur="validateEmail(true)">
                           <label v-bind:class="{ filled: invitation.email.value.length > 0 }">{{ui.dictionary.general.labels.email}}</label>
                           <div class="warning" v-bind:class="{ show : !invitation.email.valid }">{{ui.dictionary.general.validation.email}}</div>
                           <div class="warning" v-bind:class="{ show : invitation.email.error }">{{ui.dictionary.invitations.error}}</div>
                       </div>

                       <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>
                   </v-popover>

                   <v-popover :open="showInviteFieldTutorialVat()" placement="left"  class="blocker">
                       <div class="input-field">
                           <input type="text" v-model="invitation.vat.value" v-bind:class="{ invalid : !invitation.vat.valid }" v-on:keyup="validateVat(true)" v-on:blur="validateVat(true)">
                           <label v-bind:class="{ filled: invitation.vat.value.length > 0 }">{{ui.dictionary.company.vat}}</label>
                           <div class="warning" v-bind:class="{ show : !invitation.vat.valid }">{{ui.dictionary.general.validation.vat}}</div>
                           <div class="warning" v-bind:class="{ show : ui.invitationAlreadySentToVatError }">{{ui.dictionary.invitations.invitationAlreadySentToVat}}</div>
                       </div>

                       <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>
                   </v-popover>


                   <div class="selector full-width">
                       <label class="filled">{{ui.dictionary.profile.defaultLanguage}}</label>
                       <div class="label" v-on:click.stop="ui.langOptions = true">
                           <span class="filled">{{getCurrentLanguage(invitation.language)}}</span> <i class="cwi-down"></i>
                           <div class="options" v-bind:class="{ show : ui.langOptions }">
                               <div class="option" v-for="lang in langOptions" v-bind:class="{ selected : lang.code == invitation.language }" v-on:click.stop="invitation.language = lang.code; ui.langOptions = false;">
                                   <span>{{lang.name}}</span>
                               </div>
                           </div>
                       </div>
                   </div>
                   
                   <div v-show="ui.invitationError" class="message-bar">
                       <div class="warning">{{ui.dictionary.connections.userExists}}</div>
                   </div>

            </template> 
                            
            <template v-slot:footer>
                <v-popover :open="showInviteFieldTutorialSubmit()" placement="right"  class="blocker blocker-modal-btn zero-padding">
                           <div class="submit-button buttons-invite invite-btns-scrollable-modal">
                               <button v-show="!ui.sendingInvite" class="primary connections-invite zero-margin-top" v-on:click="sendInvite()" v-handle-enter-press="sendInvite">{{ui.dictionary.connections.invite}}</button>
                               <button v-show="!ui.sendingInvite" class="invite-links zero-margin-top" v-on:click.prevent="sendInvite(true)">{{ui.dictionary.invitations.link}}</button>
                               <span class="working float-right" v-show="ui.sendingInvite"></span>
                           </div>

                       <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>
                       </v-popover>
            </template>                                  
        </modal>
    `;

    const data = function () {
        return {
            ui: {
                dictionary: DictionaryModel.getHash(),
                search: '',
                newSearch: '',
                addingError: false,
                uniqueError: false,
                adding: false,
                clientFlowOptions: false,
                newConnectionDialog : false,
                userInviteAdding: false,
                addClientConnectionDialog: false,
                settingsDialog: false,
                langOptions : false,
                invitationError: false,
                invitationAlreadySentToVatError: false,
                sendingInvite: false
            },
            currentLink: null,
            langOptions : [],
            tutorial : Tutorial,
            invitationTutorialReady: false,
            existingInvitations : [],
            addConnectionType : 'see',
            invitation: {
                name : { value : '', valid : true },
                email : { value : '', valid : true },
                vat : { value : '', valid : true },
                language : DictionaryModel.getLanguage(),
                reminders : false
            },
            permissions : UserModel.getCompanyUserInfo(),
        };
    };

    const methods = {
        init : function () {
            this.langOptions = LanguageCollection.getList();
        },

        showInviteFieldTutorialSubmit : function() {
            return this.tutorial.current && this.tutorial.current.name == 'invitationSubmitInput' && !this.tutorial.state.loading && !this.tutorial.state.finished;
        },

        validateEmail : function(force) {
            if (force || !this.invitation.email.valid) {
                this.invitation.email.valid = Validator.email(this.invitation.email.value);
            }

            return this.invitation.email.valid;
        },

        getCurrentLanguage : function(code) {
            var langName = null;

            for (var i = 0; i < this.langOptions.length; i++) {
                if (this.langOptions[i].code == code) {
                    langName = this.langOptions[i].name;
                }
            }

            return langName;
        },

        showInviteFieldTutorialName : function() {
            if (this.tutorial.current && this.tutorial.current.name == 'invitationNameInput' && !this.tutorial.state.loading && !this.tutorial.state.finished) {
                setTimeout(function() {
                    this.invitationTutorialReady = true;
                }.bind(this), 500);

                if (this.invitationTutorialReady) {
                    return true;
                }
            }

            return false;
        },

        validateVat : function(force) {
            if (this.invitation.vat.value.length == 0) {
                this.invitation.vat.valid = true;
                return true;
            }

            if (force || !this.invitation.vat.valid) {
                this.invitation.vat.valid = Validator.vat(this.invitation.vat.value);
            }

            return this.invitation.vat.valid;
        },

        showInviteFieldTutorialEmail : function() {
            return this.tutorial.current && this.tutorial.current.name == 'invitationEmailInput' && !this.tutorial.state.loading && !this.tutorial.state.finished;
        },

        showInviteFieldTutorialVat : function() {
            return this.tutorial.current && this.tutorial.current.name == 'invitationVatInput' && !this.tutorial.state.loading && !this.tutorial.state.finished;
        },

        validateName : function(force) {
            if (force || !this.invitation.name.valid) {
                this.invitation.name.valid = Validator.minLength(this.invitation.name.value, 2);
            }

            return this.invitation.name.valid;
        },


        sendInvite : function(linkOnly) {
            if (!this.validateName(true) || !this.validateEmail(true) || !this.validateVat(true)) {
                return false;
            }

            if (!this.checkExistingInvite(this.invitation)) {
                this.ui.invitationAlreadySentToVatError = true;
                return false;
            }

            var scope = this;
            scope.ui.sendingInvite = true;
            scope.invitation.email.error = false;
            scope.ui.invitationAlreadySentToVatError = false;

            //See connection restriction
            if (!this.permissions.owner) {
                this.addConnectionType = 'see';
            }

            var im = new InvitationModel();
            im.createInvitation({
                name : scope.invitation.name.value,
                type : scope.addConnectionType,
                language : scope.invitation.language,
                vat : scope.invitation.vat.value
            }).then(function(res) {
                if (res.id) {
                    var em = new InvitationEmailModel(res.id);
                    em.sendInvite(scope.invitation.email.value, false, false, linkOnly)
                        .then(function(emailRes) {
                            if (emailRes.id) {
                                if (linkOnly) {
                                    scope.showLinkDialog(emailRes.link);
                                } else {
                                    var rm1 = new InvitationEmailModel(res.id);
                                    rm1.sendInvite(scope.invitation.email.value, 'P7D', 'invite-reminder-1');

                                    var rm2 = new InvitationEmailModel(res.id);
                                    rm2.sendInvite(scope.invitation.email.value, 'P21D', 'invite-reminder-2');
                                }

                                scope.invitation.name.value = '';
                                scope.invitation.email.value = '';
                                scope.invitation.vat.value = '';
                                scope.close();
                            } else {
                                //Handle failure
                                scope.invitation.email.error = true;
                                scope.close();
                            }

                            scope.ui.sendingInvite = false;
                        });
                } else {

                    if (res.errors && res.errors[0] && res.errors[0].type == 'InvitationAlreadySentToVat') {
                        scope.ui.invitationAlreadySentToVatError = true;
                    }

                    scope.ui.sendingInvite = false;
                }
            });
        },

        checkExistingInvite : function (invitation) {
            if (this.existingInvitations.indexOf(invitation.vat.value) >= 0) {
                return false;
            }

            return true;
        },

        showLinkDialog : function(link) {
            this.currentLink = link;
            this.close();
            this.$modal.show(copyLink, {shareLinkInfo: this.currentLink, withoutPin: true}, {height: 'auto'});
        },


        close() {
            Track.am.log('INVITE_TO_CREDIWIRE_CLOSED')
            this.$emit('close');
        },
    };

    return Vue.extend({
        name: 'invite-to-crediwire',
        template,
        data,
        methods,
        components: {
            modal,
            'tutorial-slide': tutorialSlide
        },
        mounted: function () {
            this.init();
        },
    });
});
