define([

    'Vue',
    'moment',
    'Raven',
    'models/DictionaryModel',
    'models/ErpModel',
    'models/BrowserModel',
    'models/AssetModel',
    'models/UserModel',
    'models/ContextModel',
    'collections/AccountCollection',
    'collections/BalanceDataCollection',
    'services/EventBus',
    'services/Toast',
    'elements/financial-years',
    'elements/modals/partial-mapping-confirm',
    'services/NumberFormatter',
    'elements/modals/show-automap-success',
    'elements/modals/show-automap-partial',
    'elements/modals/show-automap-failure',
    'elements/modals/ledger-modal',

], function(Vue, moment, Raven, DictionaryModel, ErpModel, BrowserModel, AssetModel, UserModel, ContextModel, AccountCollection, BalanceDataCollection, EventBus, Toast, financialYears, partialMappingConfirmModal, NumberFormatter, showAutomapSuccess, showAutomapPartial, showAutomapFailure, ledgerModal) {
    /**
     * View template
     */
    var template = [
        `<article
            class="company-mapping-view"
            ref="mapping"
        >
            <header class="section-heading">
                <span>{{ui.dictionary.company.mapping}}</span>
                <span>
                    <i
                        v-if="showValidationStatus"
                        v-tooltip="{
                            classes: ['mappingValidatedTooltip'],
                            content: mappingCurrentlyValidated ? ui.dictionary.connections.validated : ui.dictionary.connections.previouslyValidated,
                            placement: 'left'
                        }"
                        class="cwi-shield pointer"
                        :class="{
                            'ok-color': mappingCurrentlyValidated,
                            'caution-color': mappingPreviouslyValidated
                        }"
                    ></i>
                </span>
            </header>`,
        '   <section v-show="ui.loading && !erp.initializing">',
        '       <div class="working small-margin"></div>',
        '   </section>',
        '   <section v-show="!ui.loading || erp.initializing">',

        '       <section v-show="!erp.active && erp.deleting && !ui.forbidden && !erp.initializing">',
        '           <p>{{ui.dictionary.erp.deleting}}</p>',
        '           <div class="working small-margin"></div>',
        '       </section>',

        '       <section v-show="ui.forbidden && !erp.initializing">',
        '           <p>{{ui.dictionary.erp.forbidden}}</p>',
        '       </section>',

        '       <section v-show="!erp.active && !erp.deleting && !ui.forbidden && !erp.initializing && !ui.loading">',
        '           <p>{{ui.dictionary.erp.noErp}}</p>',
        '       </section>',

        '       <section v-show="erp.active && !erp.deleting && !ui.forbidden">',

        '           <div v-show="!accounts.map && !erp.initializing">',
        '               <p>{{ui.dictionary.accounts.notfound}}</p>',
        '           </div>',


        '           <div>',

        '               <p v-show="permissions.owner || permissions.permissionType == \'full\'">{{ui.dictionary.accounts.instructions}}</p>',

        '               <financial-years :onDateChange="getAccountValues"></financial-years>',

        '               <section class="mapping-container">',

        '                   <section class="toolbar">',
        '                       <div class="float-right">',
        '                           <div v-show="!erp.initializing && !erp.failed && (permissions.owner || permissions.permissionType == \'full\' || mappingValidator)">',
        '                               <div class="working" v-show="ui.saving"></div>',
        '                               <span v-show="mappingValidator && shouldValidate() && !ui.saving" class="validation-options" v-on:click="ui.showValidationOptions = !ui.showValidationOptions"><i class="cwi-gear"></i></span>',
        '                               <button v-show="(!mappingValidator || !shouldValidate()) && !ui.saving" class="primary" v-on:click="saveMapping()">{{ui.dictionary.accounts.save}}</button>',
        '                               <button v-show="mappingValidator && shouldValidate() && !ui.saving && ui.showValidationOptions" v-on:click="saveMapping()">{{ui.dictionary.accounts.saveNoValidate}}</button>',
        '                               <button v-show="mappingValidator && !isPartiallyMapped() && shouldValidate() && !ui.saving" class="primary" v-on:click="saveMapping(true)">{{ui.dictionary.accounts.saveValidate}}</button>',
        '                               <span class="tooltip mapping-validator-tooltip"><div class="message left">{{ui.dictionary.accounts.partialMapping}}</div><button v-show="mappingValidator && isPartiallyMapped() && shouldValidate() && !ui.saving" class="disabled">{{ui.dictionary.accounts.saveValidate}}</button></span>',
        '                           </div>',
        '                           <div v-show="erp.initializing">',
        '                               <div class="working inline"></div> {{ui.dictionary.erp.initializing}}',
        '                           </div>',
        '                           <div v-show="erp.failed">',
        '                               {{ui.dictionary.erp.failed}}',
        '                           </div>',
        '                       </div>',
        '                       <div class="left-text">',
        '                           <a v-on:click="accountsLoaded = false; getAccounts(false)" v-show="ui.accountsActive">{{ui.dictionary.accounts.cancel}}</a>',
        '                           <span v-show="!ui.accountsActive">&nbsp;</span>',
        '                       </div>',
        '                   </section>',


        '                   <p class="warn-color" v-show="hasMismatchedAccounts && !erp.initializing">',
        '                       <i class="cwi-info"></i> &nbsp;',
        '                       {{ui.dictionary.accounts.wrongTypeError}}',
        '                       <button v-show="!ui.searchingMismatches" v-on:click="showNextMismatch(); ui.searchingMismatches = true;">{{ui.dictionary.accounts.findMismatchedAccounts}}</button>',
        '                       <button v-show="ui.searchingMismatches"  v-on:click="showPreviousMismatch()">{{ui.dictionary.accounts.previousMismatch}}</button>',
        '                       <button v-show="ui.searchingMismatches"  v-on:click="showNextMismatch()">{{ui.dictionary.accounts.nextMismatch}}</button>',
        '                   </p>',


        '                   <p class="warn-color" v-show="hasNewAccounts && !erp.initializing">',
        '                       <i class="cwi-info"></i> &nbsp;',
        '                       {{ui.dictionary.accounts.newAccounts}}',
        '                       <button v-show="!ui.searchingNew" v-on:click="showNextNew(); ui.searchingNew = true;">{{ui.dictionary.accounts.findNewAccounts}}</button>',
        '                       <button v-show="ui.searchingNew"  v-on:click="showPreviousNew()">{{ui.dictionary.accounts.previousMismatch}}</button>',
        '                       <button v-show="ui.searchingNew"  v-on:click="showNextNew()">{{ui.dictionary.accounts.nextMismatch}}</button>',
        '                   </p>',


        '                   <section class="title-bar" :style="\'background-image: url(\' + getArrow() + \');\'"  v-show="ui.accountsActive">',
        '                       <div><h2>{{ui.dictionary.accounts.erpAccounts}}</h2></div>',
        '                       <div><h2>{{ui.dictionary.accounts.crediwireAccounts}}</h2></div>',
        '                   </section>',


        '                   <section class="expand-collapse-bar">',
        '                       <div class="section">',
        '                           <div class="float-right no-margin faded" style="margin-right: 16%;">{{erpObject.currency}}</div>',
        '                           <a v-on:click="expandAllCOA()">{{ui.dictionary.palbal.expandAll}}</a> | <a v-on:click="collapseAllCOA()">{{ui.dictionary.palbal.collapseAll}}</a>',
        '                       </div',
        '                       ><div class="section">',
        '                           <div class="float-right no-margin faded" style="margin-right: 16%;">{{erpObject.currency}}</div>',
        '                           <a v-on:click="expandAllMap()">{{ui.dictionary.palbal.expandAll}}</a> | <a v-on:click="collapseAllMap()">{{ui.dictionary.palbal.collapseAll}}</a>',
        '                       </div>',
        '                   </section>',


        '                   <div class="chart-of-accounts dropzone" :class="{ active : dragging.mapDragging }"',
        '                        id="coa-container"',
        '                        v-on:drop="drop(false, $event)"',
        '                        v-on:dragover="dragOver($event, \'chart-of-accounts\')"',
        '                        v-on:dragenter="dragEnter(null, $event)"',
        '                        v-show="ui.accountsActive">',


        '                       <div v-for="(account, accIndex) in sortAccounts(accounts.chartOfAccounts)"',
        '                            :id="\'a\' + account.id"',
        '                            class="account-mapping-item"',
        '                            :class="{ heading : account.type == \'he1\' || account.type == \'he2\', \'small-heading\' : account.type == \'he3\', account : account.type == \'pal\' || account.type == \'bal\', pal : account.type == \'pal\', bal : account.type == \'bal\', selected : account.selected, invalid : erpObject && erpObject.mappingValidations && erpObject.mappingValidations.length > 0 && !account.validated && (account.type == \'pal\' || account.type == \'bal\') }"',
        '                            v-on:click="selectAccount(account, accIndex, sortAccounts(accounts.chartOfAccounts), false, $event); collapseChartSection(account, accounts.chartOfAccounts, accIndex);"',
        '                            v-show="account.type != \'sum\' && ( (!account.collapsed && account.type.indexOf(\'h\') != 0) || account.type.indexOf(\'h\') === 0)"',
        '                            :draggable="account.type.indexOf(\'h\') < 0"',
        '                            v-on:dragstart="dragStart(null, accIndex, account, $event); dragging.chartDragging = true;"',
        '                            v-on:dragend="dragging.chartDragging = false;">',
        '                           <i v-if="hasEntryRole && account.type.indexOf(\'h\') < 0" @click.stop="openLedger(account)" class="cwi-info"/>',
        '                           <span v-show="account.type == \'he1\' || account.type == \'he2\' || account.type == \'he3\'">',
        '                               <span v-show="account.collapsed" class="none-select">+</span><span v-show="!account.collapsed" class="none-select">&ndash;</span>',
        '                           </span>',
        '                           <span class="account-mapping-name none-select" :title="account.name">{{account.number}} {{account.name}} <span v-show="account.type == \'he1\' || account.type == \'he2\' || account.type == \'he3\'">({{account.totalAccounts}})</span></span',
        '                           ><span class="account-mapping-value" v-show="account.type == \'pal\' || account.type == \'bal\'" :title="formatNumber(accountValues[account.id], true)">{{formatNumber(accountValues[account.id])}}</span>',
        '                           ',
        '                       </div>',

        '                   </div><div class="account-map"',
        '                              id="account-container"',
        '                              v-on:dragover="dragOver($event, \'account-map\')"',
        '                              v-on:drop="drop(true, $event)"',
        '                              v-show="ui.accountsActive">',


        '                       <div v-for="(category, catIndex) in accounts.map"',
        '                            ref="accountCategories"',
        '                            class="drop-indicator"',
        '                            :class="{ level1 : category.level == 1, level2 : category.level == 2, level3 : category.level == 3 }"',
        '                            v-on:click="collapseMapSection(category, accounts.map, catIndex)"',
        '                            v-show="category.level === 0 || !category.invisible"',
        '                            v-on:dragenter="dragEnter(catIndex, $event)">',
        '                           <div class="heading sticky" :class="{ pal : category.type == \'pal\' && category.reference != \'PrivateAccounts\', bal : category.type == \'bal\' && category.reference != \'PrivateAccounts\', \'hasAccounts\' : category.accounts && category.accounts.length > 0, invalid : hasInvalidAccounts(category.accounts) }">',
        '                               <span v-show="category.collapsed">+</span>',
        '                               <span v-show="!category.collapsed">&ndash;</span>',
        '                               {{ui.dictionary.kpiCategories[category.reference]}}',
        '                               <span v-show="category.accounts">({{getCategoryCount(catIndex)}})</span',
        '                               ><span class="account-mapping-value float-right no-margin" :title="formatNumber(categoryValues[category.reference], true)">{{formatNumber(categoryValues[category.reference])}}</span>',
        '                           </div>',
        '                           <div class="dropzone" :class="{ active : dragging.chartDragging || dragging.mapDragging, pal : category.type == \'pal\', bal : category.type == \'bal\', empty : category.accounts.length === 0  }">',
        '                               <div v-for="(account, accIndex) in category.accounts"',
        '                                   :id="\'a\' + account.id"',
        '                                   class="account account-mapping-item"',
        '                                   :class="{ selected : account.selected, pal : account.type == \'pal\', bal : account.type == \'bal\', invalid : erpObject && erpObject.mappingValidations && erpObject.mappingValidations.length > 0 && !account.validated }"',
        '                                   v-on:click.stop="selectAccount(account, accIndex, category.accounts, true, $event)"',
        '                                   v-show="!account.collapsed && account.type != \'sum\'"',
        '                                   draggable="true"',
        '                                   v-on:dragstart="dragStart(catIndex, accIndex, account, $event); dragging.mapDragging = true;"',
        '                                   v-on:dragend="dragging.mapDragging = false;">',
        '                                   <i v-if="hasEntryRole" @click.stop="openLedger(account)" class="cwi-info"/>',
        '                               <span class="mismatch-warn" v-show="category.reference != \'PrivateAccounts\' && (account.type != category.type || (erpObject && erpObject.mappingValidations && erpObject.mappingValidations.length > 0 && !account.validated) )">!</span>',
        '                               <span class="account-mapping-name none-select" :title="account.name">{{account.number}} {{account.name}}</span',
        '                               ><span class="account-mapping-value" :title="formatNumber(accountValues[account.id], true)">{{formatNumber(accountValues[account.id])}}</span>',
        '                               </div>',
        '                           </div>',
        '                       </div>',

        '                   </div>',
        '               </section>',


        '           </div>',
        '       </section>',

        '   </section>',
        '</article>'
    ].join("\n");

    /**
     * Data bindings
     */
    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                loading : true,
                forbidden : false,
                saving : false,
                showLeaveConfirm : false,
                partialMappingConfirm : false,
                showValidationOptions : false,
                nextRoute : {
                    path : '/account/overview'
                },
                accountsActive : false,
                keepAlive : false,
                showWrongTypeError : false,
                searchingMismatches : false,
                searchingNew : false
            },
            erp : {
                active : false,
                deleting : false,
                initializing : false,
                failed : false,
                check : null,
                interval : 10000
            },
            accounts : {},
            dragging : {
                catIndex : null,
                accIndex : null,
                catHover : null,
                chartDragging : false,
                mapDragging : false,
                changed : false
            },
            accountsLoaded : false,
            permissions : ContextModel.getContext() || UserModel.getCompanyUserInfo(),
            startCollapsed : ['PersonalVehicle', 'CompanyVehicle', 'ImmaterialAssets', 'FinancialAssets', 'Depreciation'],
            profile : UserModel.profile(),
            erpObject : ErpModel.getErp(),
            currentMismatch : null,
            mismatchedAccounts : [],
            newAccounts : [],
            currentNewAccount : null,
            rawAccountValues : null,
            accountValues : {},
            categoryValues : {}
        };
    };

    /**
     * Methods
     */
    var methods = {
        /**
         * Initialize view
         */
        init : function() {
            if (this.$route.query.check) {
                this.erp.initializing = true;
            }
            /**
             * Event listeners
             */
            EventBus.$on('companyUserChanged', this.resetPermissions);
        },

        openLedger : function (account) {
            if (!this.hasEntryRole || (account.type != 'pal' && account.type != 'bal') ) {
                return false;
            }
            this.ledgerAccount = account;
            this.$modal.show(ledgerModal, {ledgerAccount: account}, {height: 'auto', width: '70%'});
        },

        findMismatchedAccounts : function() {
            var scope = this;

            if (this.mismatchedAccounts.length === 0) {
                this.accounts.map.forEach(function(category) {
                    category.accounts.forEach(function(account) {
                        if (account.type != category.type) {
                            scope.mismatchedAccounts.push('a' + account.id);
                        }
                    });
                });
            }

            return this.mismatchedAccounts;
        },

        showNextMismatch : function(reverse) {
            var accounts = this.findMismatchedAccounts();

            if (accounts.length === 0) {
                return false;
            }

            var index = 0;

            if (this.currentMismatch === null && !reverse) {
                this.currentMismatch = 0;
            } else if (this.currentMismatch === null && reverse) {
                this.currentMismatch = accounts.length - 1;
            } else if (reverse) {
                this.currentMismatch--;
                index = this.currentMismatch;
            } else {
                this.currentMismatch++;
                index = this.currentMismatch;
            }

            if (!accounts[index]) {
                this.currentMismatch = reverse ? accounts.length - 1 : 0;
                index = this.currentMismatch;
            }

            var el = this.$refs.mapping.querySelector('#' + accounts[index]);
            var elPos = el.offsetTop - el.scrollTop + el.clientTop - 560;
            var container = this.$refs.mapping.querySelector('#account-container');

            container.scrollTop = elPos;
        },

        showPreviousMismatch : function() {
            this.showNextMismatch(true);
        },

        findNewAccounts : function () {
            var scope = this;

            if (this.newAccounts.length === 0) {
                this.accounts.map.forEach(function(category) {
                    category.accounts.forEach(function (account) {
                        if (account.type == 'pal' || account.type == 'bal') {
                            if (account.validated === false) {
                                scope.newAccounts.push({ id : 'a' + account.id, container : 'account-container'});
                            }
                        }
                    });
                });

                this.accounts.chartOfAccounts.forEach(function(account) {
                    if (account.type == 'pal' || account.type == 'bal') {
                        if (account.validated === false) {
                            scope.newAccounts.push({ id : 'a' + account.id, container : 'coa-container'});
                        }
                    }
                });
            }

            return this.newAccounts;
        },

        showNextNew : function(reverse) {
            var accounts = this.findNewAccounts();

            if (accounts.length === 0) {
                return false;
            }

            var index = 0;


            if (this.currentNewAccount === null && !reverse) {
                this.currentNewAccount = 0;
            } else if (this.currentNewAccount === null && reverse) {
                this.currentNewAccount = accounts.length - 1;
            } else if (reverse) {
                this.currentNewAccount--;
                index = this.currentNewAccount;
            } else {
                this.currentNewAccount++;
                index = this.currentNewAccount;
            }

            if (!accounts[index]) {
                this.currentNewAccount = reverse ? accounts.length - 1 : 0;
                index = this.currentNewAccount;
            }

            var el = this.$refs.mapping.querySelector('#' + accounts[index].id);
            var elPos = el.offsetTop - el.scrollTop + el.clientTop - 560;
            var container = this.$refs.mapping.querySelector('#' + accounts[index].container);

            container.scrollTop = elPos;
        },

        showPreviousNew : function () {
            this.showNextNew(true);
        },

        getCategoryCount : function(index) {
            if (!this.accounts || !this.accounts.map || !this.accounts.map[index]) {
                return 0;
            }

            var count = 0;
            var level = this.accounts.map[index].level;

            do {
                count += this.accounts.map[index].accounts.length;
                index++;
            } while(index < this.accounts.map.length && level < this.accounts.map[index].level);

            return count;
        },

        hasInvalidAccounts : function(accounts) {
            var invalid = false;

            if (this.erpObject && this.erpObject.mappingValidations && this.erpObject.mappingValidations.length > 0) {
                accounts.forEach(function(account) {
                    if (!account.validated) {
                        invalid = true;
                    }
                });
            }

            return invalid;
        },

        shouldValidate : function() {
            return this.erpObject && (!this.erpObject.currentMappingValidity || this.dragging.changed);
        },


        resetPermissions : function() {
            this.permissions = ContextModel.getContext() || UserModel.getCompanyUserInfo();
            this.ui.keepAlive = false;
            this.checkErp();
        },

        /**
         * Check state of ERP
         */
        checkErp : function() {
            var erp = ErpModel.getErp();
            this.erpObject = ErpModel.getErp();

            if (erp == 'loading') {
                this.ui.loading = true;
                this.erp.initializing = false;
                setTimeout(() => this.checkErp(), 1000);
            } else if (erp == 'forbidden') {
                this.ui.loading = false;
                this.ui.forbidden = true;
            } else if (erp === null || erp === false) {
                this.erp.active = false;
                this.erp.deleting = false;
                this.ui.loading = false;
                this.ui.forbidden = false;
                this.ui.accountsActive = false;
                clearInterval(this.erp.check);
            } else if (erp.deleting) {
                this.ui.loading = false;
                this.erp.active = false;
                this.erp.deleting = true;
                this.startCheckInterval();
                this.ui.accountsActive = false;
            } else if (erp.status == 'initializing') {
                this.erp.active = true;
                this.ui.loading = false;
                this.erp.initializing = true;
                this.ui.forbidden = false;
                this.getAccounts(false);
                this.startCheckInterval();

                this.ui.accountsActive = false;
            } else if (erp !== false && !this.ui.keepAlive) {
                this.erp.initializing = false;
                this.erp.active = true;
                this.ui.loading = false;
                this.ui.saving = false;
                this.ui.forbidden = false;
                this.ui.keepAlive = true;
                this.getAccounts(true);
                this.ui.accountsActive = true;
                this.startCheckInterval();
            }
        },

        /**
         * Start ERP Check interval
         */
        startCheckInterval : function() {
            var scope = this;

            if (this.erp.check) {
                return false;
            }

            this.erp.check = setInterval(function() {
                ErpModel.fromCompany()
                    .then(function(response) {
                        if (response.id) {
                            ErpModel.setErp(response);
                        } else {
                            ErpModel.forgetErp();
                        }

                        scope.checkErp();
                    });
            }, this.erp.interval);
        },



        sortAccounts : function(accounts) {
            if (accounts && accounts[0] && accounts[0].order) {
                return accounts.slice().sort(function(a, b) {
                    return a.order - b.order;
                });
            }

            return accounts;
        },


        /**
         * Get accounts for mapping
         *
         * @param {boolean} check
         */
        getAccounts : function(check) {
            var scope = this;
            var accounts = new AccountCollection();

            scope.ui.loading = true;

            accounts.getAccounts()
                .then(function(res) {
                    if (res.success) {
                        scope.accounts = res.data;
                        scope.collapsedStartingAccounts();
                        if (check && (scope.$route.query.check || scope.automapCheck)) {
                            scope.checkMapping();
                        }
                        scope.countCOA();
                    } else {
                        scope.accounts = {};
                    }

                    scope.ui.loading = false;

                    scope.dragging.changed = false;
                });
        },


        getAccountValues : function (range) {
            var data = new BalanceDataCollection();
            var start = moment(range.start).format('YYYY-MM-DD');
            var end = moment(range.end).format('YYYY-MM-DD');

            data.getData('year', false, 'to_date', 'end_year_total', false, start, end)
                .then(function(res) {
                    if (res.compare && res.compare.pal && res.compare.bal) {
                        this.rawAccountValues = res.compare;
                        this.addValues();
                    } else {
                        this.ui.loading = false;
                    }
                }.bind(this));
        },

        addValues : function () {
            this.rawAccountValues.pal.forEach(function (account) {
                if (account.value !== undefined) {
                    this.accountValues[account.id] = account.value;
                }
            }.bind(this));

            this.rawAccountValues.bal.forEach(function (account) {
                if (account.value !== undefined) {
                    this.accountValues[account.id] = account.value;
                }
            }.bind(this));

            this.addCategoryValues();
            this.ui.loading = false;
        },

        addCategoryValues : function () {
            this.accounts.map.forEach(function (category) {
                this.categoryValues[category.reference] = 0;

                category.accounts.forEach(function (account) {
                    this.categoryValues[category.reference] += this.accountValues[account.id];

                    if (category.parentZero) {
                        this.categoryValues[category.parentZero] += this.accountValues[account.id];
                    }

                    if (category.parentOne) {
                        this.categoryValues[category.parentOne] += this.accountValues[account.id];
                    }
                }.bind(this));
            }.bind(this));
        },

        formatNumber : function(value, normalized) {
            if (isNaN(value)) {
                return 0;
            }

            if (normalized) {
                return NumberFormatter.format(value) + ' ' + this.erpObject.currency;
            }

            if (value > 999999999 || value < -999999999) {
                value = Math.round((value / 1000000000) * 10) / 10 + ' ' + this.ui.dictionary.meta.billions;
            } else if (value > 999999 || value < -999999) {
                value = Math.round((value / 1000000) * 10) / 10 + ' ' + this.ui.dictionary.meta.millions;
            } else if (value > 999 || value < -999) {
                value = Math.round((value / 1000) * 10) / 10 + ' ' + this.ui.dictionary.meta.thousands;
            } else {
                value = Math.round(value * 10) / 10;
            }

            return String(value).replace('.', this.ui.dictionary.meta.decimalSymbol);
        },

        countCOA : function () {
            var currIndex = 0;

            this.accounts.chartOfAccounts.forEach(function (account, index) {
                if (account.type.indexOf('h') === 0) {
                    currIndex = index;
                    this.accounts.chartOfAccounts[currIndex].totalAccounts = 0;
                } else if (account.type == 'pal' || account.type == 'bal') {
                    this.accounts.chartOfAccounts[currIndex].totalAccounts++;
                }
            }.bind(this));
        },


        /**
         * Some account categories should start with being collapsed
         */
        collapsedStartingAccounts : function() {
            var scope = this;

            this.accounts.map.forEach(function(category, index) {
                if (scope.startCollapsed.indexOf(category.reference) >= 0) {
                    scope.collapseMapSection(category, scope.accounts.map, index);
                }
            });
        },

        collapseAllMap : function() {
            var list = this.accounts.map;
            this.accounts.map.forEach(function(category, index) {
                Vue.set(category, 'collapsed', true);
                for (var i = 0; i < category.accounts.length; i++) {
                    Vue.set(category.accounts[i], 'collapsed', true);
                }
                index++;

                while(index < list.length && list[index].level > category.level) {
                    Vue.set(list[index], 'invisible', true);
                    Vue.set(list[index], 'collapsed', true);
                    for (var i = 0; i < list[index].accounts.length; i++) {
                        Vue.set(list[index].accounts[i], 'collapsed', true);
                    }
                    index++;
                }
            }.bind(this));
        },

        expandAllMap : function () {
            var list = this.accounts.map;
            this.accounts.map.forEach(function(category, index) {
                Vue.set(category, 'collapsed', false);
                for (var i = 0; i < category.accounts.length; i++) {
                    Vue.set(category.accounts[i], 'collapsed', false);
                }
                index++;

                while(index < list.length && list[index].level > category.level) {
                    if (list[index].level - category.level == 1) {
                        Vue.set(list[index], 'invisible', false);
                    }

                    index++;
                }
            }.bind(this));
        },


        collapseAllCOA : function() {
            var list = this.accounts.chartOfAccounts;
            this.accounts.chartOfAccounts.forEach(function(account, index) {
                //if (account.type == 'he1' || account.type == 'he2' || account.type == 'he3') {
                    Vue.set(list[index], 'collapsed', true);
                //}
            }.bind(this));
        },

        expandAllCOA : function() {
            var list = this.accounts.chartOfAccounts;
            this.accounts.chartOfAccounts.forEach(function(account, index) {
                //if (account.type == 'he1' || account.type == 'he2' || account.type == 'he3') {
                    Vue.set(list[index], 'collapsed', false);
                //}
            }.bind(this));
        },


        /**
         * Check if automatic mapping has already occured
         */
        checkMapping : function() {
            var found = false;
            var counter = 0;

            while(!found && counter < this.accounts.map.length) {
                if (this.accounts.map[counter].accounts.length > 0) {
                    found = true;
                }
                counter++;
            }

            if (found) {
                if (this.isPartiallyMapped()) {
                    this.showAutomapPartialModal();
                } else {
                    this.showAutomapSuccessModal();
                }
            } else {
                this.showAutomapFailureModal();
            }
        },



        isPartiallyMapped : function() {
            var partial = false;

            this.accounts.chartOfAccounts.forEach(function(account) {
                if (account.type == 'pal' || account.type == 'bal') {
                    partial = true;
                }
            });

            return partial;
        },



        /**
         * Select or de-select an account
         */
        selectAccount : function(account, index, list, crediMapping, event) {
            let accounts = null;
            if (account.type == 'he1' || account.type == 'he2' || account.type == 'he3') {
                return false;
            }
            if (event.shiftKey) {
                if (!account.selected) {
                    if (!crediMapping) {
                        accounts = this.getAccoutnsSelectItems(account, index, list);
                        let firstSelectedAccount = accounts.filter(element => element.selected === true);
                        let firstAccountIdx = list.findIndex(item => item.id === firstSelectedAccount[0].id);
                        this.selectMultipleAccount(firstAccountIdx, index, list);
                    } else {
                        let firstAccountIdx = list.findIndex(item => item.selected === true);
                        this.selectMultipleAccount(firstAccountIdx, index, list);
                    }
                }
            } else {
                if (!account.selected) {
                    Vue.set(account, 'selected', true);
                } else {
                    Vue.set(account, 'selected', false);
                }
            }
        },

        selectMultipleAccount : function(firstAccountIdx, index, list) {
            let startIdx;
            let endIdx;

            if (firstAccountIdx < index) {
                startIdx = firstAccountIdx;
                endIdx = index;
            } else {
                startIdx = index;
                endIdx = firstAccountIdx;
            }

            for (let i = startIdx; i <= endIdx; i++) {
                if (!list[i].selected || list[startIdx].selected || list[endIdx].selected) {
                    if (list[i].type === 'pal' || list[i].type === 'bal') {
                        Vue.set(list[i], 'selected', true);
                    }
                } else {
                    return false;
                }
            }
        },

        getAccoutnsSelectItems : function(account, index, list) {
            let relevantAccounts = [];
            for (let i = index; i > 0; i--) {
                if(!list[i].totalAccounts) {
                    relevantAccounts.push(list[i]);
                }
            }
            for (let i = index; i > 0; i++) {
                if(!list[i].totalAccounts) {
                    if (list[i].totalAccounts !== 0) {
                        relevantAccounts.push(list[i]);
                    } else {
                        break;
                    }
                }
            };

            return relevantAccounts;
        },

        /**
         * Collapse (or expand) chart of accounts section
         */
        collapseChartSection : function(account, list, index) {
            if (account.type != 'he1' && account.type != 'he2' && account.type != 'he3') {
                return false;
            }

            if (!account.collapsed) {
                do {
                    Vue.set(list[index], 'collapsed', true);
                    index++;
                } while(index < list.length && list[index].type != 'he1' && list[index].type != 'he2' && list[index].type != 'he3');
            } else {
                do {
                    Vue.set(list[index], 'collapsed', false);
                    index++;
                } while(index < list.length && list[index].type != 'he1' && list[index].type != 'he2' && list[index].type != 'he3');
            }
        },

        /**
         * Collapse (or expand) account mapping section
         */
        collapseMapSection : function(category, list, index) {
            if (!category.collapsed) {
                Vue.set(category, 'collapsed', true);
                for (var i = 0; i < category.accounts.length; i++) {
                    Vue.set(category.accounts[i], 'collapsed', true);
                }
                index++;

                while(index < list.length && list[index].level > category.level) {
                    Vue.set(list[index], 'invisible', true);
                    Vue.set(list[index], 'collapsed', true);
                    for (var i = 0; i < list[index].accounts.length; i++) {
                        Vue.set(list[index].accounts[i], 'collapsed', true);
                    }
                    index++;
                }
            } else {
                Vue.set(category, 'collapsed', false);
                for (var i = 0; i < category.accounts.length; i++) {
                    Vue.set(category.accounts[i], 'collapsed', false);
                }
                index++;

                while(index < list.length && list[index].level > category.level) {
                    if (list[index].level - category.level == 1) {
                        Vue.set(list[index], 'invisible', false);
                    }

                    index++;
                }
            }
        },

        /**
         * On Drag start
         */
        dragStart : function(catIndex, accIndex, account, event) {
            this.dragging.catIndex = catIndex;
            this.dragging.accIndex = accIndex;
            Vue.set(account, 'selected', true);

            //Oh Firefox, you're so picky...
            if (BrowserModel.browser.firefox) {
                event.dataTransfer.setData('text/plain', null);
            }
        },

        /**
         * On Drop event
         */
        drop : function(toMapping, event) {
            //...some special instructions just for you.
            if (BrowserModel.browser.firefox) {
                event.preventDefault();
            }

            this.mismatchedAccounts = [];


            //Dragging from chart of accounts to mapping
            if (toMapping) {

                var movedFromAcctToMap = false;

                for (var i = this.accounts.chartOfAccounts.length - 1; i >= 0; i--) {
                    if (this.accounts.chartOfAccounts[i].selected) {
                        if (true || this.accounts.chartOfAccounts[i].type == this.accounts.map[this.dragging.catHover].type) {
                            var movedAccount = this.accounts.chartOfAccounts.splice(i, 1);
                            movedAccount[0].selected = false;
                            this.accounts.map[this.dragging.catHover].accounts.push(movedAccount[0]);
                            //movedFromAcctToMap = true;
                        } else {
                            this.showWrongTypeError();
                            //this.ui.showWrongTypeError = true;
                        }

                        movedFromAcctToMap = true;
                    }
                }


                this.accounts.map[this.dragging.catHover].accounts.sort(function(a, b) {
                    return a.number - b.number;
                });



                //Dragging from mapping to mapping (one category to another)
                if (!movedFromAcctToMap) {
                    for(var i = this.accounts.map[this.dragging.catIndex].accounts.length - 1; i >= 0; i--) {
                        if (this.accounts.map[this.dragging.catIndex].accounts[i].selected) {
                            if (true || this.accounts.map[this.dragging.catIndex].accounts[i].type == this.accounts.map[this.dragging.catHover].type) {
                                var movedAccount = this.accounts.map[this.dragging.catIndex].accounts.splice(i, 1);
                                movedAccount[0].selected = false;
                                this.accounts.map[this.dragging.catHover].accounts.push(movedAccount[0]);
                            } else {
                                this.showWrongTypeError();
                                //this.ui.showWrongTypeError = true;
                            }
                        }
                    }
                }

                var scope = this;
                this.$refs.accountCategories[this.dragging.catHover].classList.add('dropoff-feedback');
                setTimeout(function() {
                    scope.$refs.accountCategories[scope.dragging.catHover].classList.remove('dropoff-feedback');
                }, 500);

            }



            //Dragging from mapping to chart of accounts
            else if (this.dragging.catIndex !== null) {

                for(var i = this.accounts.map[this.dragging.catIndex].accounts.length - 1; i >= 0; i--) {
                    if (this.accounts.map[this.dragging.catIndex].accounts[i].selected) {
                        var movedAccount = this.accounts.map[this.dragging.catIndex].accounts.splice(i, 1);
                        movedAccount[0].selected = false;
                        this.accounts.chartOfAccounts.push(movedAccount[0]);
                    }
                }

                this.accounts.chartOfAccounts.sort(function(a, b) {
                    return a.number - b.number;
                });
            }


            this.dragging.catIndex = null;
            this.dragging.accIndex = null;
            this.dragging.changed = true;
            this.countCOA();
            this.addCategoryValues();
        },

        /**
         * On Drag over
         */
        dragOver : function(ev, className) {
            ev.preventDefault();

            var objPosition = ev.clientY;
            var container = this.$refs.mapping.querySelector('.'+className);
            var isMac = navigator.platform.toUpperCase().indexOf('MAC')>=0;
            var scrollBy = isMac ? 1 : 10;

            if (container.clientHeight - objPosition <= 15) {
                container.scrollTop += scrollBy;
            }

        },

        /**
         * Drag enter
         */
        dragEnter : function(mapIndex, event) {
            if (mapIndex !== null && this.accounts.map[mapIndex].collapsed) {
                this.collapseMapSection(this.accounts.map[mapIndex], this.accounts.map, mapIndex);
            } else {
                for(var i = 0; i < this.accounts.chartOfAccounts.length; i++) {
                    Vue.set(this.accounts.chartOfAccounts[i], 'collapsed', false);
                }
            }


            if (mapIndex !== null) {
                this.dragging.catHover = mapIndex;
            }
        },

        /**
        hasMismatchedAccounts : function() {
            var found = false;

            this.accounts.map.forEach(function(category) {
                category.accounts.forEach(function(account) {
                    if (account.type != category.type) {
                        found = true;
                    }
                });
            });

            return found;
        },
        */

        /**
         * Save Mapping
         */
        saveMapping : function(validate, force) {
            if (validate && this.isPartiallyMapped() && !force) {
                this.showPartialMappingConfirm();
                return false;
            }

            this.ui.partialMappingConfirm = false;

            /**
            if (this.hasMismatchedAccounts()) {
                this.ui.showWrongTypeError = true;
                return false;
            }
            */

            var scope = this;
            var collection = new AccountCollection();
            var accounts = [];

            scope.ui.saving = true;

            for (var i = 0; i < this.accounts.map.length; i++) {
                for (var j = 0; j < this.accounts.map[i].accounts.length; j++) {
                    var id = this.accounts.map[i].accounts[j].id;
                    var ref = this.accounts.map[i].reference;
                    accounts.push({account : {id : id}, kpi : {reference : ref} });
                }
            }

            collection.saveAccounts(accounts)
                .then(function(res) {
                    if (res.success) {
                        ErpModel.fromCompany()
                            .then(function(response) {
                                if (response.id) {
                                    ErpModel.setErp(response);
                                } else {
                                    ErpModel.forgetErp();
                                }


                                if (validate) {
                                    collection.validateAccounts()
                                        .then(function(res) {
                                            if (res.errors && (res.errors.length > 0) && (res.errors[0]?.type != 'MappingAlreadyApproved')) {
                                                Toast.show(scope.ui.dictionary.accounts.notValidated, 'warning')
                                                scope.ui.saving = false;
                                            } else {
                                                scope.dragging.changed = false;
                                                Toast.show(scope.ui.dictionary.accounts.validated);
                                                scope.checkRedirect();
                                                scope.checkConnectionValidationStatus();
                                            }


                                        });
                                } else {
                                    scope.dragging.changed = false;
                                }



                                if (!validate) {
                                    scope.checkRedirect();
                                }
                            });


                    }
                });
        },


        checkConnectionValidationStatus : function() {
            if (!ContextModel.getContext()) {
                return false;
            }

            var connID = ContextModel.getContext().id;
            var connections = JSON.parse(sessionStorage.getItem('connections'));

            if (!connections) {
                return false;
            }

            connections.forEach(function(connection) {
                if (connection.id == connID) {
                    connection.company.erp.currentMappingValidity = true;
                }
            });

            sessionStorage.setItem('connections', JSON.stringify(connections));
        },

        checkRedirect : function() {
            if (this.redirectUrl) {
                this.$router.push(this.redirectUrl);
            } else if (this.$route.query.init) {
                this.$router.push('/account/updating');
            } else {
                this.$router.push('/account/overview/generaloverview');
            }
        },


        redirectToUpdating : function() {
            this.$router.push('/account/updating');
        },


        /**
         * Get image of drag arrow
         */
        getArrow : function() {
            return new AssetModel('/assets/img/elements/drag-arrow.png').path;
        },

        /**
         * Go to the next route
         */
        gotoNextRoute : function() {
            this.dragging.changed = false;
            if (this.ui.nextRoute && this.ui.nextRoute.path && this.ui.nextRoute.path !== null && this.ui.nextRoute.path != 'null') {
                this.$router.push(this.ui.nextRoute.path);
                //this.$router.push('/' + this.ui.nextRoute.path);
            } else {
                Raven.captureMessage('Failed to detect next route when leaving mapping view (after confirmation dialog)');
            }
        },

        showLeaveConfirm() {
            this.$modal.show('dialog', {
                text: this.ui.dictionary.accounts.leave,
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.accounts.declineLeave,
                        class: 'highlighted-text',
                    },
                    {
                        title: this.ui.dictionary.accounts.confirmLeave,
                        class: 'warning',
                        default: true,
                        handler: () => { this.gotoNextRoute(); this.$modal.hide('dialog')}
                    }
                ]
            });
        },

        showWrongTypeError() {
            this.$modal.show('dialog', {
                text: this.ui.dictionary.accounts.wrongTypeError,
                width: 600,
                buttons: [
                    {
                        title: this.ui.dictionary.general.ok,
                        class: 'primary',
                    }
                ]
            });
        },

        showPartialMappingConfirm() {
            this.$modal.show(partialMappingConfirmModal, {
                saveMapping: this.saveMapping
            }, {height: 'auto'});
        },

        showAutomapSuccessModal() {
            this.$modal.show(showAutomapSuccess, {redirectToUpdating: this.redirectToUpdating}, {height: 'auto'});
        },

        showAutomapPartialModal() {
            this.$modal.show(showAutomapPartial, {redirectToUpdating: this.redirectToUpdating}, {height: 'auto'});
        },

        showAutomapFailureModal() {
            this.$modal.show(showAutomapFailure, {redirectToUpdating: this.redirectToUpdating}, {height: 'auto'});
        }
    };

    const computed = {
      hasEntryRole() {
        return (
          this.profile?.roles
            && (this.profile.roles.indexOf('entry_role') >= 0)
        )
      },

      hasMismatchedAccounts () {
        let found = false;
        this.accounts.map.forEach(function(category) {
          category.accounts.forEach(function(account) {
            if (!found && (account.type != category.type)) {
              found = true;
            }
          });
        });

       return found;
      },

      hasNewAccounts () {
        let found = false;
        this.accounts.map.forEach(function(category) {
          category.accounts.forEach(function (account) {
            if (!found && ((account.type == 'pal') || (account.type == 'bal'))) {
              if (account.validated === false) {
                found = true;
              }
            }
          });
        });
        this.accounts.chartOfAccounts.forEach(function(account) {
          if (!found && (account.type == 'pal' || account.type == 'bal')) {
            if (account.validated === false) {
              found = true;
            }
          }
        });
        return found;
      },

      mappingValidator () {
        return (
          this.profile?.roles
            && (
              (this.profile.roles.indexOf('mapping_validator') >= 0)
                || (this.profile.roles.indexOf('third_party_mapping_validator') >= 0)
            )
        )
      },
      mappingCurrentlyValidated() {
        const erp = this.erpObject
        return erp?.currentMappingValidity
      },
      mappingPreviouslyValidated() {
        const erp = this.erpObject
        return !this.mappingCurrentlyValidated && erp?.previouslyValidated
      },
      mappingNeverValidated() {
        return !this.mappingCurrentlyValidated && !this.mappingPreviouslyValidated
      },
      showValidationStatus() {
        return (
          this.erpObject
            && !this.mappingNeverValidated
            && (
              this.mappingCurrentlyValidated
                || (
                  this.mappingPreviouslyValidated
                    && this.profile?.roles?.indexOf
                    && (this.profile.roles.indexOf('mapping_validator') >= 0)
                )
            )
        )
      }
    };

    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        components : {
            'financial-years' : financialYears
        },
        props : ['automapCheck', 'redirectUrl', 'forceSave'],
        created : function() {
            //this.init();
        },
        computed,
        mounted : function() {
            this.init();
            this.checkErp();
        },
        beforeDestroy : function() {
            clearInterval(this.erp.check);
            EventBus.$off('companyErpChanged');
        },
        beforeRouteLeave : function(to, from, next) {
            if (this.dragging && this.dragging.changed) {
                this.ui.nextRoute = to;
                this.showLeaveConfirm();
                next(false);
            } else if (to.path == '/account/connections/all?r=1' ||
                       to.path == '/account/connections/portfolio' ||
                       to.path == '/account/connections/all' ||
                       to.path == '/account/connections/portfolio?r=1' ||
                       to.path == '/account/summary') {
                EventBus.$emit('clearConnectionContext');
                next();
            } else {
                next();
            }
        }
    });
});
