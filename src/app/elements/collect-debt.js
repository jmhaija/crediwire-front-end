define([

    'Vue',
    'moment',
    'models/DictionaryModel',
    'models/ErpModel',
    'models/CompanyModel',
    'models/UserModel',
    'collections/CollectDebtsCollection',
    'services/NumberFormatter',
    'store/invoicesMutationTypes'

], function (Vue, moment, DictionaryModel, ErpModel, CompanyModel, UserModel, CollectDebtsCollection, NumberFormatter, invoicesMutationTypes) {

    var template = [
    '<article class="collect-debt">',

    '   <section v-show="ui.loading">',
    '       <div class="working"></div>',
    '   </section>',

    /**
     * Collector link form
     */
    '   <section v-show="!ui.loading && ui.section == \'form\'">',
    '       <div class="collector-form">',
    '           <h2>{{ui.dictionary.invoices.startCase}}</h2>',
    '           <p>{{ui.dictionary.invoices.startCaseDescription}}</p>',
    '           <h3>{{ui.dictionary.invoices.startCaseSubtitle}}</h3>',

    '           <div class="message-bar" v-show="ui.linkError">',
    '               <div class="warning">{{ui.dictionary.invoices.linkError}}</div>',
    '           </div>',

    '           <div class="input-field">',
    '               <input type="text" v-model="company.name">',
    '               <label v-bind:class="{ filled: company.name.length > 0 }">{{ui.dictionary.company.name}}</label>',
    '               <div class="warning" v-bind:class="{ show : fieldErrors[0] }">{{ui.dictionary.general.validation.generic}}</div>',
    '           </div>',

    '           <div class="input-field">',
    '               <input type="text" v-model="company.vat">',
    '               <label v-bind:class="{ filled: company.vat.length > 0 }">{{ui.dictionary.company.vat}}</label>',
    '               <div class="warning" v-bind:class="{ show : fieldErrors[1] }">{{ui.dictionary.general.validation.generic}}</div>',
    '               <div class="warning" :class="{ show: ui.companyRegistrationNumberError }">{{ui.dictionary.general.validation.alreadyInUse}}</div>',
    '           </div>',

    '           <div class="input-field">',
    '               <input type="text" v-model="profile.address">',
    '               <label v-bind:class="{ filled: profile.address.length > 0 }">{{ui.dictionary.profile.address}}</label>',
    '               <div class="warning" v-bind:class="{ show : fieldErrors[2] }">{{ui.dictionary.general.validation.generic}}</div>',
    '           </div>',

    '           <div class="input-field">',
    '               <input type="text" v-model="profile.zip">',
    '               <label v-bind:class="{ filled: profile.zip.length > 0 }">{{ui.dictionary.profile.zip}}</label>',
    '               <div class="warning" v-bind:class="{ show : fieldErrors[3] }">{{ui.dictionary.general.validation.generic}}</div>',
    '           </div>',

    '           <div class="input-field">',
    '               <input type="text" v-model="profile.city">',
    '               <label v-bind:class="{ filled: profile.city.length > 0 }">{{ui.dictionary.profile.city}}</label>',
    '               <div class="warning" v-bind:class="{ show : fieldErrors[4] }">{{ui.dictionary.general.validation.generic}}</div>',
    '           </div>',

    '           <div class="input-field">',
    '               <input type="text" v-model="profile.email">',
    '               <label v-bind:class="{ filled: profile.email.length > 0 }">{{ui.dictionary.profile.email}}</label>',
    '               <div class="warning" v-bind:class="{ show : fieldErrors[5] }">{{ui.dictionary.general.validation.generic}}</div>',
    '               <div class="warning" :class="{ show: ui.sameEmailError }">{{ui.dictionary.general.validation.alreadyInUse}}</div>',
    '           </div>',

    '           <div class="input-field">',
    '               <input type="text" v-model="profile.phone">',
    '               <label v-bind:class="{ filled: profile.phone.length > 0 }">{{ui.dictionary.profile.phone}}</label>',
    '               <div class="warning" v-bind:class="{ show : fieldErrors[6] }">{{ui.dictionary.general.validation.generic}}</div>',
    '           </div>',

    '           <div style="margin: 1rem 0;">',
    '               <div class="checkbox-field">',
    '                   <label style="margin: 0;"><input type="checkbox" v-model="agreeToTos"> <i style="border-color: #999;"></i> <span v-html="getTosLink(ui.dictionary.invoices.tosLikvido)"></span></label>',
    '               </div>',
    '           </div>',

    '           <div class="full-width">',
    '               <div v-show="ui.savingLink" class="working inline"></div>',
    '               <button v-show="!ui.savingLink" class="accent" v-on:click="establishLink()">{{ui.dictionary.invoices.forwardLikvido}}</button>',
    '           </div>',
    '       </div',
    '       ><div class="collector-form">',
    '           <h2>Hvad er Likvido?</h2>',
    '           <p>Likvido er en gratis, effektiv inkassoløsning. De hjælper med at inddrive ubetalte fakturaer og sikrer samtidig den gode kunderelation. Du får 100 % af den oprindelige faktura. Likvido honoreres med de renter, rykkere og inkassogebyrer, som skyldner skal betale. Likvido sikrer dig 100 % gratis inddrivelse uden risiko, hurtigt og effektivt. Du får udbetalt pengene samme dag, som Likvido modtager dem. Undervejs i sagsbehandlingen kan du følge med online.</p>',
    '           <iframe width="560" height="315" src="https://www.youtube.com/embed/QOg_UAu6xmA" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
    '       </div>',
    '   </section>',


    /**
     * Case listing
     */
    '   <section v-show="!ui.loading && ui.section == \'cases\'">',
    '       <h2>{{ui.dictionary.invoices.availableCases}}</h2>',
    '       <div class="recip-table">',
    '           <div class="row headings">',
    '               <div class="cell">{{ui.dictionary.invoices.name}}</div',
    '               ><div class="cell">{{ui.dictionary.invoices.number}}</div',
    '               ><div class="cell">{{ui.dictionary.invoices.dateIssued}}</div',
    '               ><div class="cell">{{ui.dictionary.invoices.dateDue}}</div',
    '               ><div class="cell">{{ui.dictionary.invoices.total}}</div',
    '               ><div class="cell">{{ui.dictionary.invoices.outstanding}}</div',
    '               ><div class="cell">{{ui.dictionary.invoices.createCase}}</div>',
    '           </div>',

    '           <div class="table-body">',
    '               <div v-for="(group, name) in groups">',
    '                   <div class="row clickable" v-show="filterWithoutCases(group.invoices).length > 0" v-on:click="toggleGroupVisibility(name)">',
    '                       <div class="cell">',
    '                           <span v-show="!isGroupVisible(name)">+</span>',
    '                           <span v-show="isGroupVisible(name)">&ndash;</span>',
    '                           {{name}}',
    '                       </div',
    '                       ><div class="cell">&nbsp;</div',
    '                       ><div class="cell">&nbsp;</div',
    '                       ><div class="cell">&nbsp;</div',
    '                       ><div class="cell">&nbsp;</div',
    '                       ><div class="cell" :class="{ red : group.hasDKK, faded : !group.hasDKK }" :title="group.total">{{formatNumber(group.total)}}</div',
    '                       ><div class="cell">',
    '                           <div class="checkbox-field" v-show="group.hasDKK">',
    '                               <label style="margin: 0;"><input type="checkbox" v-model="group.selectAll" v-on:change="selectAllInGroup(group)"> <i style="border-color: #999;"></i></label>',
    '                           </div>',
    '                       </div>',
    '                   </div>',

    '                   <div class="row" :class="{ faded : invoice.currency != \'DKK\' }" v-show="isGroupVisible(name)" v-for="(invoice, index) in filterWithoutCases(group.invoices)">',
    '                       <div class="cell">&nbsp;</div',
    '                       ><div class="cell">{{invoice.invoice_number}}</div',
    '                       ><div class="cell">{{formatDate(invoice.date)}}</div',
    '                       ><div class="cell">{{formatDate(invoice.due_date)}}</div',
    '                       ><div class="cell" :title="invoice.gross_amount">{{formatNumber(invoice.gross_amount, invoice.currency)}}</div',
    '                       ><div class="cell" :title="invoice.remainder" :class="{ red : invoice.currency == \'DKK\' }">{{formatNumber(invoice.remainder, invoice.currency)}}</div',
    '                       ><div class="cell">',
    '                           <div class="checkbox-field" v-show="invoice.currency == \'DKK\'">',
    '                               <label style="margin: 0;"><input type="checkbox" v-model="invoice.collectDebt" v-on:change="toggleGroupCheckbox(group)"> <i style="border-color: #999;"></i></label>',
    '                           </div>',
    '                       </div>',
    '                   </div>',

    '               </div>',

    '           </div>',

    '       </div>',


    '       <div class="float-right" style="margin-top: 40px;">',
    '           <button :class="[numberOfDebtsToCollect > 0? \'accent\' : \`disabled\`]" v-on:click="collectDebt()">{{ui.dictionary.invoices.collectDebt}}</button>',
    '       </div>',


    '       <div class="line-spacer"></div>',
    '       <div class="line-spacer"></div>',

    '       <h2>{{ui.dictionary.invoices.activeCases}}</h2>',
    '       <div class="recip-table">',
    '           <div class="row headings">',
    '               <div class="cell">{{ui.dictionary.invoices.name}}</div',
    '               ><div class="cell">{{ui.dictionary.invoices.number}}</div',
    '               ><div class="cell">{{ui.dictionary.invoices.dateIssued}}</div',
    '               ><div class="cell">{{ui.dictionary.invoices.dateDue}}</div',
    '               ><div class="cell">{{ui.dictionary.invoices.total}}</div',
    '               ><div class="cell">{{ui.dictionary.invoices.outstanding}}</div',
    '               ><div class="cell">{{ui.dictionary.invoices.caseStatus}}</div>',
    '           </div>',

    '           <div class="table-body">',
    '               <div class="row" v-for="(c, index) in cases">',
    '                   <div class="cell">{{getCompanyName(c.contact_reference)}}</div',
    '                   ><div class="cell">{{c.invoice_reference}}</div',
    '                   ><div class="cell">{{formatDate(c.date)}}</div',
    '                   ><div class="cell">{{formatDate(c.due_date)}}</div',
    '                   ><div class="cell" :title="c.amount">{{formatNumber(c.amount)}}</div',
    '                   ><div class="cell" :title="c.remainder">{{formatNumber(c.remainder)}}</div',
    '                   ><div class="cell" :class="{ red : c.status == \'14\', green : c.status == \'7\', orange :  c.status != \'14\' && c.status != \'7\' }" :title="c.status"  v-html="getStatusElement(c)"></div>',
    '               </div>',
    '           </div>',

    '       </div>',
    '   </section>',

    '</article>',
    ].join('');

    const ERROR_FIELDS = {
        EMAIL: 'email',
        COMPANY_REGISTRATION_NUMBER: 'company_registration_number'
    };
    const ERROR_MESSAGES = {
        ALREADY_IN_USE: 'Already in use'
    };

    var bindings = function () {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                loading : true,
                section : 'cases',
                savingLink : false,
                linkError : false,
                sameEmailError: false,
                companyRegistrationNumberError: false
            },
            invoices : [],
            cases : [],
            caseNumbers : [],
            collector : null,
            numOfCases : 0,
            onCase : 0,
            profile : UserModel.profile(),
            company : CompanyModel.getCompany(),
            agreeToTos : false,
            refresh : 0,
            fieldErrors : {
                0 : false,
                1 : false,
                2 : false,
                3 : false,
                4 : false,
                5 : false,
                6 : false
            },
            totalChecked: 0,
            numberOfDebtsToCollect: 0,
            openedGroupsIds: []
        };
    };


    var methods = {
        init : function () {
            this.getUnpaidInvoices();
            this.getCollectorLink();
            this.getCases();
            Vue.set(this.profile, 'address', '');
            Vue.set(this.profile, 'zip', '');
            Vue.set(this.profile, 'city', '');
        },

        getTosLink : function(string) {
            string = string.replace('[link]', '<a href="https://likvido.dk/betingelser/" target="_blank">');
            string = string.replace('[/link]', '</a>');
            return string;
        },

        getStatusElement(invoice) {
            const linkButtonStatuses = ['4', '10', '16', '19'];
            const statusText = this.ui.dictionary.invoices.caseStatuses[invoice.status];
            const tooltipText = this.ui.dictionary.invoices.likvidoFollowUpCase;

            if (linkButtonStatuses.indexOf(invoice.status) > -1) {
                return `<div class="button"><a target="_blank" href="https://app.likvido.dk/Invoices/Invoice/${invoice.reference_id}" title="${tooltipText}">${statusText}</a></div>`;
            }

            return statusText;
        },

        toggleGroupCheckbox : function (group) {
            var totalChecked = 0;

            group.invoices.forEach(function (invoice) {
                if (invoice.collectDebt) {
                    totalChecked++;
                }
            });

            if (totalChecked == group.invoices.length) {
                group.selectAll = true;
            } else {
                group.selectAll = false;
            }

            var tempState = group.open;
            group.open = false;
            group.open = tempState;

            this.checkNumberOfDebtsToCollect();
        },

        toggleGroupVisibility(groupName) {
            const groupNameIdx = this.openedGroupsIds.indexOf(groupName);
            if (groupNameIdx >= 0) {
                this.openedGroupsIds.splice(groupNameIdx, 1);
            } else {
                this.openedGroupsIds.push(groupName);
            }
        },

        isGroupVisible(groupName) {
            return this.openedGroupsIds.includes(groupName);
        },

        selectAllInGroup : function (group) {
            group.invoices.forEach(function (invoice) {
                invoice.collectDebt = group.selectAll;
            });

            var tempState = group.open;
            group.open = false;
            group.open = tempState;
            //TODO: Find out the better way to check this - not the best idea, but deep: true for watcher didn`t work
            this.checkNumberOfDebtsToCollect();
        },

        collectDebt : function () {
            if (this.collector) {
                this.createCases();
            } else {
                this.ui.section = 'form';
            }
        },

        createCases : function () {
            this.numOfCases = 0;
            this.onCase = 0;
            this.ui.loading = true;

            for (var group in this.groups) {
                this.groups[group].invoices.forEach(function (invoice) {
                    if (invoice.collectDebt) {
                        this.numOfCases++;
                        this.makeCaseRequest(invoice);
                    }
                }.bind(this));
            }

            if (this.numOfCases === 0) {
                this.ui.loading = false;
            }
        },

        makeCaseRequest : function (invoice) {
            this.onCase++;
            CollectDebtsCollection.startCase(invoice.id)
                .then(function (res) {
                    if (this.onCase == this.numOfCases) {
                        this.getCases();
                        //this.organizeByCompany();
                    }
                }.bind(this));
        },

        establishLink : function () {
            if (!this.agreeToTos) {
                return false;
            }

            this.ui.savingLink = true;
            this.ui.linkError = false;
            this.ui.sameEmailError = false;
            this.ui.companyRegistrationNumberError = false;

            CollectDebtsCollection.establishCollectorLink('likvido', this.company.name, this.company.vat, this.profile.address, this.profile.zip, this.profile.city, this.profile.email, this.profile.phone)
                .then(function (res) {
                    if (res.collector) {
                        this.ui.section = 'cases';
                        this.collector = res.collector;
                        this.createCases();
                    } else {
                        this.ui.savingLink = false;
                        this.ui.linkError = true;

                        if (res.errors) {
                            res.errors.forEach(function (err) {
                                if (err.field) {
                                    this.fieldErrors[err.field] = true;
                                }

                                const { EMAIL, COMPANY_REGISTRATION_NUMBER } = ERROR_FIELDS;
                                const { ALREADY_IN_USE } = ERROR_MESSAGES;

                                if (err.field === EMAIL && err.message === ALREADY_IN_USE) {
                                    this.ui.sameEmailError = true;
                                } else if (err.field === COMPANY_REGISTRATION_NUMBER && err.message === ALREADY_IN_USE) {
                                    this.ui.companyRegistrationNumberError = true;
                                }

                            }.bind(this));
                        }
                    }
                }.bind(this));
        },


        getCollectorLink : function () {
            CollectDebtsCollection.getCollectorLink()
                .then(function (res) {
                    if (res.collector) {
                        this.collector = res;
                    }
                }.bind(this));
        },

        getUnpaidInvoices : function () {
            this.ui.loading = true;

            CollectDebtsCollection.getUnpaidInvoices().then((response) => {
                if (response && response.invoices.length) {
                    this.setUnpaidInvoices(response.invoices);

                    this.invoices = response.invoices.map(invoice => {
                        invoice.collectDebt = false;
                        return invoice;
                    });

                    // this.organizeByCompany();
                    this.getCases();
                }
            });
        },


        getCases : function () {
            CollectDebtsCollection.getCases()
                .then(function (res) {
                    if (res._embedded && res._embedded.items && res._embedded.items.length > 0) {
                        this.cases = res._embedded.items;

                        this.cases.forEach(function (c) {
                            this.caseNumbers.push(c.invoice_reference);
                        }.bind(this));
                    }

                    this.ui.loading = false;
                }.bind(this));
        },


        filterWithCases : function (invoices) {
            var list = invoices.slice();

            return list.filter(function (invoice) {
                return this.caseNumbers.indexOf(invoice.invoice_reference) >= 0;
            }.bind(this));
        },

        filterWithoutCases : function (invoices) {
            var list = invoices.slice();

            return list.filter(function (invoice) {
                return this.caseNumbers.indexOf(invoice.invoice_reference) < 0;
            }.bind(this));
        },


        formatNumber : function(value, currency) {
            if (value === 0) {
                return '0.00' + ' ' + (currency ? currency : (ErpModel.getErp() && ErpModel.getErp().currency ? ErpModel.getErp().currency : ''));
            }

            return NumberFormatter.abbreviate(value, true) + ' ' + (currency ? currency : (ErpModel.getErp() && ErpModel.getErp().currency ? ErpModel.getErp().currency : ''));
        },

        localeFormat : function(value, currency) {
            return NumberFormatter.format(value) + ' ' + (currency ? currency : (ErpModel.getErp() && ErpModel.getErp().currency ? ErpModel.getErp().currency : ''));
        },

        formatDate : function(string) {
            if (string) {
                return moment(string).format(this.ui.dictionary.locale.displayFormat);
            } else {
                return '--';
            }
        },

        getCompanyName : function (reference) {
            var found = false;

            this.recipients.forEach(function (recip) {
                if (recip.reference == reference) {
                    found = recip.display_name;
                }
            }.bind(this));

            return found;
        },

        checkNumberOfDebtsToCollect: function () {
            this.numberOfDebtsToCollect =  this.invoices.filter((invoice) => invoice.collectDebt).length;
        },

        setUnpaidInvoices(invoices) {
            this.$store.dispatch('setUnpaidInvoices', invoices);
        },
    };

    const computed = {
        groups() {
            return this.$store.getters.getUnpaidInvoicesOrganizedByCompany(this.recipients)
        },
    };

    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        computed,
        props : ['recipients'],
        mounted : function () {
            this.init();
        }
    });
});
