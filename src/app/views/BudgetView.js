/* global saveAs */

import Vue from 'Vue'
import FileSaver from 'FileSaver'
import moment from 'moment'
import DictionaryModel from 'models/DictionaryModel'
import ErpModel from 'models/ErpModel'
import DateRangeModel from 'models/DateRangeModel'
import AssetModel from 'models/AssetModel'
import UserModel from 'models/UserModel'
import BalanceDataCollection from 'collections/BalanceDataCollection'
import datePicker from 'elements/date-picker'
import tutorialSlide from 'elements/tutorial-slide'
import validLedger from 'elements/valid-ledger'
import financialReport from 'elements/financial-report.vue'
import PersistentSettings from 'services/PersistentSettings'
import EventBus from 'services/EventBus'
import NumberFormatter from 'services/NumberFormatter'
import Tutorial from 'services/Tutorial'
import Toast from 'services/Toast'
import LedgerEntryCollection from 'collections/LedgerEntryCollection'
import LedgerView from 'views/LedgerView'
import lineChart from 'elements/line-chart'
import switchWithLabels from 'elements/switch-with-labels'
import intervalsSelector from 'elements/dropdown/intervals-selector'
import ManageBudgetView from 'views/ManageBudgetView'
import BudgetListCollection from 'collections/BudgetListCollection'
import intervalOptions from 'constants/ui/intervals'
import dashboardMutationTypes from 'store/dashboardMutationTypes'
import tutorialStaticData from 'config/tutorial-static-data'

const template = `
        <article ref="balancesheet" class="manage-dashboards manage-kpis">

           <section>

               <div class="graph-bar">
                   <switch-with-labels v-if="!isUnderPresentation && !isUnderEditPresentation" v-model="ui.manage" :firstValue="false" :secondValue="true" v-show="!presets && !preview">
                       <span slot="label-left" :class="[!ui.manage ? 'primary-color' : 'faded']">{{ui.dictionary.budget.view}}</span>
                       <span slot="label-right" :class="[ui.manage ? 'primary-color' : 'faded']">{{ui.dictionary.budget.manage}}</span>
                   </switch-with-labels>
                   <date-picker v-show="!ui.manage" :onDateChange="showBudgetData"></date-picker>
               </div>

                <financial-report v-show="!ui.manage" :presetFromDate="budgetFromDate" :presetToDate="budgetToDate" :isBudget="true" :presentationInfoFlag="presentationInfoFlag" :processReportPageInfo="function(budgetData) {processReportPageInfo(budgetData)}"></financial-report>

           </section>

           <section v-show="ui.manage">
               <manage-budget :viewBudgetStatusChange="changeBudgetViewStatus" :showBudgetData="showBudgetData"></manage-budget>
           </section>

        </article>
    `;
const { MONTH } = intervalOptions;

const data = () => ({
    ui: {
        dictionary: DictionaryModel.getHash(),
        loading: true,
        noErp: false,
        noData: false,
        showTable: false,
        stickHeader: false,
        showIntervalOptions: false,
        exportOptions: false,
        showLedger: false,
        section: 'table',
        noTimeData: true,
        manage: false,
        showTemplateOptions: false,
        showBudgetView: true
    },
    cashbook: false,
    budget: true,
    table: {},
    hideList: [],
    totalGroups: 0,
    useH3: false,
    intervalOptions: [intervalOptions.WEEK, intervalOptions.MONTH, intervalOptions.QUARTER, intervalOptions.HALF_YEAR, intervalOptions.YEAR],
    budgetFromDate: moment(DateRangeModel.getFromDate()).format('YYYY-MM-DD'),
    budgetToDate: moment(DateRangeModel.getToDate()).format('YYYY-MM-DD'),
    balance: PersistentSettings.getItem('palbal-balance') || 'change', //or 'to_date'
    compare: PersistentSettings.getItem('palbal-compare') || 'end_year_total', //or end_year_to_date
    tutorial: Tutorial,
    scrolledDown: false,
    scrolledRight: false,
    profile: {},
    ledgerAccount: null,
    simple: true,
    isNoBudgetView: false
});


const methods = {
    init() {
        if (this.preview) {
            this.budget = true;
        }

        EventBus.$on('click', this.closeAllOptions);
        EventBus.$on('companyErpChanged', this.loadData);
        document.addEventListener('clickAppBody', this.closeAllOptions);
        this.checkPresets();
        this.getBudgetList();
        this.isNoBudgetView = false;
        EventBus.$on('showManageBudget', res => {
            if (res) {
                this.ui.manage = true;
                this.isNoBudgetView = true;
            }
        });
        EventBus.$on('finishedUploadBudget', res => {
            res ? this.isNoBudgetView = false : '';
        })
    },


    changeBudgetViewStatus: function (val) {
        this.ui.showBudgetView = val;
    },

    showBudgetData: function (date_from = DateRangeModel.getFromStringPadded(), date_to = DateRangeModel.getToStringPadded()) {
        if (!this.isNoBudgetView) {
            this.ui.manage = false;
        }
        this.budgetFromDate = this.getPrevYearBudgetDate ? this.getPrevYearBudgetDate[0] : date_from;
        this.budgetToDate = this.getPrevYearBudgetDate ? this.getPrevYearBudgetDate[1] : date_to;
        this.loadData();
        this.isNoBudgetView = false;
    },

    getBudgetList: function () {
        this.ui.loading = true;

        BudgetListCollection.getBudgetList()
            .then(res => {
                const list = res?._embedded?.items
                if (list?.length) {
                    let found = false;
                    let simpleTotal = 0;
                    let advancedTotal = 0;

                    list.filter(function (budget) {
                        if (!budget.deleted) {
                            found = true;

                            if (budget.template && budget.template == 'simple') {
                                simpleTotal++;
                            } else if (budget.template && budget.template == 'advanced') {
                                advancedTotal++;
                            }
                        }
                    });

                    if (advancedTotal > simpleTotal) {
                        this.simple = false;
                    }

                    if (found) {
                        this.loadData();
                    } else {
                        this.ui.manage = true;
                    }
                } else {
                    this.ui.manage = true;
                }

                this.ui.loading = false;
            });
    },

    showDownloadTrialBalanceTutorial: function () {
        return this.tutorial.current && (this.tutorial.current.name == 'downloadTrialBalance' || this.tutorial.current.name == 'trialBalance') && !this.tutorial.state.loading && !this.tutorial.state.finished;
    },

    exportToExcel: function () {
        var scope = this;
        var dc = new BalanceDataCollection();

        dc.getExcelData(MONTH, this.cashbook, this.balance, this.compare)
            .then(function (data) {
                if (!data) {
                    Toast.show(scope.ui.dictionary.palbal.export.error, 'warning');
                    return false;
                }
                var blob = new Blob([data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
                FileSaver.saveAs(blob, scope.ui.dictionary.palbal.export.budgetFileName + '.xlsx');
            });

        this.closeAllOptions();
    },

    checkPresets: function () {

    },

    getImage: function (img) {
        return new AssetModel(img).path;
    },

    changeCashbook: function (currValue) {
        this.cashbook = !currValue;
        this.loadData();
    },


    closeAllOptions: function () {
        this.ui.showIntervalOptions = false;
        this.ui.exportOptions = false;
    },

    loadData: function () {
        //TODO: Clear it up
        if (this.tutorial.state.started && !this.tutorial.state.finished) {
            this.format(tutorialStaticData);
            return false;
        }

        if (!ErpModel.getErp()) {
            this.ui.noErp = true;
            this.ui.loading = false;
            return false;
        }


        var scope = this;
        this.ui.showTable = false;
        scope.ui.loading = true;
        scope.ui.noData = false;
        scope.ui.section = 'table';
        scope.profile = UserModel.profile();
    }
};

const computed = {
    isBudgetUpdate() {
        return this.$store.getters.isUpdateBudget;
    },
    isUnderEditPresentation() {
        return this.$store.getters.presentationEditMode;
    },
    isUnderPresentation() {
        return this.$store.getters.presentationMode;
    },

    getPrevYearBudgetDate() {
        return this.$store.getters.budgetPreviousYear;
    }
};


export default Vue.extend({
    template,
    data,
    computed,
    methods: methods,
    props: ['presets', 'presetInterval', 'presetCashbook', 'presetBalance', 'presetCompare', 'preview', 'presetFromDate', 'presetToDate', 'presentationInfoFlag', 'processReportPageInfo'],
    components: {
        'date-picker': datePicker,
        'tutorial-slide': tutorialSlide,
        'valid-ledger': validLedger,
        'ledger-view': LedgerView,
        'line-chart': lineChart,
        'manage-budget': ManageBudgetView,
        'switch-with-labels': switchWithLabels,
        'intervals-selector': intervalsSelector,
        'financial-report': financialReport
    },
    created: function () {
        this.init();
    },
    beforeDestroy: function () {
        window.onscroll = null;
        EventBus.$off('click');
        document.removeEventListener('clickAppBody', this.closeAllOptions);
        EventBus.$off('companyErpChanged');
        EventBus.$off('showManageBudget');
        EventBus.$off('finishedUploadBudget');
    },
    watch: {
        balance: function (val) {
            PersistentSettings.setItem('palbal-balance', val);
        },
        compare: function (val) {
            PersistentSettings.setItem('palbal-compare', val);
        },
        budget: function (val) {
            this.format(this.rawData);
        },
        'ui.manage': function (val) {
            if (this.isUnderEditPresentation || this.isUnderPresentation) {
                this.ui.manage = false;
            }
        }
    }
});
