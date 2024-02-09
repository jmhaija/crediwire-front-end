import Vue from 'Vue'
import DictionaryModel from 'models/DictionaryModel'
import CompanyModel from 'models/CompanyModel'
import UserModel from 'models/UserModel'
import SharedConnectionModel from 'models/SharedConnectionModel'
import InviteTokenModel from 'models/InviteTokenModel'
import ErpModel from 'models/ErpModel'
import CompanyUserModel from 'models/CompanyUserModel'
import PartnerModel from 'models/PartnerModel'
import CountryCollection from 'collections/CountryCollection'
import CompanyCollection from 'collections/CompanyCollection'
import industrySelector from 'elements/industry-selector'
import Validator from 'services/Validator'
import EventBus from 'services/EventBus'
import Toast from 'services/Toast'
import EconomicSelf from 'services/EconomicSelf'
import askToConnect from 'elements/modals/ask-to-connect'
import Config from 'services/Config'
import Track from 'services/Track'
import CountriesDropdown from 'elements/dropdown/countries-dropdown'

const template = `
        <article>
           <header class="section-heading">{{ui.dictionary.company.create}}</header>
           <section class="form" v-show="!ui.showICI">
               <form v-on:submit.prevent="createCompany(company.name.value, company.vat.value)">
                   <div class="input-field">
                       <input
                            data-test-id="setupCompanyNameInput"
                            class="white"
                            :placeholder="ui.dictionary.company.name"
                            type="text"
                            v-model="company.name.value"
                            v-bind:class="{ invalid : !company.name.valid }"
                            v-on:keyup="validateName()"
                            v-on:blur="validateName(true)"
                        >
                       <label v-bind:class="{ filled: company.name.value.length > 0 }">{{ui.dictionary.company.name}}</label>
                       <div class="warning" v-bind:class="{ show : !company.name.valid }">{{ui.dictionary.general.validation.generic}}</div>
                       <div class="warning" v-bind:class="{ show : errors.existsName && company.name.valid }">{{ui.dictionary.company.existsName}}</div>
                   </div>
                   <div class="input-field">
                       <input
                            data-test-id="setupCompanyVatInput"
                            class="white"
                            :placeholder="ui.dictionary.company.vat"
                            type="text"
                            v-model="company.vat.value"
                            v-bind:class="{ invalid : !company.vat.valid }"
                            v-on:keyup="validateVat(true)"
                            v-on:blur="validateVat(true)"
                        >
                       <label v-bind:class="{ filled: company.vat.value.length > 0 }">{{ui.dictionary.company.vat}} <span v-show="ui.dictionary.meta.code === 'de-DE'">({{ui.dictionary.company.vatAdditional}})</span></label>
                       <div
                            data-test-id="setupCompanyVatValidationWarning"
                            class="warning"
                            v-bind:class="{ show : !company.vat.valid }"
                        >{{ui.dictionary.general.validation.vat}}</div>
                       <div class="warning" v-bind:class="{ show : errors.exists && company.vat.valid }">{{ui.dictionary.company.exists}}</div>
                   </div>
                   
                   <countries-dropdown class="full-width" @countryChanged="countryChanged" :defaultCountryReference="company.country.reference"></countries-dropdown>
                   
                   <div v-show="company.country.reference === 'germany'" class="industry-code industry-code-input">
                       <label :class="{ invalid : ui.codeError }">{{ui.dictionary.industry.title}}</label>
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

                   <section class="toolbar">
                       <div class="working" v-show="ui.working"></div><button
                            data-test-id="createCompanyButton"
                            type="submit"
                            v-show="!ui.working"
                            class="accent"
                        >
                            {{ui.dictionary.company.createAction}}
                        </button>
                   </section>
               </form>
           </section>
           <section class="form" v-show="ui.showICI">
               <div class="clickable" v-on:click="ui.showICI = false">&larr; {{ui.dictionary.industry.back}}</div>
               <industry-selector :callback="selectIndustry"></industry-selector>
           </section>
        </article>
 `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            working : false,
            codeError : false,
            showICI : false,
            countryOptions : false
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
            existsName : false
        },
        presetData : EconomicSelf.getInfo(),
        presetToken : EconomicSelf.getToken(),
        companies : [],
        existingCompanies : [],
        user : UserModel.profile(),
        partner : PartnerModel.getPartner()
    });

    const methods = {

        init() {
            let inviteInfo = InviteTokenModel.getInfo();

            if (inviteInfo && inviteInfo.vat) {
                this.company.vat.value = inviteInfo.vat;
            }

            if (this.presetData && this.presetData.company && this.presetData.company.name) {
                this.company.name.value = this.presetData.company.name;
            }

            if (this.presetData && this.presetData.company && this.presetData.company.company_identification_number) {
                this.company.vat.value = this.presetData.company.company_identification_number;
            }

            this.getCompanies();
        },

        connectToCompany(company) {
            var cu = new CompanyUserModel();
            cu.requestToBecomeUser(company.id)
                .then(function (res) {
                    if (res.id) {
                        Toast.show(this.ui.dictionary.company.userInvitation.requestSent);
                    }
                    this.$modal.hide(askToConnect);
                }.bind(this));
        },

        countryChanged(selectedCountry) {
            this.company.country = selectedCountry;
        },

        getCompanies() {
            var cc = new CompanyCollection({ type : '_all' });

            cc.getCompanies()
                .then(function (res) {
                    if (res.contents) {
                        this.companies = res.contents;
                    }
                }.bind(this));
        },

        needsIndustryCode(input) {
            let vatPattern = /^([A-Za-z]{2})?[0-9]{13}$/;
            return vatPattern.test(input);
        },


        validateName(force) {
            if (force || !this.company.name.valid) {
                this.company.name.valid = Validator.minLength(this.company.name.value, 2);
            }

            this.errors.existsName = false;
            return this.company.name.valid;
        },

        validateVat(force) {
            if (force || !this.company.vat.valid) {
                if (this.company.country.reference === 'denmark') {
                    this.company.vat.valid = Validator.vat(this.company.vat.value);
                } else if (this.company.country.reference === 'germany') {
                    this.company.vat.valid = true;
                } else if (this.company.country.reference === 'norway') {
                    this.company.vat.valid = Validator.norwegianVat(this.company.vat.value);
                } else if (this.company.country.reference === 'sweden') {
                    this.company.vat.valid = Validator.swedenVat(this.company.vat.value);
                } else if (this.company.country.reference === 'other') {
                    this.company.vat.valid = Validator.otherVat(this.company.vat.value);
                }
            }

            this.errors.exists = false;
            return this.company.vat.valid;
        },


        companyNameExists(name) {
            var found = false;

            this.companies.forEach(function (company) {
                if (company.name === name) {
                    found = true;
                }
            });

            return found;
        },

        companyVatExists(vat) {
            var found = false;

            this.companies.forEach(function (company) {
                if (company.vat === vat) {
                    found = true;
                }
            });

            return found;
        },


        /**
         * Actual HTTP request to create resource
         */
        requestCompanyCreation(name, vat) {
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
                .then((response) =>  {
                    if (response.id) {
                        CompanyModel.setCompany(response, this.$store);

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


                        if (scope.callback) {
                            scope.callback(response);
                        } else if (!EconomicSelf.getToken()) {
                            scope.ui.working = false;
                        }

                        if (scope.presetToken) {
                            scope.autoConnectEconomic(scope.presetToken);
                        } else {
                            scope.$router.push('/account/company/settings');
                        }
                    } else {
                        //scope.errors.exists = true;
                        scope.ui.working = false;
                    }
                });
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


            if (this.companyNameExists(name) && !this.user.test) {
                this.errors.existsName = true;
                return false;
            }

            if (this.companyVatExists(vat) && !this.user.test) {
                this.errors.exists = true;
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

        /**
         * Create a connection to parter and/or support team.
         */
        connectPartner(settings) {
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

        selectIndustry(code) {
            this.ui.showICI = false;
            this.ui.codeError = false;
            this.company.code = code;
        },

        autoConnectEconomic(token) {
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
        }
    };

    const computed = {
        countries() {
            return this.$store.getters.countries;
        }
    };

    const watch = {
        countries(countries = []) {
            if (this.ui.dictionary.meta.code === 'de-DE') {
                this.company.country = countries.find(country => country.reference === 'germany') || this.company.country;
            }
        },
        'company.country': function (val, oldVal) {
            if (oldVal.reference !== val.reference) {
                this.validateVat(true)
            }
        }
    };

    export default Vue.extend({
        template,
        data,
        methods,
        props : {
            callback:{}
        },
        computed,
        watch,
        components : {
            'industry-selector' : industrySelector,
            'countries-dropdown' : CountriesDropdown
        },
        created() {
            this.init();
        }
    });
