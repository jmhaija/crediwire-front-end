define([
    'Vue',
    'moment',
    'elements/modals/modal',
    'models/DictionaryModel',
    'services/Validator'
], function (Vue, moment, modal, DictionaryModel, Validator) {
    const template = `
        <modal :title="ui.dictionary.company.userInvitation.title" :close="close">                                        
            <template v-slot:content>
                <div class="input-field">
                    <input type="text" v-model="userInvitation.name.value" v-bind:class="{ invalid : !userInvitation.name.valid }" v-on:keyup="validateName()" v-on:blur="validateName(true)">
                    <label v-bind:class="{ filled: userInvitation.name.value.length > 0 }">{{ui.dictionary.company.userInvitation.name}}</label>
                    <div class="warning" v-bind:class="{ show : !userInvitation.name.valid }">{{ui.dictionary.general.validation.generic}}</div>
                </div>  
                
                <div class="input-field">
                    <input type="text" v-model="userInvitation.email.value" v-bind:class="{ invalid : !userInvitation.email.valid }" v-on:keyup="validateEmail()" v-on:blur="validateEmail(true)">
                    <label v-bind:class="{ filled: userInvitation.email.value.length > 0 }">{{ui.dictionary.company.userInvitation.email}}</label>
                    <div class="warning" v-bind:class="{ show : !userInvitation.email.valid }">{{ui.dictionary.general.validation.email}}</div>
                </div>
                
                <invite-user-settings :user="userInvitation"></invite-user-settings>
                
                <div>
                   <span class="more-options" v-show="ui.showMoreOptions" v-on:click="ui.showMoreOptions = false">&ndash; {{ui.dictionary.company.userInvitation.lessOptions}}</span>
                   <span class="more-options" v-show="!ui.showMoreOptions" v-on:click="ui.showMoreOptions = true">+ {{ui.dictionary.company.userInvitation.moreOptions}}</span>
                </div>
               
                <div v-show="ui.showMoreOptions">

                   <div class="selector full-width">
                       <label class="filled">{{ui.dictionary.profile.defaultLanguage}}</label>
                       <div class="label" v-on:click.stop="ui.langOptions = true">
                           <span class="filled">{{getCurrentLanguage(userInvitation.language)}}</span> <i class="cwi-down"></i>
                           <div class="options" v-bind:class="{ show : ui.langOptions }">
                               <div class="option" v-for="lang in langOptions" v-bind:class="{ selected : lang.code == userInvitation.language }" v-on:click.stop="userInvitation.language = lang.code; ui.langOptions = false;">
                                   <span>{{lang.name}}</span>
                               </div>
                           </div>
                       </div>
                   </div>

                   <div class="checkbox-field">
                       <label><input type="checkbox" v-model="userInvitation.make_owner"> <i></i> {{ui.dictionary.company.userInvitation.makeOwner}}</label>
                   </div>

                   <div class="checkbox-field">
                       <label><input type="checkbox" v-model="userInvitation.remove_inviter"> <i></i> {{ui.dictionary.company.userInvitation.removeInviter}}</label>
                   </div>

                   <div class="date-label-small">Valid From Date</div>
                   <date-field :model="userInvitation.validFrom" :onDateSelect="selectValidFromDate"></date-field>

                   <div class="date-label-small">Valid To Date</div>
                   <date-field :model="userInvitation.validTo" :onDateSelect="selectValidToDate"></date-field>
               </div>          
            </template>
            <template v-slot:footer>
                <span class="working inline" v-show="ui.adding"></span>
                <button class="primary" v-on:click="addUser(userInvitation)" v-show="!ui.adding" v-handle-enter-press="function() { addUser(userInvitation); }">{{ui.dictionary.company.userInvitation.inviteUser}}</button>
            </template>                                                       
        </modal>
    `;


    const data = function () {
        return {
            ui: {
                dictionary: DictionaryModel.getHash()
            }
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
        close() {
            this.$emit('close');
        }
    };

    return Vue.extend({
        name: 'user-invitation',
        template,
        data,
        methods,
        props: [],
        components: {
            modal
        },
        mounted: function() {},
    });
});
