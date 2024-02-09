import Vue from 'Vue'
import UserModel from 'models/UserModel'
import DictionaryModel from 'models/DictionaryModel'
import PartnerModel from 'models/PartnerModel'
import XSRFModel from 'models/XSRFModel'
import InviteTokenModel from 'models/InviteTokenModel'
import Validator from 'services/Validator'
import Logger from 'services/Logger'
import Toast from 'services/Toast'
import EconomicSelf from 'services/EconomicSelf'
import languagePicker from 'components/languagePicker.vue'
import AssetModel from 'models/AssetModel'
import logoWidthMixin from 'mixins/logoWidthMixin'
import Track from 'services/Track'
import CountryCollection from 'collections/CountryCollection'
import CompanyCollection from 'collections/CompanyCollection'
import industrySelector from 'elements/industry-selector'
import CompanyModel from 'models/CompanyModel'
import EventBus from 'services/EventBus'
import ErpModel from 'models/ErpModel'
import askToConnect from 'elements/modals/ask-to-connect'
import SharedConnectionModel from 'models/SharedConnectionModel'
import Config from 'services/Config'

const template = `
    <article class="lone-component medium left-offset">
        <div v-show="ui.loading">
           <div class="app-loader"></div>
        </div>

        <div v-show="!ui.loading" class="register-component">

           <div class="logo">
               <img :src="getImage()" :class="partner.code" :style="{ width: logoWidth }">
           </div>

           <aside class="why-join" :style="{ backgroundColor : getColor() }">
               <h3>{{ui.dictionary.register.whyRegister}}</h3>
               <ul>
                   <li><i class="cwi-approve"></i> {{ui.dictionary.register.getOverview}}</li>
                   <li><i class="cwi-approve"></i> {{ui.dictionary.register.reduceTime}}</li>
                   <li><i class="cwi-approve"></i> {{ui.dictionary.register.shareData}}</li>
                   <li><i class="cwi-approve"></i> {{ui.dictionary.register.benchmark}}</li>
               </ul>
               <div class="more"><a href="https://crediwire.com" target="_blank">{{ui.dictionary.register.readMore}}</a></div>
           </aside>
           <main class="registration-form">
               <div class="float-right"><language-picker :callback="changeDictionary"></language-picker></div>
               <section class="messages">
                    <div class="normal primary-color" :style="{ color: getColor() }" v-show="!errors.unexpected && !errors.network">{{ui.dictionary.register.prompt}} <i class="cwi-lock"></i></div>
                    <div class="error" v-show="errors.network">{{ui.dictionary.general.errors.network}}</div>
                    <div class="error" v-show="errors.unexpected">{{ui.dictionary.general.errors.unexpected}}</div>
               </section>
               <section class="form">
                   <form v-on:submit.prevent="registerUser(register.email.value, register.password.value, register.connect)">                  
                       
                       <div class="selector full-width" id="country-select">
                        <div v-if="!isInviteWidgets" :class="{ 'input-field' : partner,  'germany-zero-padding-bottom' : ui.showICI}">
                         <div class="step done" v-if="partner"><span>1</span></div>
                            <div v-bind:class="{ unstep : partner, 'input-right-aligned' : partner && !ui.showICI, 'alignment-country-code' : partner && ui.showICI}">
                                <label class="filled">{{ui.dictionary.general.labels.country}}</label>
                                <div
                                    data-test-id="setupCompanyCountryDropdownTrigger"
                                    class="label country-label"
                                    v-on:click.stop="ui.countryOptions = true"
                                >
                                    <span
                                        data-test-id="setupCompanyCountry"
                                        v-bind:data-test-value="company.country.reference"
                                    >{{ui.dictionary.countries[company.country.reference]}}</span>
                                    <i class="cwi-down"></i>
                                    <div
                                        class="options"
                                        v-bind:class="{ show : ui.countryOptions }"
                                        data-test-id="setupCompanyCountryDropdown"
                                    >
                                        <div
                                            data-test-id="setupCompanyCountryDropdownOption"
                                            v-bind:data-test-value="country.reference"
                                            class="option"
                                            v-for="country in sortCountries(countries)"
                                            v-bind:class="{ selected : company.country && company.country.reference === country.reference }" v-on:click.stop="selectCountry(country)"
                                        >
                                            <span>{{ui.dictionary.countries[country.reference]}}</span>
                                        </div>
                                    </div>
                                </div>
                            
                             <section class="form" v-show="ui.showICI">
                                <div class="clickable" v-on:click="ui.showICI = false">&larr; {{ui.dictionary.industry.back}}</div>
                                <industry-selector :callback="selectIndustry"></industry-selector>
                            </section>
                            
                            <div v-show="company.country.reference === 'germany'" class="industry-code industry-code-input">
                                <label :class="{ invalid : ui.codeError, 'top-title' : partner }">{{ui.dictionary.industry.title}}</label>
                                <div
                                    data-test-id="setupCompanyIndustryDropdownTrigger"
                                    v-show="!company.code"
                                    class="select-code"
                                    :class="{ error : ui.codeError }"
                                    v-on:click="ui.showICI = true"
                                >{{ui.dictionary.industry.select}} <i class="cwi-right"></i></div>
                                <div class="warning" v-show="ui.codeError">{{ui.dictionary.industry.description}}</div>
                                <div v-if="company.code" class="selected">
                                    <span class="float-right" v-on:click="company.code = false"><i class="cwi-close"></i></span>
                                    <span :title="company.code.text"><i class="cwi-approve primary"></i> {{company.code.text}}</span>
                                </div>
                            </div>
                        </div>
                        </div>
                             <div class="input-field" v-if="!isInviteWidgets" :class="{ 'top-margin': company.country.reference === 'germany' && partner && !ui.showICI}">  
                                <div class="step" v-bind:class="{ done : company.name.value.length > 0 }" v-if="partner"><span>2</span></div>
                                    <div v-bind:class="{ unstep : partner, 'input-right-aligned' : partner }">                     
                                        <input
                                            data-test-id="setupCompanyNameInput"
                                            class="white"
                                            :placeholder="ui.dictionary.company.name"
                                            type="text"
                                            v-model="company.name.value"
                                            v-bind:class="{ invalid : !company.name.valid }"
                                            v-on:keyup="validateName()"
                                            v-on:blur="validateName(true)"
                                        />
                                        <label v-bind:class="{ filled: company.name.value.length > 0 }">{{ui.dictionary.company.name}}</label>
                                        <div class="warning" v-bind:class="{ show : !company.name.valid || invalidCompanyName }">{{ui.dictionary.general.validation.generic}}</div>
                                        <div class="warning" v-bind:class="{ show : errors.existsName && company.name.valid }">{{ui.dictionary.company.existsName}}</div>
                                </div>
                            </div>
                            
                           <div class="input-field" v-if="!isInviteWidgets">
                            <div class="step" v-bind:class="{ done : company.vat.value.length > 0 }" v-if="partner"><span>3</span></div>
                                <div v-bind:class="{ unstep : partner, 'input-right-aligned' : partner }">
                                <input
                                    data-test-id="setupCompanyVatInput"
                                    class="white"
                                    :placeholder="ui.dictionary.company.vat"
                                    type="text"
                                    v-model="company.vat.value"
                                    v-bind:class="{ invalid : !company.vat.valid }"
                                    v-on:keyup="validateVat(true)"
                                    v-on:blur="validateVat(true)"
                                />
                                <label v-bind:class="{ filled: company.vat.value.length > 0 }">{{ui.dictionary.company.vat}}</label>
                                 <div
                                    data-test-id="setupCompanyVatValidationWarning"
                                    class="warning"
                                    v-bind:class="{ show : !company.vat.valid || invalidCompanyVat }"
                                >{{ui.dictionary.general.validation.vat}}</div>
                                <div class="warning" v-bind:class="{ show : errors.exists && company.vat.valid }">{{ui.dictionary.company.exists}}</div>
                                </div>
                            </div>
                            
                       <div class="input-field">
                            <div class="step" v-bind:class="{ done : register.email.value.length > 0 }" v-if="partner"><span>4</span></div>
                                <div v-bind:class="{ unstep : partner, 'input-right-aligned' : partner }">
                                   <input
                                            data-test-id='registerEmailInput'
                                            :placeholder="ui.dictionary.register.email"
                                            autocomplete="no"
                                            class="white"
                                            type="text"
                                            id="email_input"
                                            v-model="register.email.value"
                                            v-bind:class="{ invalid : !register.email.valid || errors.exists , valid : register.email.valid && register.email.value.length > 0 && !errors.exists }"
                                            v-on:keyup="validateEmail()"
                                            v-on:blur="validateEmail(true)"
                                        >
                                       <label v-bind:class="{ filled: register.email.value.length > 0 }">{{ui.dictionary.register.email}}</label>
                                      <div
                                            data-test-id='registerEmailInvalidWarning'
                                            class="warning"
                                            v-bind:class="{ show : !register.email.valid }"
                                        >{{ui.dictionary.general.validation.email}}</div>
                                       <div
                                            data-test-id="accountAlreadyExistsWarning"
                                            class="warning"
                                            v-bind:class="{ show : errors.exists && register.email.valid }"
                                        >{{ui.dictionary.register.exists}}</div>
                                 </div>
                        </div>
                   </div>
                       <div class="input-field">
                           <div class="step" v-bind:class="{ done: register.password.value.length > 0 && register.password.valid }" v-if="partner"><span>5</span></div><div v-bind:class="{ unstep : partner }">
                               <input
                                data-test-id='registerPasswordInput'
                                :placeholder="ui.dictionary.register.password"
                                class="white"
                                type="password"
                                v-model="register.password.value"
                                v-bind:class="{ invalid : !register.password.valid, valid : register.password.valid && register.password.value.length > 0 }"
                                v-on:keyup="validatePassword()"
                                v-on:blur="validatePassword(true)"
                            >
                               <label v-bind:class="{ filled: register.password.value.length > 0 }">{{ui.dictionary.register.password}}</label>
                               <div
                                data-test-id='registerPasswordInvalidWarning'
                                class="warning"
                                v-bind:class="{ show : !register.password.valid }"
                            >{{ui.dictionary.general.validation.passwordEntropy}}</div>
                           </div>
                       </div>
                       <div class="input-field">
                           <div class="step" v-bind:class="{ done: register.password2.value.length > 0 && register.password2.valid }" v-if="partner"><span>6</span></div><div v-bind:class="{ unstep : partner }">
                               <input
                                data-test-id='registerPasswordVerificationInput'
                                :placeholder="ui.dictionary.register.password2"
                                class="white"
                                type="password"
                                v-model="register.password2.value"
                                v-bind:class="{ invalid : !register.password2.valid, valid : register.password2.valid && register.password2.value.length > 0 }"
                                v-on:keyup="verifyPassword()"
                                v-on:blur="verifyPassword(true)"
                            >
                               <label v-bind:class="{ filled: register.password2.value.length > 0 }">{{ui.dictionary.register.password2}}</label>
                               <div
                                data-test-id='registerPasswordVerificationInvalidSuccess'
                                class="notice"
                                v-bind:class="{ show : register.password2.valid && register.password2.value.length > 0 && register.password2.value.length == register.password.value.length  }"
                            ><i class="cwi-approve"></i> {{ui.dictionary.register.match}}</div>
                            <div
                                data-test-id='registerPasswordVerificationInvalidWarning'
                                class="warning"
                                v-bind:class="{ show : !register.password2.valid }"
                            >{{ui.dictionary.register.passwordMatch}}</div>
                           </div>
                       </div>
                      <div class="checkbox-field extra-space" v-if="partner">
                           <div class="step" v-bind:class="{ done: register.connect.value && register.connect.valid }"><span>7</span></div><div v-bind:class="{ unstep : partner }">
                               <label><input type="checkbox" v-model="register.connect.value" v-on:change="verifyConnect()"> <i></i> {{partner.connectString}} <span v-show="!partner.connectRequired">({{ui.dictionary.general.labels.optional}})</span></label>
                               <div class="warn-color small-text" v-show="!register.connect.valid">{{ui.dictionary.register.connect}}</div>
                           </div>
                       </div>


                       <div class="checkbox-field" v-if="hasInviteToken && inviteInfo && (inviteInfo.invitation_type === 'see') && !partner">
                           <div>
                               <label><input type="checkbox" v-model="register.connect.value"> <i></i> {{parseCompanyName(ui.dictionary.register.connectTo)}} ({{ui.dictionary.general.labels.optional}})</label>
                               <div class="small-text">{{ui.dictionary.register.connectDescription}}</div>
                           </div>
                       </div>
                       <div class="checkbox-field">
                       
                       <div v-if="isDefaultWidget" class="widget-legal-monster" id="legalmonster-signup-w2PtX6qC3KHZy2LNgZDq4tkq"></div>
                       <div v-if="isSwedishWidget" class="widget-legal-monster" id="legalmonster-signup-ogGbzhzWQyHuNcB3obtYYhh8"></div>
                       <div v-if="isNorwayWidget" class="widget-legal-monster" id="legalmonster-signup-KEHNGrnHA62ia1gdrA55jTAb"></div>
                       <div v-if="isOtherWidget" class="widget-legal-monster" id="legalmonster-signup-WXiMuyt4RPDfbJxmRFNrQtLT"></div>
                       
                       <div v-if="isDkTestInviteWidget" class="widget-legal-monster" id="legalmonster-signup-pgLEBkQnHCkBxKQFstgV1kBy"></div>
                       <div v-if="isSwedTestInviteWidget" class="widget-legal-monster" id="legalmonster-signup-aiWhgmF7EX9fLW81ZV1YJnZq"></div>
                       <div v-if="isNorwTestInviteWidget" class="widget-legal-monster" id="legalmonster-signup-aiWhgmF7EX9fLW81ZV1YJnZq"></div>
                       <div v-if="isOtherTestInviteWidget" class="widget-legal-monster" id="legalmonster-signup-aiWhgmF7EX9fLW81ZV1YJnZq"></div>
                       
                       
                       <div v-if="isDkTestNormalWidget" class="widget-legal-monster" id="legalmonster-signup-4GQF96RosBbAbmvrQBxf4Nu4"></div>
                       <div v-if="isSwedTestNormalWidget" class="widget-legal-monster" id="legalmonster-signup-oyBT9sEkm5FuhmD9ra5fpG4L"></div>
                       <div v-if="isNorwTestNormalWidget" class="widget-legal-monster" id="legalmonster-signup-4GQF96RosBbAbmvrQBxf4Nu4"></div>
                       <div v-if="isOtherTestNormalWidget" class="widget-legal-monster" id="legalmonster-signup-4GQF96RosBbAbmvrQBxf4Nu4"></div>
                       
                       <div v-if="isInviteDenmWidget" class="widget-legal-monster" id="legalmonster-signup-JtzCe1BktHdWoLArFXWESH63"></div>
                       <div  v-if="isInviteNorwWidget || isInviteSwedWidget || isInviteOtherWidget" class="widget-legal-monster" id="legalmonster-signup-x233LciB95cACapXkP7FxcFA"></div>
                       
                      </div>
                       <section class="toolbar full-width">
                           <div><div class="working" v-show="ui.working"></div><button
                            data-test-id="registerButton"
                            type="submit"
                            v-show="!ui.working"
                            class="accent"
                        >{{ui.dictionary.register.action}}</button></div>
                           <div class="left-text">{{ui.dictionary.register.account}} <router-link :to="makeLink('/login')" :style="{ color : getColor() }">{{ui.dictionary.login.action}}</router-link></div>
                       </section>
                   </form>
               </section>
           </main>
        </div>
    </article>`;

    const data = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                working : false,
                loading : false,
                countryOptions : false,
                showICI : false
            },
            register : {
                email : { value : '', valid : true },
                password : { value : '', valid : true},
                password2 : { value : '', valid : true},
                connect : { value : false, valid : true }
            },
            company : {
                name : { value : '', valid : true },
                vat : { value : '', valid : true },
                code : false,
                dpa : false,
                country : {
                    code:"DK",
                    code_long:"DNK",
                    id:"16549e19-3406-4e78-94ea-a264b00f6dd6",
                    name:"Denmark",
                    reference:"denmark"
                }
            },
            errors : {
                exists : false,
                network : false,
                existsName : false,
                unexpected : false
            },
            profile : {
                name : { value : '', valid : true },
                phone : { value : '', valid : true }
            },
            partner : PartnerModel.getPartner(),
            hasInviteToken : null,
            inviteInfo : null,
            presetData : EconomicSelf.getInfo(),
            fromLanding : false,
            landingPartner : null,
            countries : [],
            companies : [],
            existingCompanies : [],
            user : UserModel.profile(),
            legalMonsterCurrentKeyId: null,
            invitationFlow: false,
            isNorwayWidget: false,
            isSwedishWidget: false,
            isDefaultWidget: false,
            isOtherWidget: false,
            isInviteDenmWidget: false,
            isInviteNorwWidget: false,
            isInviteSwedWidget: false,
            isInviteOtherWidget: false,
            isDkTestInviteWidget: false,
            isSwedTestInviteWidget: false,
            isNorwTestInviteWidget: false,
            isOtherTestInviteWidget: false,
            isDkTestNormalWidget: false,
            isSwedTestNormalWidget: false,
            isNorwTestNormalWidget: false,
            isOtherTestNormalWidget: false,
            widgetLocale: '',
            env: Config.get('environment'),
            invalidCompanyName: false,
            invalidCompanyVat: false
        };
    };

    const methods = {

    init : function() {
        this.legalMonsterCurrentKeyId = null;
        this.$store.dispatch('setWidgetPublicKey', null);
        localStorage.setItem('recognizedUser', true);
        this.invitationFlow = false;
        this.checkForInviteToken();
        if (InviteTokenModel.getInfo()) {
            this.hasInviteToken = true;
            this.inviteInfo = InviteTokenModel.getInfo();
            if (InviteTokenModel.getInfo().email) {
                this.register.email.value = InviteTokenModel.getInfo().email;
            }
        }

        if (!this.$route.query?.token && !this.companyFromInvitationLink) {
            this.loadNormalRegisterWidget('DK');
        } else {
            this.loadWidgetInvitationFlow();
        }

        if (sessionStorage.getItem('progLandingEmail') && sessionStorage.getItem('progLandingPartner')) {
            this.fromLanding = true;
            this.landingPartner = sessionStorage.getItem('progLandingPartner');
            this.register.email.value = sessionStorage.getItem('progLandingEmail');
        }

        this.presetRegistrationData();
        this.getCountries();
    },

    extractEmailCookie : function (cookieString) {
        let parts = cookieString.split(';');
        parts.forEach(function (part) {
            if (part.indexOf('progLandingEmail') >= 0) {
                this.register.email.value = part.split('=')[1];
            }
        }.bind(this));
    },

    getColor : function() {
        if (this.partner && this.partner.color) {
            return this.partner.color;
        } else {
            return '#2fabff';
        }
    },

    getImage : function() {
        if (this.partner && this.partner.logo) {
            return new AssetModel(this.partner.logo).path;
        }

        return new AssetModel('/assets/img/logo/default.png').path;
    },

    presetRegistrationData : function() {
        if (this.presetData && this.presetData.user && this.presetData.user.email) {
            this.register.email.value = this.presetData.user.email;
        }
    },

    changeDictionary : function(hash) {
        this.ui.dictionary = hash;
    },

    checkForInviteToken : function() {
        if (this.$route.query && this.$route.query.token) {
            this.ui.loading = true;
            InviteTokenModel.setToken(this.$route.query.token);

            var type = false;
            if (this.$route.query.invite && this.$route.query.invite === 'company-user') {
                InviteTokenModel.markCompanyUser(true);
                type = 'company-user';
            }

            InviteTokenModel.parse(type)
                .then(function(res) {
                    if (!res.errors) {
                        InviteTokenModel.setInfo(res);
                        this.inviteInfo = res;
                        this.hasInviteToken = true;
                        if (res.request_erp_approval && (!this.$route.query || !this.$route.query.approved) ) {
                            this.$router.push('/company-approval');
                        } else if (res.email) {
                            this.register.email.value = res.email;
                            this.checkUserExistence(res.email, res.invitation_type);
                        }
                        this.invitationFlow = res.invitation_type === 'company-user';
                        if (this.invitationFlow) {
                            this.loadWidgetInvitationFlow(res.country?.code);
                            this.$store.dispatch('setCompanyFromInvitationLink', true);
                        } else {
                            this.loadNormalRegisterWidget('DK');
                            this.$store.dispatch('setCompanyFromInvitationLink', false);
                        }
                    } else {
                        this.$router.push('/invitation-expired');
                    }

                    this.ui.loading = false;
                }.bind(this));
        }
    },

    checkUserExistence : function(email, invitationType) {
        var scope = this;

        UserModel.checkRegister(email)
            .then(function(res) {
                if (!res.success && scope.partner && scope.partner.code) {
                    if (invitationType === 'company-user') {
                        scope.$store.dispatch('setCompanyFromInvitationLink', true);
                    }
                    scope.$router.push('/' + scope.partner.code + '/login');
                } else if (!res.success) {
                    if (invitationType === 'company-user') {
                        scope.$store.dispatch('setCompanyFromInvitationLink', true);
                    }
                    scope.$router.push('/login');
                }
            });
    },

    parseCompanyName : function(string) {
        return string.replace(':company', this.inviteInfo.company_name);
    },

    validateEmail : function(force) {
        if (force || !this.register.email.valid) {
            this.register.email.valid = Validator.email(this.register.email.value);
        }

        this.errors.exists = false;
        return this.register.email.valid;
    },

    validatePassword : function(force) {
        if (force || !this.register.password.valid) {
            this.register.password.valid = Validator.password(this.register.password.value);
        }

        return this.register.password.valid;
    },
    /**
     * Validate verification password
     * Make sure it matches the chosen password.
     */
    verifyPassword : function(force) {
        if (force || !this.register.password2.valid) {
            this.register.password2.valid = this.register.password.value == this.register.password2.value;
        }

        return this.register.password2.valid;
    },

    /**
     * Verify partner connection agreement.
     */
    verifyConnect : function() {
        //Don't do anything if there is no partner
        if (!this.partner) {
            return true;
        }

        if (this.partner.connectRequired && this.register.connect.value) {
            this.register.connect.valid = true;
        } else if (!this.partner.connectRequired) {
            this.register.connect.valid = true;
        } else {
            this.register.connect.valid = false;
        }

        return this.register.connect.valid;
    },

    /**
     * Get link for the terms of service
     */
    getTosLink : function(string) {
        string = string.replace('[tos-link]', '<a class="underlined" href="' + this.ui.dictionary.meta.tosUrl + '" target="_blank" style="color: ' + this.getColor() + '">');
        string = string.replace('[/tos-link]', '</a>');
        string = string.replace('[privacy-link]', '<a class="underlined" href="' + this.ui.dictionary.meta.privacyUrl + '" target="_blank" style="color: ' + this.getColor() + '">');
        string = string.replace('[/privacy-link]', '</a>');
        return string;
    },

    /**
     * Register the user
     */
    registerUser : function(email, password, connect) {
        if (!this.isInviteWidgets) {
            if (!this.company.name.value) {
                this.invalidCompanyName = true;
                return false
            }
            if (!this.company.vat.value) {
                this.invalidCompanyVat = true;
                return false
            }
            if (this.errors.exists || !this.validateEmail(true) || !this.validatePassword(true) || !this.verifyPassword(true) || !this.verifyConnect()) {
                return false;
            }
        } else {
            if ( this.errors.exists || !this.validateEmail(true) || !this.validatePassword(true) || !this.verifyPassword(true) || !this.verifyConnect()) {
                return false;
            }
        }

        Track.fb.track('Lead');

        var scope = this;
        var settings = {};
        var source = {};

        scope.ui.working = true;
        scope.errors.exists = false;
        scope.errors.network = false;
        scope.errors.unexpected = false;

        //Set up partner settings
        if (this.partner) {
            settings.partner = this.partner;
            settings.partner.autoConnect = connect.value;

        }

        //Set up source settings
        if (this.partner) {
            source.type = 'partner';
            source.id = this.partner.id;
        } else {
            source.type = 'direct';
        }


        /**
         * Set up invite connect
         */
        if (this.hasInviteToken && this.inviteInfo && this.register.connect.value) {
            InviteTokenModel.setConnect(true);
        }


        UserModel.fromRegister(email, password, DictionaryModel.getLanguage(), settings, source)
            .then(function(registration) {
                //Successful registration
                if (registration.success) {
                    Track.ga.sendEvent('User', 'Sign up')

                    //Attempt login
                    UserModel.fromLogin(email, password)
                        .then(function(response) {
                            if (response.success) {
                                if (scope.fromLanding) {
                                    response.contents.settings.fromLandingPage = true;
                                    response.contents.settings.landingPartner = scope.landingPartner;
                                }
                                if (!scope.isInviteWidgets) {
                                    scope.createCompany(scope.company.name.value, scope.company.vat.value);

                                    legal.load(scope.legalMonsterCurrentKeyId, {
                                        identifier: response.contents?.id,
                                    });

                                    UserModel.construct(response.contents);
                                    setTimeout(function () {
                                        UserModel.save();
                                        setTimeout(() => {
                                            if(CompanyModel.getCompany()) {
                                                if (InviteTokenModel.getInfo() && InviteTokenModel.isCompanyUser()) {
                                                    scope.$router.push('/setup-user?type=register');
                                                } else {
                                                    scope.$router.push('/setup');
                                                }
                                            }
                                        }, 0)

                                    }, 2000);

                                    XSRFModel.set(response.contents['xsrf-token']);
                                } else {
                                    const userDetail = response.contents;
                                    UserModel.construct(userDetail);
                                    legal.load(scope.legalMonsterCurrentKeyId, {
                                        identifier: userDetail?.id,
                                    });
                                    scope.updateInfoWidgetInvitationFlow(userDetail?.id, userDetail?.email);
                                    setTimeout(function () {
                                        UserModel.save();
                                    }, 2000);
                                    XSRFModel.set(userDetail['xsrf-token']);

                                    if (InviteTokenModel.getInfo() && InviteTokenModel.isCompanyUser()) {
                                        scope.$router.push('/setup-user?type=register');
                                    } else {
                                        scope.$router.push('/setup');
                                    }
                                }

                            } else {
                                scope.errors.unexpected = true;
                            }
                        });


                    //Failed registration
                } else {
                    scope.errors.exists = true;
                    scope.ui.working = false;
                }


            }, function(error) {
                scope.errors.network = true;
                Logger.log(error);
                scope.ui.working = false;
            });
    },

    /**
     * Create context-sensitive link
     */
    makeLink : function(url) {
        if (this.partner) {
            return '/' + this.partner.code + url;
        }

        return url;
    },

    makeAgreement : function(string) {
        if (this.partner && this.partner.name) {
            return string.replace(':partner', this.partner.name);
        }
    },

    getCountries : function() {
        CountryCollection.fetchCountries()
            .then(function(res) {
                if (res && res._embedded && res._embedded.items && res._embedded.items.length > 0) {
                    this.countries = res._embedded.items;
                }
            }.bind(this));
    },

    sortCountries : function (countries) {
        var list = countries.slice();

        return list.sort(function(a, b) {
            return a.reference>b.reference? 1 : (a.reference<b.reference ? -1 : 0);
        });
    },

    selectIndustry : function(code) {
        this.ui.showICI = false;
        this.ui.codeError = false;
        this.company.code = code;
    },

    validateName : function(force) {
        this.invalidCompanyName = false;
        if (force || !this.profile.name.valid) {
            this.profile.name.valid = Validator.name(this.profile.name.value, 2);
        }

        return this.profile.name.valid;
    },

    validateVat : function(force) {
        this.invalidCompanyVat = false;
        if (force || !this.company.vat.valid) {
            if (this.company.country.reference === 'denmark') {
                this.company.vat.valid = Validator.vat(this.company.vat.value);
            } else if (this.company.country.reference === 'germany') {
                this.company.vat.valid = true;
            } else if (this.company.country.reference === 'sweden') {
                this.company.vat.valid =  Validator.swedenVat(this.company.vat.value);
            } else if (this.company.country.reference === 'norway') {
                this.company.vat.valid =  Validator.norwegianVat(this.company.vat.value);
            } else if (this.company.country.reference === 'other') {
                this.company.vat.valid = Validator.otherVat(this.company.vat.value);
            }
        }

        this.errors.exists = false;
        return this.company.vat.valid;
    },

    createCompany(name, vat) {
        if ( !this.validateName(true) ||
            (!this.validateVat(true) && (this.company.country.reference === 'denmark' || this.company.country.reference === 'other') ) ||
            (!this.validateVat(true) && this.company.country.reference === 'germany' && vat.length > 0)
        ) {
            return false;
        }

        if (this.company.country.reference === 'germany' && !this.company.code) {
            this.ui.codeError = true;
            return false;
        }

        Track.fb.track('CompleteRegistration');

        this.ui.working = true;
        var cc = new CompanyCollection({ query : vat });
        cc.getCompanies()
            .then(function (res) {
                if (!res.contents || res.contents.length === 0 || this.user.test) {
                    this.requestCompanyCreation(name, vat);
                } else {
                    this.existingCompanies = res.contents;
                    this.$modal.show(askToConnect, {company: this.company, existingCompanies: this.existingCompanies, requestCompanyCreation: this.requestCompanyCreation, connectToCompany: this.connectToCompany }, {height: 'auto'});
                    this.ui.working = false;
                }
            }.bind(this));
    },

    requestCompanyCreation : function (name, vat) {
        this.company.name.valid = true;
        this.company.vat.valid = true;

        var scope = this;
        var settings = UserModel.profile().settings;
        var source = {};
        var industryCode = null;
        scope.ui.working = true;
        scope.errors.exists = false;
        scope.errors.existsName = false;
        scope.ui.codeError = false;


        if (this.partner) {
            source.type = 'partner';
            source.id = this.partner.id;
        } else {
            source.type = 'direct';
        }


        if (this.company.code && this.company.code.id) {
            industryCode = this.company.code.id;
        }

        CompanyModel.createCompany(name, vat, industryCode, this.company.country.reference, source)
            .then(function(response) {
                if (response.id) {
                    CompanyModel.setCompany(response, scope.$store);

                    if (scope.company.dpa) {
                        CompanyModel.agreeToDpa();
                    }

                    EventBus.$emit('newCompanyCreated');

                    /**
                     * Get company user information
                     */
                    UserModel.fetchCompanyUserInfo()
                        .then(function(userInfo) {
                            UserModel.setCompanyUserInfo(userInfo);
                        });

                    /**
                     * Process invitation information
                     * or use partner to connect
                     */
                    if (InviteTokenModel.getInfo() && InviteTokenModel.getToken()) {
                        InviteTokenModel.setConnect(true);
                        InviteTokenModel.process()
                            .then(function(res) {
                                if (res.errors) {
                                    Toast.show(scope.ui.dictionary.invitations.alreadyConnected , 'warning');
                                }

                                InviteTokenModel.forget();
                            });
                    } else if (settings && settings.partner) {
                        scope.connectPartner(settings);
                    }

                    if (!EconomicSelf.getToken()) {
                        scope.ui.working = false;
                    }
                } else {
                    scope.ui.working = false;
                }
            });
    },

    connectPartner : function(settings) {
        //Add partner connection
        if (settings.partner.autoConnect) {
            var partnerConnection = new SharedConnectionModel();
            partnerConnection.request(settings.partner.id);
        }

        //Add support connection
        if (settings.partner.support) {
            const supportId = Config.get('supportConnection');
            var supportConnection = new SharedConnectionModel();
            supportConnection.request(supportId);
        }

        settings.partner.autoConnect = false;
        settings.partner.support = false;

        var profile = UserModel.profile();
        profile.settings = settings;

        UserModel.construct(profile);
        UserModel.save();
    },

    // remove this one:
    autoConnectEconomic : function(token) {
        ErpModel.createConnection('e-conomic', token)
            .then(function(response) {
                if (response.status) {
                    ErpModel.setErp(response);

                    Toast.show(this.ui.dictionary.erp.saved);

                    /**
                     * Pageview for GA conversions
                     */
                    Track.ga.setPage();
                    Track.ga.sendPageView();

                    this.$router.push('/account/updating');

                    EconomicSelf.forgetAll();
                } else {
                    ErpModel.forgetErp();
                    this.$router.push('/account/company/erp');
                    Toast.show(this.ui.dictionary.erp.notsaved, 'warning');

                }
            }.bind(this));
    },

    selectCountry(country) {
        this.company.country = country;
        this.ui.countryOptions = false;

        switch (country.code) {
            case 'DK':
                this.loadNormalRegisterWidget('DK');
                break;

            case 'NO':
                this.loadNormalRegisterWidget('NO');
                break;

            case 'SE':
                this.loadNormalRegisterWidget('SE');
                break;

            default:
                this.loadNormalRegisterWidget();
        }
    },

    loadNormalRegisterWidget(code) {
        this.isNorwayWidget = false;
        this.isSwedishWidget = false;
        this.isDefaultWidget = false;
        this.isOtherWidget = false;

        this.isInviteDenmWidget = false;
        this.isInviteNorwWidget = false;
        this.isInviteSwedWidget = false;
        this.isInviteOtherWidget = false;

        this.isDkTestInviteWidget = false;
        this.isSwedTestInviteWidget = false;
        this.isNorwTestInviteWidget = false;
        this.isOtherTestInviteWidget = false;

        this.isDkTestNormalWidget = false;
        this.isSwedTestNormalWidget = false;
        this.isNorwTestNormalWidget = false;
        this.isOtherTestNormalWidget = false;

        this.widgetLocale = this.relevantLanguage || 'da-dk';
        if (this.env === "test" || this.env === "staging") {
            if (code === "DK") {
                this.isDkTestNormalWidget = true;
                this.legalMonsterCurrentKeyId = Config.get('legalMonster').denmark.normRegister;
            } else if (code === "NO") {
                this.isNorwTestNormalWidget = true;
                this.legalMonsterCurrentKeyId = Config.get('legalMonster').norway.normRegister;
            } else if (code === "SE") {
                this.isSwedTestNormalWidget = true;
                this.legalMonsterCurrentKeyId = Config.get('legalMonster').sweden.normRegister;
            } else {
                this.isOtherTestNormalWidget = true;
                this.legalMonsterCurrentKeyId = Config.get('legalMonster').other.normRegister;
            }
        } else if (this.env === "production") {
            if (code === "DK") {
                this.isDefaultWidget = true;
                this.legalMonsterCurrentKeyId = Config.get('legalMonster').denmark.normRegister;
            } else if (code === "NO") {
                this.isNorwayWidget = true;
                this.legalMonsterCurrentKeyId = Config.get('legalMonster').norway.normRegister;
            } else if (code === "SE") {
                this.isSwedishWidget = true;
                this.legalMonsterCurrentKeyId = Config.get('legalMonster').sweden.normRegister;
            } else {
                this.isOtherWidget = true;
                this.legalMonsterCurrentKeyId = Config.get('legalMonster').other.normRegister;
            }

        }

        legal.widget({
            type: "signup",
            widgetPublicKey: this.legalMonsterCurrentKeyId,
            targetElementSelector: `#legalmonster-signup-${this.legalMonsterCurrentKeyId}`,
            markRequiredFields: true,
            emailInputSelector: '[id="email_input"]',
            locale: this.widgetLocale
        });

        this.$store.dispatch('setWidgetPublicKey', this.legalMonsterCurrentKeyId);
    },

    loadWidgetInvitationFlow(code) {
        this.isNorwayWidget = false;
        this.isSwedishWidget = false;
        this.isDefaultWidget = false;
        this.isOtherWidget = false;

        this.isInviteDenmWidget = false;
        this.isInviteNorwWidget = false;
        this.isInviteSwedWidget = false;
        this.isInviteOtherWidget = false;

        this.isDkTestInviteWidget = false;
        this.isSwedTestInviteWidget = false;
        this.isNorwTestInviteWidget = false;
        this.isOtherTestInviteWidget = false;

        this.isDkTestNormalWidget = false;
        this.isSwedTestNormalWidget = false;
        this.isNorwTestNormalWidget = false;
        this.isOtherTestNormalWidget = false;

        this.widgetLocale = this.relevantLanguage || 'da-dk';

        if (this.env === "test" || this.env === "staging") {
            if (code === "DK" || !code) {
                this.isDkTestInviteWidget = true;
                this.legalMonsterCurrentKeyId = Config.get('legalMonster').denmark.inviteRegister;
            } else if (code === "NO") {
                this.isNorwTestInviteWidget = true;
                this.legalMonsterCurrentKeyId = Config.get('legalMonster').norway.inviteRegister;
            } else if (code === "SE") {
                this.isSwedTestInviteWidget = true;
                this.legalMonsterCurrentKeyId = Config.get('legalMonster').sweden.inviteRegister;
            } else {
                this.isOtherTestInviteWidget = true;
                this.legalMonsterCurrentKeyId = Config.get('legalMonster').other.inviteRegister;
            }
        } else if (this.env === "production") {
            if (code === "DK" || !code) {
                this.isInviteDenmWidget = true;
                this.legalMonsterCurrentKeyId = Config.get('legalMonster').denmark.inviteRegister;
            } else if (code === "NO") {
                this.isInviteNorwWidget = true;
                this.legalMonsterCurrentKeyId = Config.get('legalMonster').norway.inviteRegister;
            } else if (code === "SE") {
                this.isInviteSwedWidget = true;
                this.legalMonsterCurrentKeyId = Config.get('legalMonster').sweden.inviteRegister;
            } else {
                this.isInviteOtherWidget = true;
                this.legalMonsterCurrentKeyId = Config.get('legalMonster').other.inviteRegister;
            }
        }

        legal.widget({
            type: "signup",
            widgetPublicKey: this.legalMonsterCurrentKeyId,
            targetElementSelector: `#legalmonster-signup-${this.legalMonsterCurrentKeyId}`,
            markRequiredFields: true,
            emailInputSelector: '[id="email_input"]',
            locale: this.widgetLocale
        });

        this.$store.dispatch('setWidgetPublicKey', this.legalMonsterCurrentKeyId);
    },

    updateInfoWidgetInvitationFlow(id, email) {
        legal.widget({
            type: "signup",
            widgetPublicKey: this.legalMonsterCurrentKeyId,
            identifier: id
        });
        legal.user({
            email
        });

        this.$store.dispatch('setWidgetPublicKey', this.legalMonsterCurrentKeyId);
        }
    };

    !function(){var i,e,t,s=window.legal=window.legal||[];if(s.SNIPPET_VERSION="3.0.0",i="https://widgets.legalmonster.com/v1/legal.js",!s.__VERSION__)if(s.invoked)window.console&&console.info&&console.info("legal.js: The initialisation snippet is included more than once on this page, and does not need to be.");else{for(s.invoked=!0,s.methods=["cookieConsent","document","ensureConsent","handleWidget","signup","user"],s.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);return e.unshift(t),s.push(e),s}},e=0;e<s.methods.length;e++)t=s.methods[e],s[t]=s.factory(t);s.load=function(e,t){var n,o=document.createElement("script");o.setAttribute("data-legalmonster","sven"),o.type="text/javascript",o.async=!0,o.src=i,(n=document.getElementsByTagName("script")[0]).parentNode.insertBefore(o,n),s.__project=e,s.__loadOptions=t||{}},s.widget=function(e){s.__project||s.load(e.widgetPublicKey),s.handleWidget(e)}}}();

    const computed = {
        isInviteWidgets() {
            return this.isDkTestInviteWidget || this.isSwedTestInviteWidget || this.isNorwTestInviteWidget || this.isOtherTestInviteWidget || this.isInviteDenmWidget || this.isInviteNorwWidget || this.isInviteSwedWidget || this.isInviteOtherWidget;
        },

        relevantLanguage() {
            let locale = (this.ui.dictionary?.meta?.code).toLowerCase();
            if (locale !== 'sv-se') {
                return locale;
            } else {
                return 'se';
            }
        },

        companyFromInvitationLink() {
            return this.$store.getters.isInvitationLinkCompany;
        }
    }

    const watch = {
        relevantLanguage(val, oldVal) {
            if (oldVal && val !== oldVal) {
                if (!this.companyFromInvitationLink) {
                    this.loadNormalRegisterWidget(this.company?.country?.code);
                } else {
                    this.loadWidgetInvitationFlow(this.company?.country?.code);
                }
            }
        }
    }

    export default Vue.extend({
        template,
        watch,
        data,
        methods,
        computed,
        components : {
            'language-picker' : languagePicker,
            'industry-selector' : industrySelector
        },
        mixins: [logoWidthMixin],
        created : function() {
            this.init();
        }
    });
