    import Vue from 'Vue'
    import DictionaryModel from 'models/DictionaryModel'
    import UserModel from 'models/UserModel'
    import LanguageCollection from 'collections/LanguageCollection'
    import Validator from 'services/Validator'
    import Toast from 'services/Toast'
    import EventBus from 'services/EventBus'

    const template = `
        <article>
           <header class="section-heading">{{ui.dictionary.profile.title}}</header>
           <section class="form">
               <form v-on:submit.prevent="saveProfile()">
                   <div class="input-field">
                       <input type="text" v-model="profile.name.value" v-bind:class="{ invalid : !profile.name.valid }" v-on:keyup="validateName()" v-on:blur="validateName(true)">
                       <label v-bind:class="{ filled: profile.name.value.length > 0 }">{{ui.dictionary.profile.name}}</label>
                       <div class="warning" v-bind:class="{ show : !profile.name.valid }">{{ui.dictionary.general.validation.name}}</div>
                   </div>
                   <div class="input-field">
                       <input type="text" v-model="profile.email.value" v-bind:class="{ invalid : !profile.email.valid }" v-on:keyup="validateEmail()" v-on:blur="validateEmail(true)">
                       <label v-bind:class="{ filled: profile.email.value.length > 0 }">{{ui.dictionary.profile.email}}</label>
                       <div class="warning" v-bind:class="{ show : !profile.email.valid }">{{ui.dictionary.general.validation.email}}</div>
                   </div>
                   <div class="input-field">
                       <input type="text" v-model="profile.phone.value">
                       <label v-bind:class="{ filled: profile.phone.value.length > 0 }">{{ui.dictionary.profile.phone}}</label>
                   </div>

                   </div>
                   <div class="selector full-width">
                       <label class="filled">{{ui.dictionary.profile.defaultLanguage}}</label>
                       <div class="label" v-on:click.stop="ui.langOptions = true">
                           <span data-test-id="setupLanguage" class="filled">{{getCurrentLanguage(profile.language.value)}}</span> <i class="cwi-down"></i>
                           <div class="options" v-bind:class="{ show : ui.langOptions }">
                               <div data-test-id="getLanguage" class="option" v-for="lang in langOptions" v-bind:class="{ selected : lang.code == profile.language.value }" v-on:click.stop="profile.language.value = lang.code; ui.langOptions = false;">
                                   <span>{{lang.name}}</span>
                               </div>
                           </div>
                       </div>
                   </div>
                   <section class="toolbar">
                        <div class="working" v-show="ui.working"></div><button data-test-id="saveProfile" v-show="!ui.working" type="submit" class="primary">{{ui.dictionary.profile.save}}</button>
                   </section>
               </form>
           </section>
        </article>
`;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            viewOptions : false,
            langOptions : false,
            working : false
        },
        profile : {
            name : { value : '', valid : true },
            phone : { value : '', valid : true },
            email : { value : '', valid : true },
            language : { value : '', valid : true },
            easyview : { value : false, valid : true },
        },
        viewOptions : [
            { id : 'easyview', value : true },
            { id : 'financeview', value : false }
        ],
        langOptions : []
    });

    const methods = {

        init() {
            this.langOptions = LanguageCollection.getList();
            this.bindUserModelToData();

            /**
             * Event listeners
             */
            EventBus.$on('clickAppBody', this.closeOptions);
            document.addEventListener('clickAppBody', this.closeOptions);
        },

        closeOptions() {
            this.ui.viewOptions = false;
            this.ui.langOptions = false;
        },

        /**
         * Bind user model to form data
         */
        bindUserModelToData() {
            var user = UserModel.profile();

            this.profile.name.value = user.name ? user.name : '';
            this.profile.phone.value = user.phone ? user.phone : '';
            this.profile.email.value = user.email ? user.email : '';
            this.profile.language.value = user.language ? user.language : '';
            this.profile.easyview.value = user['easy-view'] ? user['easy-view'] : false;
        },

        validateName(force) {
            if (force || !this.profile.name.valid) {
                this.profile.name.valid = Validator.name(this.profile.name.value, 2);
            }

            return this.profile.name.valid;
        },

        validateEmail(force) {
            if (force || !this.profile.email.valid) {
                this.profile.email.valid = Validator.email(this.profile.email.value);
            }

            return this.profile.email.valid;
        },

        /**
         * Get the current language name
         */
        getCurrentLanguage(code) {
            var langName = null;

            for (let i = 0; i < this.langOptions.length; i++) {
                if (this.langOptions[i].code === code) {
                    langName = this.langOptions[i].name;
                }
            }

            return langName;
        },

        /**
         * Save profile information
         */
        saveProfile() {
            if ( !this.validateEmail(true) || !this.validateName(true) ) {
                return false;
            }

            var scope = this;
            var user = UserModel.profile();

            scope.ui.working = true;
            user.name = this.profile.name.value;
            user.phone = this.profile.phone.value;
            user.email = this.profile.email.value;
            user.language = this.profile.language.value;
            user['easy-view'] = this.profile.easyview.value;

            UserModel.construct(user);
            UserModel.save()
                .then(function(res) {
                    if (res.success) {
                        if (scope.ui.dictionary.meta.code != res.contents.language) {
                            //TODO: It would be cool to catch language changes through the change of the Vuex state and show toasts there
                            scope.changeDictionary(res.contents.language).then(() => Toast.show(scope.ui.dictionary.profile.saved));
                        }
                    } else {

                        Toast.show(scope.ui.dictionary.profile.notsaved, 'warning');
                    }

                    scope.ui.working = false;
                });

        },

        /**
         * Change dictionary
         */
        changeDictionary(language) {
            var scope = this;

            DictionaryModel.setLanguage(language);
            return DictionaryModel.fetchDictionary(true)
                .then(function(dict) {
                    DictionaryModel.setHash(dict);
                    scope.ui.dictionary = dict;
                    EventBus.$emit('uiLanguageChanged');
                });
        }
    };


    export default Vue.extend({
        template,
        data,
        methods,
        created() {
            this.init();
        },
        beforeDestroy() {
            EventBus.$off('clickAppBody', this.closeOptions);
            document.removeEventListener('clickAppBody', this.closeOptions);
        }
    });
