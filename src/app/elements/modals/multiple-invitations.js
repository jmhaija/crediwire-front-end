    import Vue from 'Vue'
    import moment from 'moment'
    import modal from 'elements/modals/modal'
    import switchWithLabels from 'elements/switch-with-labels'
    import DictionaryModel from 'models/DictionaryModel'
    import PresentationTemplateCollection from 'collections/PresentationTemplateCollection'
    import UserModel from 'models/UserModel'
    import ContextModel from 'models/ContextModel'
    import InvitationCollection from 'collections/InvitationCollection'
    import LanguageCollection from 'collections/LanguageCollection'
    import AssetModel from 'models/AssetModel'
    import InvitationModel from 'models/InvitationModel'
    import InvitationEmailModel from 'models/InvitationEmailModel'
    import ConnectionCollection from 'collections/ConnectionCollection'
    import Validator from 'services/Validator'

    const template = `
        <modal :title="ui.dictionary.invitations.newMultiple" :close="close">           
        
        <template v-slot:content>
        
            <section class="invitation-list multiple-invitation-list">
               <div class="invitation"
                    v-for="(invitation, index) in invitations">
    
                     <!--Name field-->
                       <div class="field">
                           <div class="input-field">
                               <input type="text" v-model="invitation.name.value" v-bind:class="{ invalid : !invitation.name.valid }" v-on:keyup="validateName(invitation)" v-on:blur="validateName(invitation, true)">
                               <label v-bind:class="{ filled: invitation.name.value.length > 0 }">{{ui.dictionary.invitations.name}}</label>
                               <div class="warning" v-bind:class="{ show : !invitation.name.valid }">{{ui.dictionary.general.validation.generic}}</div>
                           </div>
                       </div>
        
                          <!-- Email field-->
                       <div class="field">
                           <div class="input-field">
                               <input type="text" v-model="invitation.email.value" v-bind:class="{ invalid : !invitation.email.valid || invitation.email.ownEmail }" v-on:keyup="validateEmail(invitation)" v-on:blur="validateEmail(invitation, true)">
                               <label v-bind:class="{ filled: invitation.email.value.length > 0 }">{{ui.dictionary.invitations.email}}</label>
                               <div class="warning" v-bind:class="{ show : !invitation.email.valid }">{{ui.dictionary.general.validation.email}}</div>
                                   <div class="warning" :class="{ show : invitation.email.ownEmail }">{{ui.dictionary.general.validation.ownEmail}}</div>
                           </div>
                       </div>
        
                          <!-- VAT field-->
                       <div class="field">
                           <div class="input-field">
                               <input type="text" v-model="invitation.vat.value" v-bind:class="{ invalid : !invitation.vat.valid }" v-on:keyup="validateVAT(invitation)" v-on:blur="validateVAT(invitation, true)">
                               <label v-bind:class="{ filled: invitation.vat.value.length > 0 }">{{ui.dictionary.company.vat}}</label>
                               <div class="warning" v-bind:class="{ show : !invitation.vat.valid }">{{ui.dictionary.general.validation.vat}}</div>
                           <div class="warning" v-bind:class="{ show : invitation.vat.alreadyInvited }">{{ui.dictionary.invitations.invitationAlreadySentToVat}}</div>
                       </div>
                   
                   </div>
                     <!-- Type field-->
               
                  <div class="field">
                    <switch-with-labels v-model="invitation.type" firstValue="see" secondValue="show" @input="function(value) { template.type = value }">
                           <span slot="label-right" :class="[invitation.type === 'show' ? 'primary-color' : 'faded']">{{ui.dictionary.connections.typeShared}}</span>
                           <span slot="label-left" :class="[invitation.type === 'see' ? 'primary-color' : 'faded']">{{ui.dictionary.connections.typeNormal}}</span>
                    </switch-with-labels>
                  </div>
    
                     <!-- Language Selection-->
                     
                <div class="field">
                    <p style="margin: 0 0 0.3rem 0; padding: 0; font-size: 0.9rem;">{{ui.dictionary.profile.defaultLanguage}}</p>
                    <div class="selector">
                       <div class="label" v-on:click.stop="invitation.langOptions = true">
                           <span class="filled">{{getCurrentLanguage(invitation.lang)}}</span> <i class="cwi-down"></i>
                           <div class="options" v-bind:class="{ show : invitation.langOptions }">
                               <div class="option" v-for="lang in langOptions" v-bind:class="{ selected : lang.code == invitation.language }" v-on:click.stop="changeLang(invitation, lang.code)">
                                   <span>{{getCurrentLanguage(lang.code)}}</span>
                               </div>
                           </div>
                       </div>
                    </div>
                </div>
    
                      <!--Actions-->
                   <div class="field right-text" style="width: 14%;">
                       <div v-show="invitation.working">
                           <div class="working inline"></div>
                       </div>
                       <div v-show="!invitation.working && invitation.exists && !invitation.done">
                           <small class="warn-color">{{ui.dictionary.invitations.exists}} <button class="primary invitation-individual-button" @click="sendInvitation(invitation)">{{ui.dictionary.invitations.sendAgain}}</button></small>
                       </div>
                       <div v-show="!invitation.working && !invitation.exists && !invitation.done">
                           <i class="cwi-trash clickable" v-on:click="removeInvitation(index)" v-show="index > 0"></i>
                       </div>
    
                       <div v-show="!invitation.working && !invitation.exists && invitation.done">
                           <i class="cwi-approve primary-color"></i>
                       </div>
                   </div>
                </div>
            </section>

        </template>
        
        <template v-slot:footer>
            <section class="invitation-add" style="width: 100%; padding: 0 9px;" v-show="!ui.working || ui.validationErrors">
              <div class="float-right zero-padding" style="margin-top: 0">
                   <button class="primary" v-on:click="sendInvitations()">{{ui.dictionary.invitations.send}}</button>
               </div>
                 <button v-on:click="addInvitation()"><i class="cwi-add"></i> {{ui.dictionary.invitations.new}}</button>
            </section>
    
            <section class="invitation-add" v-show="ui.working && !ui.validationErrors">
               <div class="float-right zero-padding">
                   <button class="primary" @click="completeInvitationProcess" v-handle-enter-press="completeInvitationProcess">{{ui.dictionary.invitations.done}}</button>
               </div>
            </section>
        </template>                           
        </modal>
    `;


    const data = () => ({
        ui: {
            dictionary: DictionaryModel.getHash(),
            langOptions : false,
            working : false,
            validationErrors : false,
            loading: false,
        },
        template : {
            type : 'see',
            lang : 'da-DK',
        },
        invitations : [],
        langOptions : [],
        permissions : UserModel.getCompanyUserInfo(),
        profile : UserModel.profile(),
        departments: [],
        existingInvitations : []
    });

    const methods = {
        init() {
            this.langOptions = LanguageCollection.getList();
            this.template.lang = DictionaryModel.getLanguage();
            this.addInvitation();
            this.getExistingInvitations();
            //this.getExistingConnections();
        },

        sendInvitations() {
            this.ui.working = true;
            this.ui.validationErrors = false;

            this.invitations.forEach(function (invitation) {
                invitation.working = true;
                if (this.checkInviteValid(invitation) && this.checkExistingInvite(invitation)) {
                    this.sendInvitation(invitation);
                } else {
                    invitation.working = false;
                }
            }.bind(this));
        },

        sendInvitation(invitation) {
            invitation.working = true;

            var im = new InvitationModel();
            im.createInvitation({
                name : invitation.name.value,
                type : invitation.type,
                language : invitation.lang,
                vat : invitation.vat.value
            }).then(function(res) {
                if (res.id) {
                    var em = new InvitationEmailModel(res.id);
                    em.sendInvite(invitation.email.value, false, false, false)
                        .then(function(emailRes) {
                            if (emailRes.id) {
                                var rm1 = new InvitationEmailModel(res.id);
                                rm1.sendInvite(invitation.email.value, 'P7D', 'invite-reminder-1');

                                var rm2 = new InvitationEmailModel(res.id);
                                rm2.sendInvite(invitation.email.value, 'P21D', 'invite-reminder-2');
                            }

                            invitation.working = false;
                        });
                } else {

                    invitation.working = false;
                }

                invitation.done = true;
            }.bind(this));
        },

        completeInvitationProcess() {
            if (this.done) {
                this.done();
            }
            this.close();
        },

        checkInviteValid(invitation) {
            return this.validateName(invitation, true) &&
                   this.validateEmail(invitation, true) &&
                   this.validateVAT(invitation, true);
        },

        checkExistingInvite(invitation) {
            if (this.existingInvitations.indexOf(invitation.vat.value) >= 0) {
                invitation.exists = true;
                return false;
            }

            return true;
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

        getExistingConnections() {
            var cc = new ConnectionCollection('see');
            cc.checkUnique()
                .then(function(){}.bind(this));
        },

        addInvitation() {
            this.invitations.push({
                name : {
                    value : '',
                    valid : true
                },
                email : {
                    value : '',
                    valid : true,
                    ownEmail : false
                },
                vat : {
                    value : '',
                    valid : true,
                    alreadyInvited: false
                },
                type : this.template.type,
                lang : this.template.lang,
                langOptions : false,
                working : false,
                exists : false,
                done : false
            });
        },

        removeInvitation(index) {
            this.invitations.splice(index, 1);
        },

        changeLang(invitation, code) {
            invitation.lang = code;
            this.template.lang = code;
            invitation.langOptions = false;
        },

        changeType(invitation, type) {
            invitation.type = type;
            this.template.type = type;
        },

        validateName(invitation, force) {
            if (force || !invitation.name.valid) {
                invitation.name.valid = Validator.minLength(invitation.name.value, 2);
            }

            if (!invitation.name.valid) {
                this.ui.validationErrors = true;
            }

            return invitation.name.valid;
        },

        validateEmail(invitation, force) {
            if (force || !invitation.email.valid) {
                invitation.email.valid = Validator.email(invitation.email.value);
            }

            if (!invitation.email.valid) {
                this.ui.validationErrors = true;
            }

            invitation.email.ownEmail = Validator.isOwnEmail(invitation.email.value);

            return invitation.email.valid;
        },

        validateVAT(invitation, force) {
            if (invitation.vat.value.length == 0) {
                invitation.vat.valid = true;
                return true;
            }

            invitation.vat.alreadyInvited = this.invitationsVats.indexOf(invitation.vat.value !== -1);

            if (force || !invitation.vat.valid) {
                invitation.vat.valid = Validator.vat(invitation.vat.value);
            }

            if (!invitation.vat.valid) {
                this.ui.validationErrors = true;
            }

            return invitation.vat.valid;
        },

        getImage(img) {
            return new AssetModel(img).path;
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
        }
    };


    export default Vue.extend({
        name: 'multiple-invitations',
        template,
        data,
        methods,
        props: ['done', 'invitationsVats'],
        components: {
            modal,
            'switch-with-labels' : switchWithLabels
        },
        mounted() {
            this.init();
        },
    });
