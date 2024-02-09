/*global $*/

define([

    'Vue',
    'moment',
    'models/DictionaryModel',
    'models/DateRangeModel',
    'models/ErpModel',
    'models/BudgetModel',
    'services/EventBus',
    'store/dashboardMutationTypes',
    'directives/click-outside-closable'

], function(Vue, moment, DictionaryModel, DateRangeModel, ErpModel, BudgetModel, EventBus, dashboardMutationTypes, clickOutsideClosable) {
    /**
     * Element template
     */
    var template = [
        '<article ref="datepicker" class="datepicker-container">',
        '   <div class="finYearsSelector" v-show="financialYears && financialYears.length > 0 && !hideFinancialYears">',
        '       <i class="cwi-period" :class="{ active : ui.showFinYears }" v-on:click.stop="toggleFinYears()"></i>',
        '       <div class="ranges" v-show="ui.showFinYears" v-clickOutsideClosable="{ exclude: [\'datepicker\'],  handler: \'closeAllOptions\' }">',
        '           <ul>',
        '               <li v-for="range in filterFinancialYears(financialYears)" v-on:click="setFinYearRange(range)"><i class="cwi-calendar"></i> {{formatRange(range.start)}} - {{formatRange(range.end)}}</li>',
        '           </ul>',
        '       </div>',
        '   </div>',
        '   <div v-on:click="setCustomRange(\'dp-root-from\')" class="onoff-selector date-picker"><i class="cwi-calendar"></i><input type="text" id="dp-root-from" readonly="readonly"></div>',
        '   <div class="onoff-selector dp-input"><input data-test-id="dataFrom" type="text" v-model="date.from" v-on:keyup="validate($event, \'from\')" :class="{ invalid : !valid.from }"></div>',
        '   <div class="onoff-selector dp-input dp-input-arrow">&#8594;</div>',
        '   <div v-on:click="setCustomRange(\'dp-root-to\')" class="onoff-selector date-picker"><i class="cwi-calendar"></i><input type="text" id="dp-root-to" readonly="readonly"></div>',
        '   <div class="onoff-selector dp-input"><input data-test-id="dataTo" type="text" v-model="date.to" v-on:keyup="validate($event, \'to\')" :class="{ invalid : !valid.to }"></div>',
        '   <div class="onoff-selector dp-input"><button data-test-id="go" class="primary" v-on:click="go()">{{ui.dictionary.general.go}}</button></div>',
        '</article>'
    ].join('');

    /**
     * Data bindings
     */
    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                showFinYears : false,
                selectedPeriod : 'semiannual',
                showPresetOptions : false
            },
            date : {
                from : null,
                to : null
            },
            period : 'semiannual',
            valid : {
                from : true,
                to : true
            },
            financialYears : []
        };
    };


    /**
     * Methods
     */
    var methods = {
        init : function() {
            this.renderDatepicker();
            this.checkDateRange();
            if (this.isUnderPresentation) {
                this.setPresentationDatePeriod();
            }

            EventBus.$on('callDatePicker', res => {
                res ? this.setLastYearForBudget() : '';
            })

            EventBus.$on('companyErpChanged', this.checkDateRange);
            EventBus.$on('clickAppBody', this.closeAllOptions);
            EventBus.$on('uiLanguageChanged', this.languageListener);
            document.addEventListener('clickAppBody', this.closeAllOptions);
        },

        filterFinancialYears : function(financialYears) {
            return financialYears.filter(function(range) {
                if (moment.utc(range.start).unix() > moment().unix()) {
                    return false;
                }

                return true;
            }, this);
        },

        formatRange : function(string) {
            var date = moment.utc(string);
            return date.format(this.ui.dictionary.locale.displayFormat);
        },

        setFinYearRange : function(range) {
            let from = moment.utc(range.start).toDate();
            let to = moment.utc(range.end).toDate();

            this.$store.dispatch('setDateFrom',  moment(from).format(this.ui.dictionary.locale.displayFormat));
            this.$store.dispatch('setDateTo', moment(to).format(this.ui.dictionary.locale.displayFormat));
            //Do not go beyond today
            if (moment.utc(range.end).unix() > moment().unix()) {
                to = moment().toDate();
            }

            DateRangeModel.setFromDate(from);
            DateRangeModel.setToDate(to);

            this.setTextFields();
            this.go();
            this.closeAllOptions();
        },

        toggleFinYears : function() {
            if (this.ui.showFinYears) {
                this.closeAllOptions();
            } else {
                this.openFinYears();
            }
        },

        closeAllOptions : function() {
            this.ui.showFinYears = false;
            this.ui.showPresetOptions = false;
        },

        openFinYears : function() {
            this.ui.showFinYears = true;
        },

        renderDatepicker : function() {
            var scope = this;

            $(this.$refs.datepicker.querySelector('#dp-root-from')).datepicker({
                language : this.ui.dictionary.locale,
                autoClose : true,
                onSelect : function(fd, d, picker) {
                    if (d) {
                        var from = new Date(d);
                        DateRangeModel.setFromDate(from);
                        scope.setTextFields();
                    }

                }
            });

            $(this.$refs.datepicker.querySelector('#dp-root-to')).datepicker({
                language : this.ui.dictionary.locale,
                autoClose : true,
                onSelect : function(fd, d, picker) {
                    if (d) {
                        var to = new Date(d);
                        DateRangeModel.setToDate(to);
                        scope.setTextFields();
                    }
                }
            });
        },


        checkDateRange : function() {
            var now = new Date();
            now.setHours(0,0,0,0);

            var sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, now.getDate() + 1);
            var oneYearAgo = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate() + 1);

            if (DateRangeModel.getFromDate().getTime() == sixMonthsAgo.getTime() && DateRangeModel.getToDate().getTime() == now.getTime()) {
                this.period = 'semiannual';
            } else if (DateRangeModel.getFromDate().getTime() == oneYearAgo.getTime() && DateRangeModel.getToDate().getTime() == now.getTime()) {
                this.period = 'annual';
            } else {
                this.period = 'custom';
            }

            this.setTextFields();

            this.financialYears =  ErpModel.getErp() && ErpModel.getErp().financialYears ? ErpModel.getErp().financialYears : [];
        },

        setPresentationDatePeriod : function() {
            let resPresentation = JSON.parse(this.getReportPresentation);
            let currentFormat = this.ui.dictionary.locale.displayFormat;
            if (resPresentation.start_date) {
                this.date.from = moment(resPresentation.start_date).format(currentFormat);
            }

            if (resPresentation.end_date) {
                this.date.to = moment(resPresentation.end_date).format(currentFormat);
            }
        },


        checkTextFields : function() {
            var now = new Date();
            now.setHours(0,0,0,0);

            var sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, now.getDate() + 1);
            var oneYearAgo = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate() + 1);

            var fromDate = moment(this.date.from, this.ui.dictionary.locale.displayFormat).toDate();
            fromDate.setHours(0,0,0,0);
            var toDate = moment(this.date.to, this.ui.dictionary.locale.displayFormat).toDate();
            toDate.setHours(0,0,0,0);

            if (fromDate.getTime() == sixMonthsAgo.getTime() && toDate.getTime() == now.getTime()) {
                this.period = 'semiannual';
            } else if (fromDate.getTime() == oneYearAgo.getTime() && toDate.getTime() == now.getTime()) {
                this.period = 'annual';
            } else {
                this.period = 'custom';
            }
        },


        validate : function(event, typingIn) {
            var now = moment();
            var fromDate = moment(this.date.from, this.ui.dictionary.locale.displayFormat);
            var toDate = moment(this.date.to, this.ui.dictionary.locale.displayFormat);
            var maxDateStamp = now.unix();
            var erpData = ErpModel.getErp();

            if (erpData && erpData.dateLimits && erpData.dateLimits.budgetMaxDate) {
                var budgetStamp = moment(erpData.dateLimits.budgetMaxDate).unix();

                if (budgetStamp > maxDateStamp) {
                    maxDateStamp = budgetStamp;
                }
            } else if (BudgetModel.getLastBudgetDate()) {
                var budgetDate = BudgetModel.getLastBudgetDate();
                var budgetStamp = moment(budgetDate).unix();

                if (budgetStamp > maxDateStamp) {
                    maxDateStamp = budgetStamp;
                }
            }


            this.valid.from = true;
            this.valid.to = true;

            //37, 38, 39, 40 -- arrow keys, do nothing
            //8 is backspace -- do nothing
            //46 is delete key -- do nothing
            if (event && event.keyCode && (event.keyCode == 8 || event.keyCode == 46 || event.keyCode == 37 || event.keyCode == 38 || event.keyCode == 39 || event.keyCode == 40)) {
                return true;
            }


            //Only allow numeric characters
            var validkeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
            if (event && event.keyCode && validkeys.indexOf(event.key) < 0 && event.keyCode != 13) {
                var regex = new RegExp('[^0-9\\' + this.ui.dictionary.meta.dateSeparator + ']', 'g');
                this.date[typingIn] =  this.date[typingIn].replace(regex,'');
                return false;
            }


            if (this.date.from.length < this.ui.dictionary.locale.displayFormat.length
                && typingIn == 'from'
                ) {

                this.autoCompleteField('from');

            } else if ( !fromDate.isValid()
                 || this.date.from.length !== this.ui.dictionary.locale.displayFormat.length
                 || fromDate.unix() > toDate.unix()
                 || this.date.from[2] != this.ui.dictionary.meta.dateSeparator
                 || this.date.from[5] != this.ui.dictionary.meta.dateSeparator
                ) {

                this.valid.from = false;
            } else {
                this.valid.from = true;
            }


            if (this.date.to.length < this.ui.dictionary.locale.displayFormat.length
                && typingIn == 'to'
                ) {

                this.autoCompleteField('to');

            } else if ( !toDate.isValid()
                 || this.date.to.length !== this.ui.dictionary.locale.displayFormat.length
                 || this.date.to[2] != this.ui.dictionary.meta.dateSeparator
                 || this.date.to[5] != this.ui.dictionary.meta.dateSeparator
                ) {

                this.valid.to = false;
            } else {
                this.valid.to = true;
            }


            this.checkTextFields();

            if (event && event.keyCode == 13) {
                this.go();
                return true;
            }

            return this.valid.from && this.valid.to;
        },


        autoCompleteField : function(field) {
            var splitString = this.date[field].split(this.ui.dictionary.meta.dateSeparator);

            if (!this.valid[field] || splitString.length > 2  ) {
                return false;
            }

            if (this.date[field].length > 2 && this.date[field].indexOf(this.ui.dictionary.meta.dateSeparator) != 2 && this.date[field].indexOf(this.ui.dictionary.meta.dateSeparator) != 1) {
                this.date[field] = [this.date[field].slice(0, 2), this.ui.dictionary.meta.dateSeparator, this.date[field].slice(2)].join('');
            }

            if (this.date[field].length > 5 && this.date[field].lastIndexOf(this.ui.dictionary.meta.dateSeparator) != 5 && this.date[field].lastIndexOf(this.ui.dictionary.meta.dateSeparator) != 4) {
                this.date[field] = [this.date[field].slice(0, 5), this.ui.dictionary.meta.dateSeparator, this.date[field].slice(5)].join('');
            }


            if (this.date[field].length == 2 || (this.date[field].length == 5 && this.date[field].indexOf(this.ui.dictionary.meta.dateSeparator) == 2)) {
                this.date[field] += this.ui.dictionary.meta.dateSeparator;
            }
        },


        go : function() {
            if (!this.validate()) {
                return false;
            }

            var fromDate = moment(this.date.from, this.ui.dictionary.locale.displayFormat).toDate();
            var toDate = moment(this.date.to, this.ui.dictionary.locale.displayFormat).toDate();

            this.$store.dispatch('setDateFrom',  moment(fromDate).format(this.ui.dictionary.locale.displayFormat));
            this.$store.dispatch('setDateTo', moment(toDate).format(this.ui.dictionary.locale.displayFormat));
            DateRangeModel.setFromDate(fromDate);
            DateRangeModel.setToDate(toDate);

            this.onDateChange();
        },


        setRange : function(range) {
            this.period = range;
            this.ui.selectedPeriod = range;

            var toDate = new Date();
            DateRangeModel.setToDate(toDate);

            var to = DateRangeModel.getToDate();
            var from = DateRangeModel.getFromDate();

            if (range == 'semiannual') {
                from = new Date(to.getFullYear(), to.getMonth() - 5, to.getDate() + 1);
            } else if (range == 'annual') {
                from = new Date(to.getFullYear(), to.getMonth() - 12, to.getDate() + 1);
            }

            DateRangeModel.setFromDate(from);

            this.closeAllOptions();
            this.setTextFields();
            this.go();
        },


        setCustomRange : function(id) {
            var scope = this;
            this.period = 'custom';

            setTimeout(function() {
                var dp = $(scope.$refs.datepicker.querySelector('#'+id)).data('datepicker');
                dp.show();
            }, 100);
        },


        setTextFields : function() {
            this.date.from = moment(DateRangeModel.getFromDate()).format(this.ui.dictionary.locale.displayFormat);
            this.date.to = moment(DateRangeModel.getToDate()).format(this.ui.dictionary.locale.displayFormat);
            this.$store.dispatch('setDateFrom', this.date.from);
            this.$store.dispatch('setDateTo', this.date.to);
            this.valid.from = true;
            this.valid.to = true;
        },

        setLastYearForBudget() {
            if(this.getPrevYearBudgetDate) {
                this.date.from = moment(this.getPrevYearBudgetDate[0]).format(this.ui.dictionary.locale.displayFormat);
                this.date.to = moment(this.getPrevYearBudgetDate[1]).format(this.ui.dictionary.locale.displayFormat);
            }
        },

        languageListener() {
            this.ui.dictionary = DictionaryModel.getHash();
            this.setTextFields();
        }
    };

    const computed = {
        isUnderEditPresentation() {
            return this.$store.getters.presentationEditMode;
        },

        getReportPresentation() {
            return this.$store.getters.reportPresentation;
        },
        getPrevYearBudgetDate() {
            return this.$store.getters.budgetPreviousYear;
        }
    };


    return Vue.extend({
        template : template,
        data : bindings,
        methods,
        computed,
        props : ['onDateChange', 'hideFinancialYears'],
        mounted : function() {
            this.init();
        },
        beforeDestroy : function() {
            EventBus.$off('companyErpChanged');
            EventBus.$off('clickAppBody');
            EventBus.$off('uiLanguageChanged', this.languageListener);
            document.removeEventListener('clickAppBody', this.closeAllOptions);
        },
        directives: {
            clickOutsideClosable
        }
    });
});
