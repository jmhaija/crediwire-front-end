/*global $*/

define([

    'Vue',
    'moment',
    'models/DictionaryModel',
    'models/DateRangeModel',
    'models/ErpModel',
    'models/BudgetModel',
    'services/EventBus',
    'directives/click-outside-closable'

], function(Vue, moment, DictionaryModel, DateRangeModel, ErpModel, BudgetModel, EventBus, clickOutsideClosable) {
    /**
     * Element template
     */
    const template = `
        <article ref="datepicker" class="datepicker-container">
           <div class="finYearsSelector"  ref="finYearsSelector" v-show="financialYears && financialYears.length > 0">
               <i class="cwi-period" :class="{ active : ui.showFinYears }" v-on:click.stop="toggleFinYears()"></i>
               <div class="ranges" v-show="ui.showFinYears" v-clickOutsideClosable="{ exclude: ['finYearsSelector'],  handler: 'closeFinYears' }">
                   <ul>
                       <li v-for="range in filterFinancialYears(financialYears)" v-on:click="setFinYearRange(range)"><i class="cwi-calendar"></i> {{formatRange(range.start)}} - {{formatRange(range.end)}}</li>
                   </ul>
               </div>
           </div>
           <span v-if="currentRange" style="vertical-align: top; margin-top: 3px; display: inline-block;">{{formatRange(currentRange.start)}} - {{formatRange(currentRange.end)}}</span>
        </article>
    `;

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
            financialYears : ErpModel.getErp().financialYears || [],
            currentRange : null
        };
    };


    /**
     * Methods
     */
    var methods = {
        init : function() {
            EventBus.$on('companyErpChanged', this.checkDateRange);
            EventBus.$on('clickAppBody', this.closeAllOptions);
            document.addEventListener('clickAppBody', this.closeAllOptions);
            this.checkDateRange();
        },

        toggleFinYears : function() {
            if (this.ui.showFinYears) {
                this.closeAllOptions();
            } else {
                this.openFinYears();
            }
        },

        openFinYears : function() {
            this.ui.showFinYears = true;
        },

        closeFinYears : function() {
            this.ui.showFinYears = false;
        },

        checkDateRange : function() {
            this.financialYears =  ErpModel.getErp() && ErpModel.getErp().financialYears ? ErpModel.getErp().financialYears : [];

            if (this.financialYears.length > 0) {
                var found = this.financialYears[this.financialYears.length - 1];
                var latestYear = moment(ErpModel.getErp().latestDate);

                this.financialYears.forEach(function(finYear) {
                    var start = moment(finYear.start);
                    var end = moment(finYear.end);

                    if (latestYear.unix() >= start.unix() && latestYear.unix() <= end.unix()) {
                        found = finYear;
                    }
                }.bind(this));

                this.currentRange = found;
                this.onDateChange(this.currentRange);
            }
        },

        closeAllOptions : function() {
            this.ui.showFinYears = false;
            this.ui.showPresetOptions = false;
        },

        filterFinancialYears : function(financialYears) {
            return financialYears.filter(function(range) {
                if (moment.utc(range.start).unix() > moment().unix()) {
                    return false;
                }

                return true;
            }, this);
        },

        setFinYearRange : function(range) {
            this.currentRange = range;
            this.onDateChange(this.currentRange);
            this.closeFinYears();
        },

        formatRange : function(string) {
            var date = moment.utc(string);
            return date.format(this.ui.dictionary.locale.displayFormat);
        }
    };


    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        props : ['onDateChange'],
        mounted : function() {
            this.init();
        },
        beforeDestroy : function() {
            EventBus.$off('companyErpChanged');
            EventBus.$off('clickAppBody');
            document.removeEventListener('clickAppBody', this.closeAllOptions);
        },
        directives: {
        clickOutsideClosable
    }
    });
});
