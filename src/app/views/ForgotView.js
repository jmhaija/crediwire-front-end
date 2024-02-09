   import Vue from 'Vue'
   import DictionaryModel from 'models/DictionaryModel'
   import PartnerModel from 'models/PartnerModel'
   import Validator from 'services/Validator'
   import RecoveryEmail from 'services/RecoveryEmail'
   import languagePicker from 'components/languagePicker.vue'
   import AssetModel from 'models/AssetModel'
   import logoWidthMixin from 'mixins/logoWidthMixin'

   const template = `
        <article class="lone-component">
        
           <div class="lone-logo">
               <img :src="getImage()" :class="partner.code" :style="{ width: logoWidth }">
           </div>


           <div class="login-form">
        
           <div class="float-right"><language-picker :callback="changeDictionary"></language-picker></div>

           <section class="messages" v-show="!ui.completed">
               <div class="normal primary-color" :style="{ color : getColor() }">{{ui.dictionary.recover.email}}</div>
           </section>
           <section class="form" v-show="!ui.completed">
               <form v-on:submit.prevent="sendEmail(forgot.email.value)">
                   <v-popover :open="ui.showEmailPopover" placement="left" class="blocker">
                       <div class="input-field">
                           <input :placeholder="ui.dictionary.general.labels.email" class="white" type="text" v-model="forgot.email.value" v-bind:class="{ invalid : !forgot.email.valid }" v-on:keyup="validateEmail()" v-on:blur="validateEmail(true)">
                           <label v-bind:class="{ filled: forgot.email.value.length > 0 }">{{ui.dictionary.general.labels.email}}</label>
                           <div class="warning" v-bind:class="{ show : !forgot.email.valid }">{{ui.dictionary.general.validation.email}}</div>
                       </div>
                       <template slot="popover">
                           {{ui.dictionary.onboarding.forgot.email}}
                           <div class="buttons">
                               <button v-close-popover>{{ui.dictionary.onboarding.close}}</button>
                           </div>
                       </template>
                   </v-popover>
                   <v-popover :open="ui.showButtonPopover" placement="right" class="blocker">
                       <section class="messages full-width">
                           <div><div class="working" v-show="ui.working"></div><button class="accent" type="submit" v-show="!ui.working">{{ui.dictionary.recover.send}}</button></div>
                           <div class="left-text"><router-link :to="makeLink('/login')" :style="{ color : getColor() }">{{ui.dictionary.recover.login}}</router-link></div>
                       </section>
                       <template slot="popover">
                           {{ui.dictionary.onboarding.forgot.button}}
                           <div class="buttons">
                               <button v-close-popover>{{ui.dictionary.onboarding.close}}</button>
                           </div>
                       </template>
                   </v-popover>
               </form>
           </section>
           <section class="message-bar" v-show="ui.completed">
               <div class="normal">{{ui.dictionary.recover.sent}}</div>
               <div class="normal"><p><router-link to="/login" :style="{ color : getColor() }">{{ui.dictionary.recover.login}}</router-link></p></div>
           </section>
        
           </div>
        </article>
        `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            working : false,
            completed : false,
            showEmailPopover : false,
            showButtonPopover : false
        },
        forgot : {
            email : { value : '', valid : true }
        },
        partner : PartnerModel.getPartner(),
        inTutorial : false
    });

    const methods = {
        init() {
            setTimeout(function() {
                if (this.forgot.email.value.length === 0) {
                    this.inTutorial = true;
                    this.ui.showEmailPopover = true;
                }
            }.bind(this), 2000);
        },

        getColor() {
            if (this.partner && this.partner.color) {
                return this.partner.color;
            } else {
                return '#2fabff';
            }
        },

        getImage() {
            if (this.partner && this.partner.logo) {
                return new AssetModel(this.partner.logo).path;
            }

            return new AssetModel('/assets/img/logo/default.png').path;
        },

        validateEmail(force) {
            if (force || !this.forgot.email.valid) {
                this.forgot.email.valid = Validator.email(this.forgot.email.value);
            }

            this.ui.showEmailPopover = false;

            if (this.forgot.email.valid && this.inTutorial) {
                this.ui.showButtonPopover = true;
            }

            return this.forgot.email.valid;
        },

        changeDictionary(hash) {
            this.ui.dictionary = hash;
        },

        /**
         * Send recovery email
         */
        sendEmail(email) {
            this.ui.showButtonPopover = false;
            this.inTutorial = false;

            if ( !this.validateEmail(true) ) {
                return false;
            }

            var scope = this;
            scope.ui.working = true;

            RecoveryEmail.send(email)
                .then(function(response) {
                    scope.ui.working = false;
                    scope.ui.completed = true;
                });
        },

        /**
         * Create context-sensitive link
         */
        makeLink(url) {
            if (this.partner) {
                return '/' + this.partner.code + url;
            }

            return url;
        }
    };


    export default Vue.extend({
        template,
        data,
        methods,
        components : {
            'language-picker' : languagePicker
        },
        mixins: [logoWidthMixin],
        mounted() {
            this.init();
        }
    });
