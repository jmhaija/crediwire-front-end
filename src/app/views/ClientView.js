    import Vue from 'Vue'
    import Raven from 'Raven'
    import DictionaryModel from 'models/DictionaryModel'
    import AssetModel from 'models/AssetModel'
    import UserModel from 'models/UserModel'
    import XSRFModel from 'models/XSRFModel'
    import CompanyModel from 'models/CompanyModel'
    import ErpModel from 'models/ErpModel'
    import SharedConnectionModel from 'models/SharedConnectionModel'
    import CompanyCollection from 'collections/CompanyCollection'
    import ClientService from 'services/ClientService'
    import Validator from 'services/Validator'
    import CompanyErpView from 'views/CompanyErpView'
    import UpdatingView from 'views/UpdatingView'
    import CreateCompanyView from 'views/CreateCompanyView'
    import modal from 'elements/modals/modal'

    const template = `
        <article>
           <section v-show="ui.loading">
               <div class="app-loader"></div>
           </section>

           <section v-show="!ui.loading">
               <div v-show="ui.error" class="lone-component">
                   <div v-show="ui.errors.params">{{ui.dictionary.client.errors.params}}</div>
                   <div v-show="ui.errors.invalid">{{ui.dictionary.client.errors.invalid}}</div>
                   <div v-show="ui.errors.company">{{ui.dictionary.client.errors.company}}</div>
               </div>

               <div v-show="!ui.error" class="lone-component">
                   <div class="partner-logo">
                       <img :src="getLogo()">
                   </div>


                   <div v-if="ui.login" class="form">
                       <p class="center-text">{{ui.dictionary.client.welcome}}</p>
                       <p>{{client.object.description}}</p>
                       <section class="message-bar">
                           <div class="normal" v-show="!ui.errors.login">{{ui.dictionary.client.login}}</div>
                           <div class="warning" v-show="ui.errors.login">{{ui.dictionary.login.failed}}</div>
                       </section>
                       <form v-on:submit.prevent="loginUser(profile.email, profile.password)">
                           <div class="input-field">
                               <input type="text" v-model="profile.email">
                               <label v-bind:class="{ filled: profile.email.length > 0 }">{{ui.dictionary.general.labels.email}}</label>
                           </div>
                           <div class="input-field">
                               <input type="password" v-model="profile.password">
                               <label v-bind:class="{ filled: profile.password.length > 0 }">{{ui.dictionary.general.labels.password}}</label>
                           </div>
                           <section class="toolbar">
                               <div class="float-right"><button type="submit" class="primary">{{ui.dictionary.login.action}}</button></div>
                           </section>
                       </form>
                   </div>


                   <div v-if="ui.terms">
                       <section class="message-bar">
                           <div class="normal">{{ui.dictionary.client.terms}}</div>
                       </section>
                       <iframe :src="getTermsUrl()" class="tos"></iframe>
                       <section class="form">
                           <form v-on:submit.prevent="agreeToTos()">
                               <div class="checkbox-field message-bar">
                                   <label><input type="checkbox" v-model="profile.tos"> <i></i> <span v-html="getTosLink(ui.dictionary.register.tos)"></span></label>
                              </div>
                               <section class="toolbar">
                                   <div><button type="submit" class="primary">{{ui.dictionary.tos.action}}</button></div>
                               </section>
                           </form>
                       </section>
                   </div>


                   <div v-if="ui.register" class="form">

                       <p class="center-text">{{ui.dictionary.client.welcome}}</p>
                       <p>{{client.object.description}}</p>
                       <form v-on:submit.prevent="registerUser()">

                           <div class="input-field">
                               <div class="step" v-bind:class="{ done: profile.password.length > 0 && validation.password }"><span>1</span></div><div class="unstep">
                                   <input type="password" v-model="profile.password" v-bind:class="{ invalid : !validation.password, valid : validation.password && profile.password.length > 0 }" v-on:keyup="validatePassword()" v-on:blur="validatePassword(true)">
                                   <label v-bind:class="{ filled: profile.password.length > 0 }">{{ui.dictionary.register.password}}</label>
                                   <div class="warning" v-bind:class="{ show : !validation.password }">{{ui.dictionary.general.validation.passwordEntropy}}</div>
                               </div>
                           </div>

                           <div class="input-field">
                               <div class="step" v-bind:class="{ done: profile.password2.length > 0 && validation.password2 }"><span>2</span></div><div class="unstep">
                                   <input type="password" v-model="profile.password2" v-bind:class="{ invalid : !validation.password2, valid : validation.password2 && profile.password2.length > 0 }" v-on:keyup="verifyPassword()" v-on:blur="verifyPassword(true)">
                                   <label v-bind:class="{ filled: profile.password2.length > 0 }">{{ui.dictionary.register.password2}}</label>
                                   <div class="warning" v-bind:class="{ show : !validation.password2 }">{{ui.dictionary.register.passwordMatch}}</div>
                               </div>
                           </div>

                           <div class="checkbox-field message-bar">
                               <div class="step" v-bind:class="{ done: profile.tos }"><span>3</span></div><div class="unstep">
                                   <label><input type="checkbox" v-model="profile.tos" v-on:change="verifyTos()"> <i></i> <span v-html="getTosLink(ui.dictionary.register.tos)"></span></label>
                                   <div class="warning small-text" v-show="!validation.tos">{{ui.dictionary.register.agree}}</div>
                               </div>
                           </div>

                           <div class="checkbox-field message-bar">
                               <div class="step" v-bind:class="{ done: company.connect }"><span>4</span></div><div class="unstep">
                                   <label><input type="checkbox" v-model="company.connect" v-on:change="verifyConnect()"> <i></i> {{getPartnerName(ui.dictionary.client.connect)}}</label>
                                   <div class="warning small-text" v-show="!validation.connect">{{ui.dictionary.client.agree}}</div>
                               </div>
                           </div>

                           <section class="toolbar">
                               <div class="float-right"><button type="submit" class="primary">{{ui.dictionary.register.action}}</button></div>
                           </section>
                       </form>
                   </div>


                   <div v-if="ui.selectCompany">
                       <section class="message-bar">
                           <div class="normal">{{ui.dictionary.client.selectCompany}}</div>
                       </section>
                       <section>
                           <form v-on:submit.prevent="assignCompany(selectedCompany)">
                               <div class="company-container">
                                   <div class="company-card" v-for="comp in companies" v-on:click="selectedCompany = comp" :class="{ selected : selectedCompany == comp }">
                                       <div class="select-check" v-show="selectedCompany == comp"><i class="cwi-approve"></i></div>
                                       <div class="icon">
                                          <div class="letter">{{getFirstChar(comp)}}</div>
                                       </div><div class="info">
                                           <div class="primary">{{comp.name}}</div>
                                           <div class="secondary">{{comp.vat}}</div>
                                       </div>
                                   </div>
                               </div>
                               <div class="toolbar full-width" v-show="selectedCompany">
                                  <button type="submit" class="primary">{{ui.dictionary.client.makeSelection}}</button>
                               </div>
                               <div class="toolbar full-width center-text">
                                   <p>{{ui.dictionary.general.or}}</p>
                                   <p><a v-on:click="ui.selectCompany = false; ui.newCompanyForm = true;">{{ui.dictionary.company.create}}</a></p>
                               </div>
                           </form>
                       </section>
                   </div>


                   <div v-if="ui.newCompanyForm">
                       <create-company-view :callback="assignCompany"></create-company-view>
                       <section class="message-bar full-width center-text">
                           <p>{{ui.dictionary.general.or}}</p>
                           <p><a v-on:click="ui.selectCompany = true; ui.newCompanyForm = false;">{{ui.dictionary.client.backToSelect}}</a></p>
                       </section>
                   </div>


                   <div v-if="ui.erp">
                       <section class="message-bar">
                           <div class="normal">{{ui.dictionary.client.erp}}</div>
                       </section>
                       <erp-view :forceSave="true" :setup="true"></erp-view>
                       <section class="message-bar">
                           <a v-on:click.prevent="showSkipConfirmationDialog()">{{ui.dictionary.client.skipErp}}</a>
                       </section>
                   </div>


                   <div v-if="ui.finish">
                       <section class="message-bar">
                           <div class="normal">{{getPartnerName(ui.dictionary.client.finish)}}</div>
                           <div v-show="client.redirectUrl">{{ui.dictionary.client.finishRedirect}}</div>
                           <div v-show="!client.redirectUrl"><a href="/account/overview">{{ui.dictionary.client.finishExplore}}</a></div>
                       </section>
                   </div>

               </div>


               <div v-if="ui.mapping" class="lone-component large">
                   <updating-view></updating-view>
               </div>

           </section>
        </article>
    `;

    const data = () => ({
        ui: {
            dictionary: DictionaryModel.getHash(),
            loading: true,
            error: false,
            errors: {
                params: false,
                invalid: false,
                login: false,
                password: false,
                register: false,
                company: false
            },
            showDescription: true,
            register: false,
            login: false,
            terms: false,
            selectCompany: false,
            erp: false,
            mapping: false,
            finish: false
        },
        client: {
            id: null,
            token : null,
            redirectUrl: null,
            object: null
        },
        profile: {
            name: '',
            email: '',
            phone: '',
            password: '',
            password2: '',
            tos: false,
            object: null
        },
        company: {
            name: null,
            vat: null,
            connect: false
        },
        companies: [],
        selectedCompany: null,
        validation: {
            password: true,
            password2: true,
            tos: true,
            connect: true
        },
        currentCompanyToAdd : null,
        confirmedConnect : false
    });

    const methods = {

        init() {
            var scope = this;
            /**
             * Measure abandons
             */
            window.onunload = function() {
                if (!UserModel.authenticated()) {
                }
            };

            if (this.$route.query.step && this.$route.query.step == 'finish') {
                this.client = JSON.parse(localStorage.getItem('client'));
                //localStorage.removeItem('client');
                this.ui.finish = true;
                this.ui.showDescription = false;
                this.ui.loading = false;
                this.redirect();
                return false;
            } else if (this.$route.query.step && this.$route.query.step == 'mapping') {
                this.client = JSON.parse(localStorage.getItem('client'));
                var company = JSON.parse(localStorage.getItem('company'));
                localStorage.removeItem('client');

                CompanyModel.setCompany(company, this.$store);

                ErpModel.fromCompany()
                    .then(function (res) {
                        ErpModel.setErp(res);
                        scope.ui.showDescription = false;
                        scope.ui.mapping = true;
                        scope.ui.loading = false;
                    });
                return false;
            }

            //Validate query params
            if (!this.validateParams()) {
                this.ui.loading = false;
                this.ui.error = true;
                this.ui.errors.params = true;
                return false;
            }


            if (this.client.token) {
                this.validateToken();
            } else {
                this.validateByID();
            }

        },


        getFirstChar(company) {
            if (company.name) {
                return company.name.toUpperCase().charAt(0);
            } else if (company.vat) {
                return company.vat.charAt(0);
            } else {
                return '?';
            }
        },


        validateToken() {
            var scope = this;

            //Validate ID and token
            ClientService.validateToken(this.client.id, this.client.token)
                .then(function(res) {
                    if (!res.errors) {
                        scope.profile.name = res.name;
                        scope.profile.email = res.email;
                        scope.profile.phone = res.phone;
                        scope.company.name = res.companyName;
                        scope.company.vat = res.vat;

                        scope.validateByID();
                    } else {
                        Raven.captureMessage('Failed to validate/parse data token : ' + window.location.href);
                        scope.ui.loading = false;
                        scope.ui.error = true;
                        scope.ui.errors.invalid = true;
                    }
                });
        },

        validateByID() {
            var scope = this;

            //Validate the app itself
            ClientService.byID(this.client.id)
                .then(function (res) {
                    var check = false;

                    //if (res.id && this.client.redirectUrl) {
                    if (res.id && scope.client.redirectUrl) {

                        for (var i = 0; i < res.whiteList.length; i++) {

                            if (scope.client.redirectUrl.substr(0, res.whiteList[i].length) === res.whiteList[i]) {

                                check = true;
                                break;
                            }
                        }
                    }

                    if ( (check && scope.client.redirectUrl) || !scope.client.redirectUrl) {
                    //if (check) {
                        //Successfully validated
                        scope.client.object = res;
                        localStorage.setItem('client', JSON.stringify(scope.client));

                        //Get dictionary based on returned language
                        DictionaryModel.setLanguage(res.language);
                        DictionaryModel.fetchDictionary(true)
                            .then(function (dict) {
                                DictionaryModel.setHash(dict);
                                scope.ui.dictionary = DictionaryModel.getHash();
                                scope.checkUser();
                            });

                    } else {
                        Raven.captureMessage('Failed to validate supplied client ID : ' + window.location.href);
                        scope.ui.loading = false;
                        scope.ui.error = true;
                        scope.ui.errors.invalid = true;
                    }
                });
        },

        /**
         * Get logo image
         */
        getLogo() {
            if (this.client.object) {
                return new AssetModel('/assets/img/partners/' + this.client.object.logo).path;
            } else {
                return false;
            }
        },

        getPartnerName(string) {
            if (this.client.object) {
                return string.replace(':partner', this.client.object.name);
            }

            return string;
        },

        getTosLink(string) {
            string = string.replace('[link]', '<a class="underlined" href="' + this.ui.dictionary.meta.tosUrl + '" target="_blank">');
            string = string.replace('[/link]', '</a>');
            return string;
        },

        /**
         * Generate URL for the terms and conditions HTML document
         */
        getTermsUrl() {
            return AssetModel('/assets/terms/' + this.ui.dictionary.meta.code + '.html').path;
        },

        /**
         * Validate URL query parameters
         */
        validateParams() {
            //Method 1 : appId and token
            if (this.$route.query.appId
                && this.$route.query.token) {

                this.client.id = this.$route.query.appId;
                this.client.token = this.$route.query.token;

                if (this.$route.query.redirectUrl) {
                    this.client.redirectUrl = this.$route.query.redirectUrl;
                }

                return true;

            //Method 2 : PII params
            } else if (this.$route.query.email
                       && this.$route.query.name
                       && this.$route.query.companyName
                       && this.$route.query.vat
                       && this.$route.query.appId
                       //&& this.$route.query.redirectUrl
                       ) {


                this.client.id = this.$route.query.appId;
                this.client.redirectUrl = this.$route.query.redirectUrl;

                this.profile.name = this.$route.query.name;
                this.profile.email = this.$route.query.email;
                this.profile.phone = this.$route.query.phone ? this.$route.query.phone : '';

                this.company.name = this.$route.query.companyName;
                this.company.vat = this.$route.query.vat;

                return true;
            }


            Raven.captureMessage('Failed to validate URL parameters : ' + window.location.href);
            return false;
        },

        /**
         * Check user
         */
        checkUser() {
            //Check if user exists
            var scope = this;
            UserModel.checkRegister(this.profile.email)
                .then(function (res) {
                    if (res.success) {
                        scope.ui.register = true;
                    } else {
                        scope.ui.login = true;
                    }

                    scope.ui.loading = false;
                });
        },

        /**
         * Login the user
         */
        loginUser(email, password) {
            if (email.length === 0 || password.length === 0) {
                this.ui.errors.login = true;
            }

            var scope = this;
            scope.ui.loading = true;

            UserModel.fromLogin(email, password)
                .then(function (response) {
                    //Successful login
                    if (response.success) {
                        scope.profile.object = response.contents;
                        XSRFModel.set(response.contents['xsrf-token']);
                        UserModel.construct(response.contents);
                        if (!response.contents['agreed-to-latest-terms-of-service']) {
                            scope.ui.terms = true;
                            scope.ui.loading = false;
                            this.ui.showDescription = false;
                        } else {
                            scope.checkCompany();
                        }

                        scope.ui.showDescription = false;
                        scope.ui.login = false;
                        //Failed login
                    } else {
                        scope.ui.errors.login = true;
                        scope.ui.loading = false;
                    }
                });
        },

        /**
         * Agree to terms of service
         */
        agreeToTos() {
            if (!this.profile.tos) {
                return false;
            }

            if (this.profile.object && !this.profile.object['agreed-to-latest-terms-of-service']) {
                this.profile.object['agreed-to-latest-terms-of-service'] = true;
                UserModel.construct(this.profile.object);
                UserModel.save();
                this.ui.terms = false;
                this.checkCompany();
            }
        },

        /**
         * Validate password
         */
        validatePassword(force) {
            if (force || !this.validation.password) {
                this.validation.password = Validator.password(this.profile.password);
            }

            return this.validation.password;
        },

        /**
         * Validate verification password
         * Make sure it matches the chosen password.
         */
        verifyPassword(force) {
            if (force || !this.validation.password2) {
                this.validation.password2 = this.profile.password == this.profile.password2;
            }

            return this.validation.password2;
        },

        /**
         * Verify that the connection checkbox has been checked
         */
        verifyConnect() {
            this.validation.connect = !!this.company.connect;

            return this.validation.connect;
        },

        /**
         * Verify terms of service
         */
        verifyTos() {
            this.validation.tos = !!this.profile.tos;

            return this.validation.tos;
        },

        /**
         * Register User
         */
        registerUser() {
            if (!this.validatePassword(true) || !this.verifyPassword(true) || !this.verifyTos() || !this.verifyConnect()) {
                return false;
            }

            var scope = this;
            scope.ui.loading = true;

            UserModel.fromRegister(scope.profile.email, scope.profile.password, DictionaryModel.getLanguage(), {}, { type : 'app', id : this.client.object.id})
                .then(function (registration) {
                    //Successful registration
                    if (registration.success) {

                        //Attempt login
                        UserModel.fromLogin(scope.profile.email, scope.profile.password)
                            .then(function (response) {
                                if (response.success) {
                                    UserModel.construct(response.contents);
                                    XSRFModel.set(response.contents['xsrf-token']);
                                    scope.ui.register = false;

                                    UserModel.fromSession()
                                        .then(function (response) {
                                            scope.profile.object = response.contents;
                                            scope.profile.object.name = scope.profile.name;
                                            scope.profile.object.phone = scope.profile.phone;

                                            UserModel.construct(scope.profile.object);
                                            UserModel.save();
                                        });

                                    scope.checkCompany();
                                } else {
                                    scope.ui.errors.password = false;
                                    scope.errors.register = true;
                                    scope.ui.loading = false;
                                }
                            });


                        //Failed registration
                    } else {
                        this.ui.errors.password = false;
                        scope.errors.register = true;
                        scope.ui.loading = false;
                    }
                });
        },

        /**
         * Check company
         */
        checkCompany() {
            var scope = this;
            var companies = new CompanyCollection({type: '_owned', query: this.company.vat});

            companies.getCompanies()
                .then(function (res) {
                    if (res.contents.length == 1) {
                        scope.assignCompany(res.contents[0]);
                    } else if (res.contents.length > 1) {
                        scope.ui.selectCompany = true;
                        scope.companies = res.contents;
                        scope.ui.loading = false;
                    } else {
                        scope.createCompany();
                    }
                });
        },

        /**
         * Create a company
         */
        createCompany() {
            var scope = this;

            CompanyModel.createCompany(this.company.name, this.company.vat)
                .then(function (res) {
                    if (res.id) {
                        scope.assignCompany(res);
                    } else {
                        scope.ui.loading = false;
                        scope.ui.error = true;
                        scope.ui.error.company = true;
                    }
                });
        },

        setConnectConfirmation(company) {
            this.confirmedConnect = true;
            this.assignCompany(this.currentCompanyToAdd);
        },

        /**
         * Assign a company
         */
        assignCompany(company) {
            this.currentCompanyToAdd = company;

            if (!this.confirmedConnect) {
                this.showConnectConfirm();
                return false;
            }

            var scope = this;

            this.ui.selectCompany = false;
            this.ui.newCompanyForm = false;

            CompanyModel.setCompany(company, this.$store);
            localStorage.setItem('company', JSON.stringify(company));

            if (this.company.connect) {
                var connection = new SharedConnectionModel();
                connection.request(this.client.object.company);
            }


            //Check ERP
            ErpModel.fromCompany()
                .then(function (erp) {
                    if (erp.id) {
                        scope.ui.finish = true;
                        scope.redirect();
                    } else {
                        scope.ui.erp = true;
                    }

                    scope.confirmedConnect = false;
                    scope.ui.loading = false;
                });
        },

        getCompanyName(string) {
            var lang = this.ui.dictionary.meta.code;

            if (this.currentCompanyToAdd && this.currentCompanyToAdd.confirmation && this.currentCompanyToAdd.confirmation[lang]) {
                return this.currentCompanyToAdd.confirmation[lang];
            } else if (this.currentCompanyToAdd) {
                return string.replace(':company', this.currentCompanyToAdd.name).replace(':company', this.currentCompanyToAdd.name);
            }

            return string;
        },

        /**
         * Redirect back to partner
         */
        redirect() {
            var scope = this;

            if (scope.client.redirectUrl) {
                setTimeout(function () {
                    window.location.href = scope.client.redirectUrl;
                }, 4000);
            }

        },

        showConnectConfirm() {
            this.$modal.show('dialog', {
                text: this.getCompanyName(this.ui.dictionary.connections.connectConfirmation),
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.connections.connectConfirmationNegative,
                        class: 'highlighted-text',
                    },
                    {
                        title: this.ui.dictionary.connections.connectConfirmationPositive,
                        class: 'warning',
                        handler: () => { this.setConnectConfirmation(); this.$modal.hide('dialog')}
                    }
                ]
            })
        },

        showSkipConfirmationDialog() {
            this.$modal.show('dialog', {
                text: this.getPartnerName(this.ui.dictionary.client.erpWarning),
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.client.declineSkip,
                        class: 'highlighted-text',
                    },
                    {
                        title: this.ui.dictionary.client.confirmSkip,
                        class: 'warning',
                        handler: () => { this.confirmsSkip(); this.$modal.hide('dialog')}
                    }
                ]
            })
        },

        confirmsSkip() {
            this.ui.erp = false;
            this.ui.finish = true;
            this.redirect();
        }
    };

    export default Vue.extend({
        template,
        data,
        methods,
        components: {
            'erp-view': CompanyErpView,
            'updating-view': UpdatingView,
            'create-company-view' : CreateCompanyView
        },
        canReuse: false,
        created() {
            this.init();
        },
        beforeRouteLeave(to, from, next) {
            if (to.path == '/account/company/mapping' || to.path == '/account/updating') {
                this.ui.erp = false;
                this.ui.finish = true;
                next(false);
            } else if (to.path == '/account/company/settings') {
                this.ui.newCompanyCreated = false;
                next(false);
            } else if (to.path == '/' || to.path == '/account/overview') {
                this.ui.mapping = false;
                this.ui.finish = true;
                this.redirect();
                next(false);
            }
        }
    });
