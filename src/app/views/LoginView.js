/* global gapi, FB */
import Vue from 'Vue'
import UserModel from 'models/UserModel'
import DictionaryModel from 'models/DictionaryModel'
import XSRFModel from 'models/XSRFModel'
import PartnerModel from 'models/PartnerModel'
import CompanyModel from 'models/CompanyModel'
import ErpModel from 'models/ErpModel'
import ContextModel from 'models/ContextModel'
import AssetModel from 'models/AssetModel'
import InviteTokenModel from 'models/InviteTokenModel'
import Validator from 'services/Validator'
import Logger from 'services/Logger'
import Config from 'services/Config'
import Logout from 'services/Logout'
import Toast from 'services/Toast'
import EconomicSelf from 'services/EconomicSelf'
import languagePicker from 'components/languagePicker.vue'
import logoWidthMixin from 'mixins/logoWidthMixin'
import Track from 'services/Track'

const template = `
        <article class="lone-component">
           <div class="lone-logo">
               <img :src="getImage()" :class="partner.code" :style="{ width: logoWidth }">
           </div>

           <div v-if="descriptionString">
               <p v-html="parseLinks(descriptionString)"></p>
           </div>

           <div class="login-form">
           <div class="float-right"><language-picker :callback="changeDictionary"></language-picker></div>
           <section class="messages">
               <div class="normal primary-color" :style="{ color : getColor() }">{{ui.dictionary.login.prompt}} <i class="cwi-lock"></i></div>
           </section>
           <div class="line-spacer"></div>

           <section class="message-bar" v-if="ui.working || errors.failed || errors.network">
               <div class="normal" v-show="ui.working">{{ui.dictionary.login.progress}}</div>
               <div data-test-id="loginFailed" class="warning" v-show="errors.failed">{{ui.dictionary.login.failed}}</div>
               <div class="error" v-show="errors.network">{{ui.dictionary.general.errors.network}}</div>
           </section>

           <section class="form">
               <form v-on:submit.prevent="loginEmail(login.email.value, login.password.value)">
                   <div class="input-field">
                       <input
                            data-test-id="loginEmailInput"
                            type="text"
                            :placeholder="ui.dictionary.general.labels.email"
                            class="white"
                            v-model="login.email.value"
                            v-bind:class="{ invalid : !login.email.valid }"
                            v-on:keyup="validateEmail()"
                            v-on:blur="validateEmail(true)"
                            autofocus="autofocus"
                        >
                       <label v-bind:class="{ filled: login.email.value.length > 0 }">{{ui.dictionary.general.labels.email}}</label>
                       <div data-test-id="loginEmailInvalidWarning" class="warning" v-bind:class="{ show : !login.email.valid }">{{ui.dictionary.general.validation.email}}</div>
                   </div>
                   <div class="input-field">
                       <input
                            data-test-id="loginPasswordInput"
                            type="password"
                            :placeholder="ui.dictionary.general.labels.password"
                            class="white"
                            v-model="login.password.value"
                            v-bind:class="{ invalid : !login.password.valid }"
                            v-on:keyup="validatePassword()"
                            v-on:blur="validatePassword(true)"
                        >
                       <label v-bind:class="{ filled: login.password.value.length > 0 }">{{ui.dictionary.general.labels.password}}</label>
                       <div class="warning" v-bind:class="{ show : !login.password.valid }">{{ui.dictionary.general.validation.password}}</div>
                   </div>
                   <section class="messages">
                       <div class="float-right"><div class="working" v-show="ui.working"></div>
                       <button
                            data-test-id="loginButton"
                            type="submit"
                            v-show="!ui.working"
                            class="accent"
                        >{{ui.dictionary.login.action}}</button></div>
                       <div class="left-text"><router-link :to="makeLink('/register')" :style="{ color : getColor() }">{{ui.dictionary.register.prompt}}</router-link></div>
                   </section>
               </form>
           </section>
           <div class="line-spacer"></div>
           <div class="messages full-width">
               <div><router-link :to="makeLink('/forgot')" :style="{ color : getColor() }">{{ui.dictionary.login.forgot}}</router-link></div>
           </div>
           </div>
        </article>
        `;

const data = () => ({
    ui: {
        dictionary: DictionaryModel.getHash(),
        working: false,
        google: false,
        facebook: false
    },
    login: {
        email: { value: '', valid: true },
        password: { value: '', valid: true },
        attempts: 0,
        google: null,
        socialAttempts: {
            google: false,
            facebook: false
        }
    },
    errors: {
        failed: false,
        google: false,
        facebook: false,
        network: false
    },
    partner: PartnerModel.getPartner(),
    presetData: EconomicSelf.getInfo(),
    presetToken: EconomicSelf.getToken(),
});

const methods = {

    init: function () {
        /**
         * Clear user-related data
         */
        if (!this.$route.query || !this.$route.query.p) {
            Logout.clearAllData();
        }

        if (InviteTokenModel.getInfo() && InviteTokenModel.getInfo().email) {
            this.login.email.value = InviteTokenModel.getInfo().email;
        }

        this.presetLoginData();
    },

    parseLinks: function (string) {
        string = string.replace('[link=', '<a href="');
        string = string.replace(']', '" target="_blank">');
        string = string.replace('[/link]', '</a>');

        return string;
    },

    getColor: function () {
        if (this.partner && this.partner.color) {
            return this.partner.color;
        } else {
            return '#2fabff';
        }
    },

    getImage: function () {
        if (this.partner && this.partner.logo) {
            return new AssetModel(this.partner.logo).path;
        }
        return new AssetModel('/assets/img/logo/default.png').path;
    },

    presetLoginData: function () {
        if (this.presetData && this.presetData.user && this.presetData.user.email) {
            this.login.email.value = this.presetData.user.email;
        }
    },

    changeDictionary: function (hash) {
        this.ui.dictionary = hash;
    },

    validateEmail: function (force) {
        if (force || !this.login.email.valid) {
            this.login.email.valid = Validator.email(this.login.email.value);
        }

        return this.login.email.valid;
    },
    /**
     * Validate password
     *
     * We want to give as little away as possible about the password,
     * so we'll just check that the user entered something.
     */
    validatePassword: function (force) {
        if (force || !this.login.password.valid) {
            this.login.password.valid = Validator.minLength(this.login.password.value, 1);
        }

        return this.login.password.valid;
    },

    /**
     * Attempt to login using email and password.
     */
    loginEmail: function (email, password) {
        if (!this.validateEmail(true) || !this.validatePassword(true)) {
            return false;
        }


        var scope = this;
        scope.ui.working = true;
        scope.errors.failed = false;
        scope.errors.googleFailed = false;
        scope.errors.facebookFailed = false;
        scope.errors.network = false;
        var delay = scope.login.attempts * 500;

        setTimeout(function () {
            UserModel.fromLogin(email, password)
                .then((response) => {
                    //Successful login
                    if (response.success) {
                        scope.postLogin(response.contents);
                        let currentLang = DictionaryModel.getHash();
                        if (currentLang.meta.code !== response.contents.language) {
                            response.contents.language = currentLang.meta.code;
                        }
                        //Failed login
                    } else {
                        scope.errors.failed = true;
                        scope.login.attempts++;
                        scope.ui.working = false;
                    }
                }, (error) => {
                    //Error making a request
                    scope.errors.network = true;
                    Logger.log(error);
                    scope.ui.working = false;
                });
        }, delay);

    },

    /**
     * Action for after-login:
     * This is where user is constructed and navigation actions take place.
     */
    postLogin: function (response) {
        var scope = this;

        if (UserModel.profile() && UserModel.profile().id != response.id) {
            Logout.clearAllData(true);
        }

        localStorage.setItem('recognizedUser', true);

        response.settings.lastLogin = response.settings.thisLogin || new Date();
        response.settings.thisLogin = new Date();

        UserModel.construct(response);
        XSRFModel.set(response['xsrf-token']);

        UserModel.save();
        Track.am.log('LOGIN_BUTTON_CLICK');

        /**
         * Single company sign on if available
         */
        if (response.company) {
            CompanyModel.setCompany(response.company, this.$store);
        }



        DictionaryModel.setLanguage(response.language);
        DictionaryModel.fetchDictionary(true)
            .then(function (dict) {
                DictionaryModel.setHash(dict);

                if (scope.presetToken) {
                    scope.$router.push('/account/connect-company');
                } else if (InviteTokenModel.getInfo() && !InviteTokenModel.isCompanyUser()) {
                    scope.$router.push('/account/process-invite');
                } else if (InviteTokenModel.getInfo() && InviteTokenModel.isCompanyUser()) {
                    scope.$router.push('/setup-user');
                } else if (!response['agreed-to-latest-terms-of-service']) {
                    scope.$router.push({ path: '/new-tos' });
                } else if (response['specific-tos-key'] && !response['specific-tos-accepted']) {
                    scope.$router.push({ path: '/spec-tos' });
                } else if (scope.$route.query && scope.$route.query.p) {
                    scope.$router.push(scope.$route.query.p);
                } else {
                    scope.$router.push({ path: '/account/overview?postlogin=1' });
                }
            });
    },

    /**
     * Create context-sensitive link
     */
    makeLink: function (url) {
        if (this.partner) {
            return '/' + this.partner.code + url;
        }

        return url;
    },
};

export default Vue.extend({
    template,
    data,
    methods,
    props: {
        descriptionString: {}
    },
    components: {
        'language-picker': languagePicker
    },
    created: function () {
        this.init();
    },
    mixins: [logoWidthMixin]
});
