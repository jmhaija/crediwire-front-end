    import Vue from 'Vue'
    import moment from 'moment'
    import modal from 'elements/modals/modal'
    import dateField from 'elements/date-field'
    import tutorialSlide from 'elements/tutorial-slide'
    import DictionaryModel from 'models/DictionaryModel'
    import InvitationModel from 'models/InvitationModel'
    import UserModel from 'models/UserModel'
    import Validator from 'services/Validator'
    import Tutorial from 'services/Tutorial'
    import InvitationsView from 'views/InvitationsView'
    import InvitationEmailModel from 'models/InvitationEmailModel'
    import inviteToCrediwire from 'elements/modals/invite-to-crediwire'
    import LanguageCollection from 'collections/LanguageCollection'
    import InvitationCollection from 'collections/InvitationCollection'
    import CompanyCollection from 'collections/CompanyCollection'
    import copyLink from 'elements/modals/copy-link-modal'
    import CompanyModel from 'models/CompanyModel'
    import ContextModel from 'models/ContextModel'
    import multipleInvitations from 'elements/modals/multiple-invitations'
    import resendConfirm from 'elements/modals/resend-confirm'
    import EventBus from 'services/EventBus'
    import connectCompanies from 'elements/modals/connect-companies'

    const template = `
        <modal :title="ui.dictionary.invitations.new" :close="close">                                        
                    <template v-slot:content>
                       <div class="float-right" style="margin-top: 0;" v-show="company.owned || permissions.permissionType == 'full'">
                          <a href="" class="header-title-modal" style="position: relative; z-index: 111;" @click.prevent="showNewInvitationsModal();">{{ui.dictionary.invitations.sendMultiple}}</a>
                        </div>
                      <div :open="showInviteFieldTutorialName()" placement="left" class="blocker">
                               <div class="input-field">
                                   <input type="text" data-test-id="firstNameInvitation" v-model="fields.name.value" v-bind:class="{ invalid : !fields.name.valid || fields.name.error }" v-on:keyup="validateName(); ui.changes = true;" v-on:blur="validateName(true)">
                                   <label v-bind:class="{ filled: fields.name.value }">{{ui.dictionary.invitations.name}}</label>
                                   <div class="warning" v-bind:class="{ show : !fields.name.valid }">{{ui.dictionary.general.validation.generic}}</div>
                                   <div class="warning" v-bind:class="{ show : fields.name.error }">{{ui.dictionary.invitations.exists}}</div>
                               </div>
                           <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>
                      </div>


                      <div :open="showInviteFieldTutorialEmail()" placement="left" class="blocker">
                           <div class="input-field">
                               <input type="text" data-test-id="emailInvitation" v-model="fields.email.value" v-bind:class="{ invalid : !fields.email.valid || fields.email.error || fields.email.ownEmail }" v-on:keyup="validateEmail();" v-on:blur="validateEmail(true)">
                               <label v-bind:class="{ filled: fields.email.value }">{{ui.dictionary.invitations.email}}</label>
                               <div class="warning" v-bind:class="{ show : !fields.email.valid }">{{ui.dictionary.general.validation.email}}</div>
                               <div class="warning" v-bind:class="{ show : fields.email.error }">{{ui.dictionary.invitations.error}}</div>
                               <div class="warning" :class="{ show : fields.email.ownEmail }">{{ui.dictionary.general.validation.ownEmail}}</div>
                           </div>
                           <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>
                       </div>



                       <div :open="showInviteFieldTutorialVat()" placement="left"  class="blocker">
                           <div class="input-field">
                               <input type="text" v-model="fields.vat.value" v-bind:class="{ invalid : !fields.vat.valid }" v-on:keyup="validateVat(true)" v-on:blur="validateVat(true)">
                               <label v-bind:class="{ filled: fields.vat.value.length > 0 }">{{ui.dictionary.company.vat}}</label>
                               <div class="warning" v-bind:class="{ show : !fields.vat.valid }">{{ui.dictionary.general.validation.vat}}</div>
                               <div class="warning" v-bind:class="{ show : showInvitationVatError}">{{ui.dictionary.invitations.invitationAlreadySentToVat}}</div>
                           </div>
                           <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>
                       </div>


                       <div class="types" v-show="permissions.owner">
                           <p>{{ui.dictionary.invitations.type}}</p>
                           <div class="flex-space-between">
                               <div class="type-choose" :class="{ active : addConnectionType == 'see' }" v-on:click="addConnectionType = 'see'"><span>{{ui.dictionary.connections.typeNormal}}</span>{{ui.dictionary.invitations.typeSee}}</div>
                               <div class="type-choose" :class="{ active : addConnectionType == 'show' }" v-on:click="addConnectionType = 'show'"><span>{{ui.dictionary.connections.typeShared}}</span>{{ui.dictionary.invitations.typeShow}}</div>
                           </div>
                       </div>


                       <div class="selector full-width">
                           <label class="filled">{{ui.dictionary.profile.defaultLanguage}}</label>
                           <div class="label" v-on:click.stop="ui.langOptions = true">
                               <span class="filled">{{getCurrentLanguage(fields.language)}}</span> <i class="cwi-down"></i>
                               <div class="options" v-bind:class="{ show : ui.langOptions }">
                                   <div class="option" v-for="lang in langOptions" v-bind:class="{ selected : lang.code == fields.language }" v-on:click.stop="fields.language = lang.code; ui.langOptions = false;">
                                       <span>{{lang.name}}</span>
                                   </div>
                               </div>
                           </div>
                       </div>
                    </template>
                            
                    <template v-slot:footer>
                        <div class="submit-button buttons-invite invite-btns-scrollable-modal" style="width: 100%;">
                        <div :open="showInviteFieldTutorialSubmit()" placement="right" style="width: 47%" class="blocker">
                            <button class="btn-invitation-link zero-margin-bottom zero-margin-top" style="width: 100%;" v-show="!ui.saving" data-test-id="sendInvitationLink" v-on:click.prevent="addInvitation(true)">{{ui.dictionary.invitations.link}}</button>
                            <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>
                        </div>
                        <button class="primary btn-invitation-send zero-margin-bottom zero-margin-top" style="height: 36px;" v-show="!ui.saving" data-test-id="sendInvitationEmail" v-on:click.prevent="addInvitation()" v-handle-enter-press="addInvitation">{{ui.dictionary.invitations.send}}</button>
                        </div>
                       <span v-show="ui.saving" class="working inline scrollable-working"></span>
                    </template>                                  
        </modal>
    `;


    const data = () => ({
        ui: {
            dictionary: DictionaryModel.getHash(),
            langOptions : false,
            saving: false,
            newConnectionDialog : false,
            invitationAlreadySentToVatError: false
        },
        fields : {
            name : { value : '', valid: true, error : false },
            vat : { value : '', valid: true, error : false, alreadyInvited: false },
            email : {value : '', valid : true, error : false, ownEmail: false },
            reminders : false,
            language : DictionaryModel.getLanguage()
        },
        addConnectionType : 'see',
        currentInvite: null,
        departments : [],
        company : CompanyModel.getCompany(),
        permissions : UserModel.getCompanyUserInfo(),
        tutorial : Tutorial,
        profile : UserModel.profile(),
        invitationTutorialReady: false,
        langOptions : [],
        invitations : [],
        existingInvitations : [],
        invitation: {
            name : { value : '', valid : true },
            email : { value : '', valid : true },
            vat : { value : '', valid : true },
            language : DictionaryModel.getLanguage(),
            reminders : false
        },
        connectCompanyList : [],
        chosenCompany: null
    });

    const methods = {
        init() {
            this.langOptions = LanguageCollection.getList();
            document.addEventListener('contextChange', this.updatePermissions);
            this.getExistingInvitations();
        },

        getExistingInvitations() {
            var ic = new InvitationCollection();
            ic.checkUnique()
                .then(function (res) {
                    if (res._embedded && res._embedded.items) {
                        res._embedded.items.forEach(function (existingInvitation) {
                            if (existingInvitation.data && existingInvitation.data[0] && existingInvitation.data[0].value && existingInvitation.data[0].value.length > 0) {
                                this.existingInvitations.push(existingInvitation.data[0].value);
                            }
                        }.bind(this));
                    }
                }.bind(this));
        },

        updatePermissions() {
            this.permissions = UserModel.getCompanyUserInfo();
            this.company = CompanyModel.getCompany();
            if(this.$route.path === '/account/invitations') {
                this.getInvitations(false);
            }
        },

        getInvitations(fromInit) {
            var scope = this;
            scope.ui.loading = true;
            scope.permissions = ContextModel.getContext() || UserModel.getCompanyUserInfo();

            var ic = new InvitationCollection();
            ic.getInvitations(this.profile.roles.indexOf('admin') >= 0)
                .then(function(res) {
                    if (res.contents) {
                        scope.permissions = ContextModel.getContext() || UserModel.getCompanyUserInfo();
                        scope.invitations = res.contents;
                        scope.ui.loading = false;

                        scope.formatInvitations(res.contents);
                    }
                });
        },

        addInvitation(linkOnly) {
            if (!this.validateName(true) || !this.validateVat(true) || !this.validateEmail(true)) {
                return false;
            }

            if (this.fields.email.error) {
                this.resendInvitation(true, linkOnly);
                return false;
            }

            if (!this.checkExistingInvite(this.fields)) {
                this.ui.invitationAlreadySentToVatError = true;
                return false;
            }

            //See connection restriction
            if (!this.permissions.owner) {
                this.addConnectionType = 'see';
            }

            var scope = this;
            scope.ui.invitationAlreadySentToVatError = false;
            scope.ui.saving = true;


            if (scope.fields.vat.value) {
                var cc = new CompanyCollection({
                    query : scope.fields.vat.value
                });

                cc.getCompanies()
                    .then(function(res) {
                        if (res.contents && res.contents.length > 0) {
                            scope.connectToCompanies(res.contents);
                        } else {
                            scope.createInvitation(linkOnly);
                        }
                    });
            } else {
                scope.createInvitation(linkOnly);
            }
        },

        checkExistingInvite(invitation) {
            return this.existingInvitations.indexOf(invitation.vat.value) < 0;
        },

        resendInvitation(confirm, linkOnly) {
            if (!confirm) {
                this.$modal.show(resendConfirm, {fields: this.fields, currentInvite: this.currentInvite, hasReminders: this.hasReminders});
                this.fields.email.value = this.currentInvite.emails[0] ? this.currentInvite.emails[0].email : '';
                return false;
            }

            if (!this.validateEmail(true) || this.ui.saving) {
                return false;
            }

            var scope = this;
            scope.ui.saving = true;

            var em = new InvitationEmailModel(this.currentInvite.id);

            em.sendInvite(this.fields.email.value, false, false, linkOnly)
                .then(function(res) {
                    if (res.id) {
                        scope.currentInvite.emails.push(res);
                        scope.fields.email.value = '';
                        scope.fields.email.error = false;
                        scope.fields.reminders = false;
                        scope.$modal.hide(resendConfirm);
                        scope.close();

                        if (scope.currentInvite.emails[0] && res.email != scope.currentInvite.emails[0].email) {
                            scope.changeReminderEmails(res.email);
                        } else if (!scope.hasReminders()) {
                            var rm1 = new InvitationEmailModel(res.id);
                            rm1.sendInvite(res.email, 'P7D', 'invite-reminder-1');

                            var rm2 = new InvitationEmailModel(res.id);
                            rm2.sendInvite(res.email, 'P21D', 'invite-reminder-2');
                        }
                    } else {
                        scope.fields.email.error = true;
                    }

                    scope.ui.saving = false;
                    scope.close();
                    scope.fields.name.value = '';
                    scope.fields.vat.value = '';
                    scope.fields.email.value = '';
                    scope.fields.reminders = false;
                });
        },

        changeReminderEmails(newEmail, confirm) {
            if (!confirm) {
                var found = false;
                this.currentInvite.emails.forEach(function(email) {
                    if (!email.sent) {
                        found = true;
                    }
                });

                if (found) {
                    this.newEmail = newEmail;
                    this.ui.changeEmailsConfirm = true;
                }

                return false;
            }


            this.ui.changeEmailsConfirm = false;

            this.currentInvite.emails.forEach(function(e, i) {
                if (!e.sent) {
                    Vue.set(this.currentInvite.emails[i], 'email', newEmail);

                    var em = new InvitationEmailModel(this.currentInvite.id);
                    em.changeEmail(e.id, newEmail);
                }
            }, this);

        },

        connectToCompanies(companies) {
            this.close();
            this.fields.name.value = '';
            this.fields.vat.value = '';
            this.fields.email.value = '';
            this.fields.reminders = false;
            this.ui.saving = false;
            this.connectCompanyList = companies;
            this.chosenCompany = companies[0];
            this.$modal.show(connectCompanies, {
                connectCompanyList: this.connectCompanyList,
                addConnectionType: this.addConnectionType,
                currentCompany: this.chosenCompany
            }, {height: 'auto'});
        },

        createInvitation : function(linkOnly) {
            var scope = this;

            var im = new InvitationModel();
            im.createInvitation({
                name : scope.fields.name.value,
                type : scope.addConnectionType,
                language : scope.fields.language,
                vat : scope.fields.vat.value
            }).then(function(res) {
                if (res.id) {
                    res.adminData = {
                        creatorName : scope.profile.name,
                        erpProvider : null,
                        officialName : null,
                        officialPhone : null,
                        officialShortType : null,
                        officialStatus : null,
                        officialType : null,
                        officialValidTo : null,
                        phoneNumber : null,
                        privateNote : null
                    };
                    scope.invitations.push(res);
                    scope.formatInvitations(scope.invitations);

                    scope.fields.email.error = false;
                    var em = new InvitationEmailModel(res.id);
                    em.sendInvite(scope.fields.email.value, false, false, linkOnly)
                        .then(function(emailRes) {
                            if (emailRes.id) {
                                if (linkOnly) {
                                    scope.showLinkDialog(emailRes.link);
                                }

                                var rm1 = new InvitationEmailModel(res.id);
                                rm1.sendInvite(scope.fields.email.value, 'P7D', 'invite-reminder-1');

                                var rm2 = new InvitationEmailModel(res.id);
                                rm2.sendInvite(scope.fields.email.value, 'P21D', 'invite-reminder-2');

                                scope.close();
                                scope.fields.name.value = '';
                                scope.fields.vat.value = '';
                                scope.fields.email.value = '';
                                scope.fields.reminders = false;
                            } else {
                                //Handle failure
                                scope.currentInvite = res;
                                scope.currentInvite.emails = [];
                                scope.fields.email.error = true;
                                scope.ui.saving = false;
                                Raven.captureMessage('Created invitation, but failed to send email.');
                            }
                            EventBus.$emit('updateListInvitations', true);
                            scope.ui.saving = false;
                        });
                } else {

                    if (res.errors && res.errors[0] && res.errors[0].type == 'InvitationAlreadySentToVat') {
                        scope.ui.invitationAlreadySentToVatError = true;
                    }

                    scope.ui.saving = false;
                }
            });
        },

        formatInvitations(invitations) {
            var scope = this;

            scope.departments = [];

            invitations.forEach(function(invitation) {
                /**
                 * Figure out departments
                 */
                if (invitation && invitation.department && invitation.department.name && scope.departments.indexOf(invitation.department.name) < 0) {
                    scope.departments.push(invitation.department.name);
                } else if (invitation && invitation.department === null && scope.departments.indexOf('_default') < 0) {
                    scope.departments.push('_default');
                }

                /**
                 * Use official phone number if no phone number exists
                 * (extra info for admin only)
                 */
                if (invitation && invitation.adminData && invitation.adminData.officialPhone && !invitation.adminData.phoneNumber) {
                    invitation.adminData.phoneNumber = invitation.adminData.officialPhone;
                }
            });

            scope.departments.sort();
            scope.departments.push(scope.departments.shift());
        },

        getCurrentLanguage(code) {
            var langName = null;

            for (var i = 0; i < this.langOptions.length; i++) {
                if (this.langOptions[i].code == code) {
                    langName = this.langOptions[i].name;
                }
            }
            return langName;
        },

        close() {
            this.$emit('close');
        },

        validateEmail(force) {
            if (force || !this.fields.email.valid) {
                this.fields.email.valid = Validator.email(this.fields.email.value);
            }

            return this.fields.email.valid;
        },

        validateVat(force) {
            if (this.fields.vat.value.length == 0) {
                this.fields.vat.valid = true;
                return true;
            }

            this.fields.vat.alreadyInvited = this.invitationsVats.indexOf(this.fields.vat.value) !== -1;

            if (force || !this.fields.vat.valid) {
                this.fields.vat.valid = Validator.vat(this.fields.vat.value);
            }

            return this.fields.vat.valid;
        },

        showInviteFieldTutorialName() {
            if (this.tutorial.current && this.tutorial.current.name == 'invitationNameInput' && !this.tutorial.state.loading && !this.tutorial.state.finished) {
                this.ui.newConnectionDialog = false;
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

        showInviteFieldTutorialVat() {
            return this.tutorial.current && this.tutorial.current.name == 'invitationVatInput' && !this.tutorial.state.loading && !this.tutorial.state.finished;
        },

        showInviteFieldTutorialEmail() {
            return this.tutorial.current && this.tutorial.current.name == 'invitationEmailInput' && !this.tutorial.state.loading && !this.tutorial.state.finished;
        },

        showInviteFieldTutorialSubmit() {
            return this.tutorial.current && this.tutorial.current.name == 'invitationSubmitInput' && !this.tutorial.state.loading && !this.tutorial.state.finished;
        },

        showNewInvitationsModal() {
            this.close();
            this.$modal.show(multipleInvitations, {done: this.done, invitationsVats: this.invitationsVats}, {width: '70%', height: 'auto'});
        },

        validateName(force) {
            if (force || !this.fields.name.valid) {
                this.fields.name.valid = Validator.minLength(this.fields.name.value, 2);
            }

            return this.fields.name.valid;
        },

        showLinkDialog(link) {
            this.$modal.show(copyLink, {shareLinkInfo:  link, withoutPin: true}, {height: 'auto'});

        },
    };

    const computed = {
        invitationsVats() {
            return this.invitations.map(invitation => invitation.vat);
        },
        showInvitationVatError() {
            return (this.ui.invitationAlreadySentToVatError || this.fields.vat.alreadyInvited) && this.fields.vat.valid
        }
    };

    export default Vue.extend({
        name: 'show-new-invitations-modal',
        template,
        data,
        methods,
        computed,
        props: ['done'],
        components: {
            modal,
            'date-field': dateField,
            'tutorial-slide' : tutorialSlide,
        },
        mounted: function() {
            this.init();
        },
    });
