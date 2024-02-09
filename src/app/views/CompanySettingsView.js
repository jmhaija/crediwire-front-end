define([

    'Vue',
    'models/DictionaryModel',
    'models/CompanyModel',
    'models/ContextModel',
    'models/UserModel',
    'services/Validator',
    'services/Toast',
    'services/EventBus',
    'collections/CountryCollection',
    'elements/dropdown/countries-dropdown'

], function(Vue, DictionaryModel, CompanyModel, ContextModel, UserModel, Validator, Toast, EventBus, CountryCollection, CountriesDropdown) {

    const template = `
    <article>
        <header class="section-heading" v-show="!forVatCheck">{{ui.dictionary.company.settings}}</header>
        <section v-show="ui.loading">
            <div class="working small-margin"></div>
        </section>
        <section class="form" v-show="!ui.loading">
            <div class="input-field">
                <input type="text" v-model="company.name.value" v-bind:class="{ invalid : !company.name.valid }" v-on:keyup="validateName()" v-on:blur="validateName(true)">
                <label v-bind:class="{ filled: company.name.value.length > 0 }">{{ui.dictionary.company.name}}</label>
                <div class="warning" v-bind:class="{ show : !company.name.valid }">{{ui.dictionary.general.validation.generic}}</div>
            </div>

            <div class="input-field">
                <input type="text" v-model="company.vat.value" v-bind:class="{ invalid : !company.vat.valid }" v-on:keyup="validateVat(true)" v-on:blur="validateVat(true)">
                <label v-bind:class="{ filled: company.vat.value.length > 0 }">{{ui.dictionary.company.vat}}</label>
                <div class="warning" v-bind:class="{ show : !company.vat.valid }">{{ui.dictionary.general.validation.vat}}</div>
                <div class="warning" v-bind:class="{ show : errors.exists && company.vat.valid }">{{ui.dictionary.company.exists}}</div>
            </div>
            
            <countries-dropdown @countryChanged="countryChanged" :defaultCountryReference="countryReferenceByID(company.country.value)"></countries-dropdown>

            <div class="input-field" v-show="!forVatCheck">
                <input type="text" v-model="company.bank.value">
                <label v-bind:class="{ filled: company.bank.value.length > 0 }">{{ui.dictionary.company.bank}}</label>
            </div>
            <div class="input-field" v-show="!forVatCheck && companyObject && companyObject.country && countryReferenceByID(companyObject.country) == 'denmark'">
                <input type="text" v-model="company.officialName.value" disabled="disabled">
                <label v-bind:class="{ filled: company.officialName.value.length > 0 }">{{ui.dictionary.company.officialName}} ({{ui.dictionary.general.labels.modify}})</label>
            </div>
            <div class="input-field" v-show="!forVatCheck">
                <input type="text" v-model="company.officialIndustryCode.value" disabled="disabled">
                <label v-bind:class="{ filled: company.officialIndustryCode.value.length > 0 }">{{ui.dictionary.company.officialIndustryCode}} ({{ui.dictionary.general.labels.modify}})</label>
            </div>
            <section class="toolbar" v-show="profile.roles.indexOf('admin') >= 0 || permissions.owner || permissions.permissionType == 'full'">
                <div class="working" v-show="ui.working"></div>
                <button data-test-id="saveCompanySetting" type="button" v-show="!ui.working && !savedCallbackVatApproval" class="primary" v-on:click="saveCompany(company.name.value, company.vat.value, company.bank.value, false)">{{ui.dictionary.company.save}}</button>
                <button type="submit" v-show="!ui.working && savedCallbackVatApproval" class="primary"  v-on:click="saveCompany(company.name.value, company.vat.value, company.bank.value, false)">{{ui.dictionary.vatApproval.save}}</button><br>
                <button type="submit" v-show="!ui.working && savedCallbackVatApproval" class="primary"  v-on:click="saveCompany(company.name.value, company.vat.value, company.bank.value, true)">{{ui.dictionary.vatApproval.saveReconnect}}</button>
            </section>
        </section>
    </article>
`;
    const data = function () {
        return {
            ui: {
                dictionary: DictionaryModel.getHash(),
                working: false,
                loading: false
            },
            company: {
                name: { value: '', valid: true },
                vat: { value: '', valid: true },
                bank: { value: '', valid: true },
                officialName: { value: '', valid: true },
                officialIndustryCode: { value: '', valid: true },
                country: { value: '' }
            },
            errors: {},
            permissions: ContextModel.getContext() || UserModel.getCompanyUserInfo(),
            profile: UserModel.profile(),
            companyObject: null
        }
    };

    const methods = {

        init() {
            /**
             * Event listeners
             */
            EventBus.$on('companyContextChanged', this.bindCompanyModelToData);
            document.addEventListener('contextChange', this.bindCompanyModelToData);

            this.bindCompanyModelToData();
        },

        countryReferenceByID(id) {
            var found = null;

            this.countries.forEach(function (country) {
                if (country.id === id) {
                    found = country;
                }
            });

            if (found) {
                return found.reference
            } else {
                return found
            }
        },

        validateName(force) {
            if (force || !this.company.name.valid) {
                this.company.name.valid = Validator.minLength(this.company.name.value, 2);
            }

            return this.company.name.valid;
        },

        validateVat(force) {
            if (force || !this.company.vat.valid) {
                if (this.company.country.value === 'germany') {
                    this.company.vat.valid = true;
                } else if (this.company.country.value === 'norway') {
                    this.company.vat.valid = Validator.norwegianVat(this.company.vat.value);
                } else if (this.company.country.value === 'sweden') {
                    this.company.vat.valid = Validator.swedenVat(this.company.vat.value);
                } else if (this.company.country.value === 'other') {
                    this.company.vat.valid = Validator.otherVat(this.company.vat.value);
                } else {
                    this.company.vat.valid = Validator.vat(this.company.vat.value);
                }
            }

            this.errors.exists = false;
            return this.company.vat.valid;
        },

        /**
         * Bind the company model to the data fields
         */
        bindCompanyModelToData() {
            this.permissions = ContextModel.getContext() || UserModel.getCompanyUserInfo();

            var cm = CompanyModel.getCompany();

            if (this.presetCompany) {
                cm = this.presetCompany;
            }
            if (ContextModel.getContext()) {
                cm = ContextModel.getContext().company;
            }

            if (!cm) {
                this.$router.push('/account/create-company');
                return false;
            }

            for (var prop in this.company) {
                this.company[prop].value = cm[prop] ? cm[prop] : '';
                this.company[prop].valid = true;
            }

            this.companyObject = cm;
        },

        /**
         * Save company information
         */
        saveCompany: function (name, vat, bank, country, reconnectERP) {
            if (ContextModel.getContext()) {
                this.saveContext(name, vat, bank, country);
                return false;
            }

            if (!this.validateName(true) || !this.validateVat(true)) {
                return false;
            }

            var scope = this;
            scope.ui.working = true;

            CompanyModel.saveCompany(name, vat, bank, country, this.companyObject.id)
                .then(function (response) {
                    if (response.id) {
                        CompanyModel.setCompany(response, this.$store);
                        Toast.show(scope.ui.dictionary.company.saved);
                        EventBus.$emit('CompanySettingsSaved');

                        if (scope.savedCallbackVatApproval) {
                            scope.savedCallbackVatApproval(reconnectERP);
                        }
                    } else {
                        Toast.show(scope.ui.dictionary.company.notsaved, 'warning');
                    }

                    scope.ui.working = false;
                });
        },

        countryChanged(selectedCountry) {

            this.company.country.value = selectedCountry.reference;
        },

        /**
         * Save connection context information
         */
        saveContext(name, vat, bank, country) {
            if (!this.validateName(true) || !this.validateVat(true)) {
                return false;
            }

            var scope = this;
            var id = CompanyModel.getCompany().id;
            scope.ui.working = true;

            ContextModel.saveContext(id, name, vat, bank, country)
                .then(function (response) {
                    if (response.id) {
                        Toast.show(scope.ui.dictionary.company.saved);

                        if (scope.savedCallbackVatApproval) {
                            scope.savedCallbackVatApproval();
                        }
                    } else {
                        Toast.show(scope.ui.dictionary.company.notsaved, 'warning');
                    }

                    scope.ui.working = false;
                });
        }
    };

    const computed = {
      countries() {
          return this.$store.getters.countries;
      }
    };

    const watch = {
        'company.country.value': function (val, oldVal) {
            if (val !== oldVal) {
                this.validateVat(true)
            }
        }
    };

    return Vue.extend({
        template,
        data,
        methods,
        props: ['savedCallbackVatApproval', 'forVatCheck', 'presetCompany'],
        computed,
        watch,
        created: function () {
            this.init();
        },
        mounted: function () {
            //this.bindCompanyModelToData();
        },
        beforeDestroy: function () {
            EventBus.$off('companyContextChanged');
            document.removeEventListener('contextChange', this.bindCompanyModelToData);
        },
        components: {
            'countries-dropdown': CountriesDropdown
        }
    })
})
