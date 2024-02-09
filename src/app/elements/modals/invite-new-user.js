define([
    'Vue',
    'elements/modals/modal',
    'elements/invite-user-settings',
    'elements/date-field',
    'models/DictionaryModel',
    'collections/LanguageCollection',
    'services/Validator'
], function (Vue, modal, inviteUserSettings, dateField, DictionaryModel, LanguageCollection, Validator) {
    const template = `
        <modal :title="dictionary.company.userInvitation.title" :close="close">
            <template v-slot:content>
               <div class="input-field">
                   <input type="text" v-model="userInvitation.name.value" v-bind:class="{ invalid : !userInvitation.name.valid }" v-on:keyup="validateName()" v-on:blur="validateName(true)">
                   <label v-bind:class="{ filled: userInvitation.name.value.length > 0 }">{{dictionary.company.userInvitation.name}}</label>
                   <div class="warning" v-bind:class="{ show : !userInvitation.name.valid }">{{dictionary.general.validation.generic}}</div>
               </div>

               <div class="input-field">
                   <input type="text" v-model="userInvitation.email.value" v-bind:class="{ invalid : !userInvitation.email.valid }" v-on:keyup="validateEmail()" v-on:blur="validateEmail(true)">
                   <label v-bind:class="{ filled: userInvitation.email.value.length > 0 }">{{dictionary.company.userInvitation.email}}</label>
                   <div class="warning" v-bind:class="{ show : !userInvitation.email.valid }">{{dictionary.general.validation.email}}</div>
               </div>
               
               <invite-user-settings :user="userInvitation"></invite-user-settings>
               
               <div>
                   <span class="more-options" v-show="showMoreOptions" v-on:click="showMoreOptions = false">&ndash; {{dictionary.company.userInvitation.lessOptions}}</span>
                   <span class="more-options" v-show="!showMoreOptions" v-on:click="showMoreOptions = true">+ {{dictionary.company.userInvitation.moreOptions}}</span>
               </div>
               
               <div v-show="showMoreOptions">                
                   <div class="selector full-width">
                       <label class="filled">{{dictionary.profile.defaultLanguage}}</label>
                       <div class="label" v-on:click.stop="showLangOptions = true">
                           <span class="filled">{{getCurrentLanguage(userInvitation.language)}}</span> <i class="cwi-down"></i>
                           <div class="options" v-bind:class="{ show : showLangOptions }">
                               <div class="option" v-for="lang in langOptions" v-bind:class="{ selected : lang.code == userInvitation.language }" v-on:click.stop="userInvitation.language = lang.code; showLangOptions = false;">
                                   <span>{{lang.name}}</span>
                               </div>
                           </div>
                       </div>
                   </div>
                   
                   <div class="checkbox-field">
                       <label><input type="checkbox" v-model="userInvitation.make_owner"> <i></i> {{dictionary.company.userInvitation.makeOwner}}</label>
                   </div>


                   <div class="checkbox-field">
                       <label><input type="checkbox" v-model="userInvitation.remove_inviter"> <i></i> {{dictionary.company.userInvitation.removeInviter}}</label>
                   </div>
                   
                   <div class="date-label-small">Valid From Date</div>
                   <date-field :model="userInvitation.validFrom" :onDateSelect="selectValidFromDate"></date-field>

                    <div class="date-label-small">Valid To Date</div>
                    <date-field :model="userInvitation.validTo" :onDateSelect="selectValidToDate"></date-field>
               </div>
            </template>     
            
            <template v-slot:footer>
                <div class="button-container">
                   <span class="working inline" v-show="adding"></span>
                   <button class="primary" v-on:click="onAddUser(userInvitation)" v-show="!adding" v-handle-enter-press="function() { onAddUser(userInvitation); }">{{dictionary.company.userInvitation.inviteUser}}</button>
               </div>            
            </template>                                                                                                
        </modal>
    `;

    const data = function () {
        return {
            dictionary: DictionaryModel.getHash(),
            showMoreOptions: false,
            showLangOptions: false,
            langOptions: [],
            adding: false
        };
    };

    const methods = {
        validateName : function(force) {
            if (force || !this.userInvitation.name.valid) {
                this.userInvitation.name.valid = Validator.minLength(this.userInvitation.name.value, 2);
            }

            return this.userInvitation.name.valid;
        },

        validateEmail : function(force) {
            if (force || !this.userInvitation.email.valid) {
                this.userInvitation.email.valid = Validator.email(this.userInvitation.email.value);
            }

            return this.userInvitation.email.valid;
        },

        selectValidFromDate : function(value, valid) {
            if (!valid) {
                this.userInvitation.validFrom = null;
                return false;
            }

            this.userInvitation.validFrom = value;
        },

        selectValidToDate : function(value, valid) {
            if (!valid) {
                this.userInvitation.validTo = null;
                return false;
            }

            this.userInvitation.validTo = value;
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

        onAddUser(userInvitation) {
            this.adding = true;
            this.addUser(userInvitation, () => {this.close(); this.adding = false;});
        },

        close() {
            this.$emit('close');
        }
    };

    return Vue.extend({
        name: 'user-settings-dialog',
        template,
        data,
        methods,
        props: {
            userInvitation: {
                type: Object,
                required: true
            },
            addUser: {
                type: Function,
                required: true
            }
        },
        components: {
            modal,
            'invite-user-settings': inviteUserSettings,
            'date-field' : dateField
        },
        mounted: function() {
            this.langOptions = LanguageCollection.getList();
        },
    });
});
