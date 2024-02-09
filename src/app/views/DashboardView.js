/*global $*/

    import Vue from 'Vue'
    import datepicker from 'datepicker'
    import q from 'q'
    import DictionaryModel from 'models/DictionaryModel'
    import datePointer from 'config/date-pointer'
    import dataDashboard from 'config/data-dashboard'
    import ErpModel from 'models/ErpModel'
    import AssetModel from 'models/AssetModel'
    import DateRangeModel from 'models/DateRangeModel'
    import UserModel from 'models/UserModel'
    import ContextModel from 'models/ContextModel'
    import CompanyModel from 'models/CompanyModel'
    import BudgetFileModel from 'models/BudgetFileModel'
    import DrilldownDataCollection from 'collections/DrilldownDataCollection'
    import lineChart from 'elements/line-chart'
    import kpiGrid from 'elements/kpi-grid'
    import datePicker from 'elements/date-picker'
    import tutorialSlide from 'elements/tutorial-slide'
    import validLedger from 'elements/valid-ledger'
    import switchWithLabels from 'elements/switch-with-labels'
    import intervalsSelector from 'elements/dropdown/intervals-selector'
    import DataCollection from 'collections/DataCollection'
    import PersistentSettings from 'services/PersistentSettings'
    import EventBus from 'services/EventBus'
    import Tutorial from 'services/Tutorial'
    import cashbookStates from 'constants/ui/cashbook'
    import intervalOptions from 'constants/ui/intervals'
    import dashboardMutationTypes from 'store/dashboardMutationTypes'
    import entryDepartments from 'elements/entry-departments'
    import entryDepartmentsModel from 'models/EntryDepartmentModel'

    const template = `
        <article ref="dasharea">
           <section v-show="ui.loading">
               <div class="working"></div>
           </section>

           <section v-show="!ui.loading && ui.showPresentationPlaceholder">
               Presentation Dashboard Placeholder
           </section>

<!--            /**-->
<!--             * Graph display section-->
<!--             */-->
           <section v-show="!ui.loading">
               <div v-show="ui.noKpis">
                   <p>{{ui.dictionary.overview.noKpis}}</p>
               </div>
               <div v-show="ui.noErp" class="splash">
                   <h1>{{ui.dictionary.overview.splash.noErpTitle}}</h1>
                   <p>{{ui.dictionary.overview.splash.noErp}}</p>
                   <button class="primary" v-on:click="gotoCompanySettings()" v-show="permissions.owner || permissions.permissionType == 'full'">{{ui.dictionary.overview.splash.connectErp}}</button>
               </div>
               <div v-show="ui.forbidden">
                   <p>{{ui.dictionary.general.forbidden}}</p>
               </div>

               <div v-show="ui.showGraphs">

<!--                    /**-->
<!--                     * Graph bar with Timeline-KPIs switch and series dropdowns-->
<!--                     */-->
                   <div class="graph-bar" v-show="!presets && !presentation">
                       <div class="right">


                           <div class="selector small fade" :class="{ hidden : ui.hidden }" v-show="ui.section == 'timeline'">
                               <label>{{ui.dictionary.overview.seriesGraph}}</label>
                               <div data-test-id="graphOptions" class="label" v-on:click.stop="ui.showSeriesGraphOptions = true">
                                   <span>{{ui.dictionary.overview[graphType]}}</span> <i class="cwi-down"></i>
                                   <div class="options" v-bind:class="{ show : ui.showSeriesGraphOptions }">
                                       <div data-test-id="lineTypes" class="option" v-bind:class="{ selected : graphType == 'line' }" v-on:click.stop="changeGraphType('line')">
                                           {{ui.dictionary.overview.line}}
                                       </div>
                                       <div data-test-id="barTypes" class="option" v-bind:class="{ selected : graphType == 'bar' }" v-on:click.stop="changeGraphType('column')">
                                           {{ui.dictionary.overview.column}}
                                       </div>
                                   </div>
                               </div>
                           </div>

                           <div class="selector small fade" :class="{ hidden : ui.hidden }" v-show="ui.section == 'timeline'">
                               <label>{{ui.dictionary.overview.series}}</label>
                               <div data-test-id="typeDescription" class="label" v-on:click.stop="ui.showSeriesOptions = true">
                                   <span>{{type}}</span> <i class="cwi-down"></i>
                                   <div class="options" v-bind:class="{ show : ui.showSeriesOptions }">
                                       <div data-test-id="optionType" class="option" v-for="t in types" v-bind:class="{ selected : t == type }" v-on:click.stop="changeType(t)">
                                           <span>
                                               {{t}}
                                               <i class="cwi-info tiny" v-show="t == '%'" :title="ui.dictionary.overview.typeDescriptions.percent"></i>
                                               <i class="cwi-info tiny" v-show="t == 'x'" :title="ui.dictionary.overview.typeDescriptions.ratio"></i>
                                               <i class="cwi-info tiny" v-show="t == ui.dictionary.meta.currency" :title="ui.dictionary.overview.typeDescriptions.currency"></i>
                                           </span>
                                       </div>
                                   </div>
                               </div>
                           </div>

                           <intervals-selector :getLoader="getLoader" :intervalOptions="intervalOptions" :class="{ hidden : ui.hidden }" v-show="ui.section == 'timeline'"/>

                           <div class="selector small fade" :class="{ hidden : ui.hidden }" v-show="ui.section == 'timeline'">
                               <label>{{ui.dictionary.overview.validLedger}}</label>
                               <valid-ledger></valid-ledger>
                           </div>

                            <div v-show="entryDepartmentsEnabled" class="context-container">
                             <entry-departments @getDepartmentId="getSelectedDepartment" :selectedDepartmentId="selectedDepartmentId"></entry-departments>
                            </div>



                       <v-popover :open="showEasyViewTutorial()" placement="right" offset="-150">
                           <div data-test-id="toggleCashbook" class="onoff-selector" :class="{ active : isCashbookActive}" v-show="ui.section == 'kpis'" v-on:click="toggleCashbook()"><i class="cwi-cashbook"></i> {{ui.dictionary.overview.cashbook}} <i class="cwi-info tiny" :title="ui.dictionary.overview.cashbookDescription" v-show="easyview"></i></div>
                           <div data-test-id="toggleEasyView" class="onoff-selector" :class="{ active : setEasyView }" v-show="ui.section == 'kpis'" v-on:click="toggleEasyView()"><i class="cwi-easyview"></i> &nbsp; {{ui.dictionary.overview.easyview}}</div>
                           <div data-test-id="toggleBudget" v-show="ui.section == 'kpis' && profile.roles" class="onoff-selector" :class="{ active : budget }" v-on:click="budget = !budget; toggleBudget()"><i class="cwi-budget"></i> &nbsp; {{ui.dictionary.overview.budget}}</div>

                           <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>
                       </v-popover>

                       </div>

                   <div class="flex-row">

                       <v-popover :open="showKpiSwitchTutorial()" placement="right">
                           <switch-with-labels v-model="ui.section" :firstValue="'timeline'" :secondValue="'kpis'">
                               <span data-test-id="selectTimeline" slot="label-left" :class="[ui.section !== 'kpis' ? 'primary-color' : 'faded']">{{ui.dictionary.overview.timeline}}</span>
                               <span data-test-id="selectKpi" slot="label-right" :class="[ui.section === 'kpis' ? 'primary-color' : 'faded']">{{ui.dictionary.overview.kpis}}</span>
                           </switch-with-labels>
                           <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>
                       </v-popover>

                       <span style="display: inline-block; margin-left: 3rem;"></span>

                       <switch-with-labels v-model="ui.reclassified" :firstValue="false" :secondValue="true" v-show="hasReclassRole">
                           <span slot="label-left" :class="[!ui.reclassified ? 'primary-color' : 'faded']">{{ui.dictionary.overview.notReclassified}}</span>
                           <span slot="label-right" :class="[ui.reclassified ? 'primary-color' : 'faded']">{{ui.dictionary.overview.reclassified}}</span>
                       </switch-with-labels>

                       </div>
                   </div>


<!--                    /**-->
<!--                     * Graph bar with datepicker and prev/avg switches-->
<!--                     */-->
                   <div class="graph-bar secondary" v-show="!presets && !presentation">

                       <div class="right" v-show="ui.section == 'timeline' && !ui.showGraphOptions">
                           <div data-test-id="showGraphOptions" class="graph-options-summary clickable" v-on:click="ui.showGraphOptions = true">
                               <div class="open-icon tooltip"><i class="cwi-properties"></i> <div class="message left right-arrow-tooltip">{{ui.dictionary.overview.options}}</div></div>
                           </div>
                       </div>

                       <div class="graph-options" v-show="ui.section == 'kpis' && getDashboardId && !isEasyView">
                           <div data-test-id="lastYear" class="onoff-selector" :class="{ active : isPreviousActive }" v-on:click="togglePrevious()"><span v-show="previousType == 'period'">{{ui.dictionary.kpis.previous}}</span><span v-show="previousType == 'year'">{{ui.dictionary.kpis.lastYear}}</span></div>
                           <div class="selector inline">
                               <div class="label" v-on:click.stop="ui.showPreviousOptions = true">
                                   <i class="cwi-down"></i>
                                   <div class="options" v-bind:class="{ show : ui.showPreviousOptions }">
                                       <div class="option" v-bind:class="{ selected : previousType == 'period' }" v-on:click.stop="changePrevType('period')">{{ui.dictionary.kpis.previous}}</div>
                                       <div class="option" v-bind:class="{ selected : previousType == 'year' }" v-on:click.stop="changePrevType('year')">{{ui.dictionary.kpis.lastYear}}</div>
                                   </div>
                               </div>
                           </div>
                       </div>

                   <v-popover :open="showGraphOptionsTutorial()" placement="bottom-end" offset="40" class="blocker" popoverClass="under-industry">
                       <div class="graph-options" v-show="ui.section == 'timeline' && ui.showGraphOptions">

                           <div data-test-id="budgetOn" v-show="profile.roles && (!context || !budgetFile)" class="onoff-selector" :class="{ active : isBudgetOn }" v-on:click="budget = !budget; toggleBudget()"><small style="display: inline-block; vertical-align: middle; margin-top: -9px;">&#161;</small> {{ui.dictionary.overview.budget}}</div>



                           <div v-show="profile.roles && context && budgetFile" class="onoff-selector" :class="{ active : isBudgetOn }" v-on:click="budget = !budget; toggleBudget()"><small style="display: inline-block; vertical-align: middle; margin-top: -9px;">&#161;</small> <span v-show="budgetType == 'company'">{{ui.dictionary.budget.defaultVersion}}</span><span v-show="budgetType == 'file'">{{ui.dictionary.budget.loadedVersion}}</span></div>
                           <div class="selector inline" v-show="profile.roles && context && budgetFile">
                               <div class="label" v-on:click.stop="ui.showBudgetOptions = true">
                                   <i class="cwi-down"></i>
                                   <div class="options" v-bind:class="{ show : ui.showBudgetOptions }" style="left: -210px;">
                                       <div class="option" v-bind:class="{ selected : budgetType == 'company' }" v-on:click.stop="changeBudgetType('company')">{{ui.dictionary.budget.companyBudgetVersion}}</div>
                                       <div class="option" v-bind:class="{ selected : budgetType == 'file' }" v-on:click.stop="changeBudgetType('file')">{{ui.dictionary.budget.loadedVersion}}</div>
                                   </div>
                               </div>
                           </div>


                           <div data-test-id="cashbookActive" class="onoff-selector" :class="{ active : isCashbookActive }" v-on:click="toggleCashbook()"><small>&#8942;</small> {{ui.dictionary.overview.cashbook}} <span v-show="isCashbookOnly">({{ui.dictionary.overview.only}})</span></div>
                           <div class="selector inline">
                               <div data-test-id="showCashbookOptions" class="label" v-on:click.stop="ui.showCashbookOptions = true">
                                   <i class="cwi-down"></i>
                                   <div class="options" v-bind:class="{ show : ui.showCashbookOptions }">
                                       <div data-test-id="cashbook" class="option" v-bind:class="{ selected : !isCashbookOnly }" v-on:click.stop="setCashbookState(cashbookStates.CASHBOOK)">{{ui.dictionary.overview.cashbook}}</div>
                                       <div data-test-id="cashbookOnly" class="option" v-bind:class="{ selected : isCashbookOnly }" v-on:click.stop="setCashbookState(cashbookStates.ONLY_CASHBOOK)">{{ui.dictionary.overview.cashbookOnly}}</div>
                                   </div>
                               </div>
                           </div>

                           <div data-test-id="previous" class="onoff-selector" :class="{ active : isPreviousActive }" v-on:click="changePrevType('year'); togglePrevious()"><small>&#9479;</small> <span>{{ui.dictionary.kpis.lastYear}}</span></div>

                           <div data-test-id="average" class="onoff-selector" :class="{ active : isAverageOn }" v-on:click="toggleAverage()"><small>&#58;</small> {{ui.dictionary.overview.average}}</div>

                           <div data-test-id="floatingAverage" class="onoff-selector" :class="{ active : isFloatingAvgOn }" v-on:click="toggleFloatingAvg()">{{ui.dictionary.kpis.floatingAverages}}</div>
                           <div class="selector inline">
                               <div class="label" v-on:click.stop="ui.showFAOptions = true">
                                   <i class="cwi-down"></i>
                                   <div class="options" v-bind:class="{ show : ui.showFAOptions }">
                                       <h5>{{ui.dictionary.kpis.spread}}</h5>
                                       <input type="number" v-model="faPointSpread" min="1" max="50"><button class="primary" v-on:click.stop="changeSpread()">{{ui.dictionary.general.go}}</button>
                                   </div>
                               </div>
                           </div>

                           <div class="onoff-selector clickable open-icon" v-on:click="ui.showGraphOptions = false"><i class="cwi-close primary-color"></i></div>

                           <div class="disclaimer" v-show="isAverageOn"><i class="cwi-info"></i> {{ui.dictionary.overview.benchmarkDisclaimer}}</div>
                           <div class="disclaimer" :class="{ padded : isAverageOn }" v-show="budget && budgetFile && budgetFile.status != 'completed'"><i class="cwi-info"></i> {{ui.dictionary.budget.stillUpdating}}</div>
                           <div class="disclaimer" :class="{ padded : isAverageOn || budget }" v-show="isCashbookActive && !data[selectedInterval].hasCB"><i class="cwi-info"></i> {{ui.dictionary.overview.cashbookDisclaimer}}</div>
                       </div>

                       <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>
                   </v-popover>

<!--                        /**-->
<!--                         * Daterange pickers-->
<!--                         */-->
                       <v-popover :open="showDaterangeTutorial()" placement="right">
                           <date-picker :onDateChange="loadData"></date-picker>
                           <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>
                       </v-popover>

                   </div>


<!--                    /**-->
<!--                     * Line chart-->
<!--                     */-->
                   <div :class="{hideLineChart : isDrillDownView || isKpisView}">
                       <div v-show="isTimeline" class="fade" :class="{ hidden : ui.hidden }">
                           <line-chart @chartRendered="chartRendered = true" :drillDownCallback="drilldown" :static="presets" :staticSeries="staticSeries" :percentMultiply="dash && dash.id == '_general'" :chart="data" :init="!currentIntervalLoading() || isTutorial" :reinit="!ui.daysLoading && !ui.weeksLoading && !ui.monthsLoading && !ui.quartersLoading && !ui.halfyearsLoading && !ui.yearsLoading" :interval="selectedInterval" :cashbook="ui.cashbook" :types="types" :type="type" :average="chartAverageState" :previous="isPreviousActive" :previousType="previousType" :budget="chartBudgetState" :floatingAverage="chartFloatingAvgState" :pointSpread="floatingAvgPointsSpread" :doRefresh="refresh" :dashID="dash.id" :cashbookOnly="cashbookOnly" :graphType="graphType" :chartInfoFlag="chartInfoFlag" :processChartInfo="processChartInfo" :presetStaticType="staticType" :triggerDrilldown="triggerDrilldown"></line-chart>
                       </div>
                   </div>

                   <div :class="{hideLineChart : isTimeline || isKpisView}">
                       <div v-show="isDrillDownView" class="fade" :class="{ hidden : ui.hidden }">
                           <line-chart @chartRendered="chartRendered = true" :drilldownName="drilldownData.seriesName" :isDrilldown="true" :closeDrilldownCallback="closeDrilldown" :static="presets" :staticSeries="staticSeries" :percentMultiply="dash && dash.id == '_general'" :chart="drilldownData.data[drilldownData.seriesID]" :init="drilldownData.ready" :reinit="!ui.daysLoading && !ui.weeksLoading && !ui.monthsLoading && !ui.quartersLoading && !ui.halfyearsLoading && !ui.yearsLoading" :interval="selectedInterval" :cashbook="ui.cashbook" :types="types" :type="type" :average="chartAverageState" :previous="isPreviousActive" :previousType="previousType" :budget="chartBudgetState" :floatingAverage="chartFloatingAvgState" :pointSpread="floatingAvgPointsSpread" :doRefresh="refresh" :dashID="dash.id" :cashbookOnly="cashbookOnly" :graphType="graphType" :chartInfoFlag="chartInfoFlag" :processChartInfo="processChartInfo" :presetStaticType="staticType"></line-chart>
                       </div>
                   </div>

                   <div v-show="ui.section == 'timeline' && currentIntervalLoading() && !drilldownData.isDrillDown" class="working"></div>


<!--                    /**-->
<!--                     * KPIs section-->
<!--                     */-->

                   <div :class="{hideLineChart : isDrillDownView || isTimeline}">
                       <div class="kpi-container fade" v-show="isKpisView" :class="{ hidden : ui.hidden }">
                       <div class="working" v-show="!ui.showKpiGrid"></div>
                           <div v-show="ui.showKpiGrid">
                               <kpi-grid :rawdata="raw" :kpis="dash.dashboardKpis" :easyview="easyview" :dashId="dash.id" :cashbook="ui.cashbook" :readyCallback="gridReady" :budget="isBudgetOn" :presentation="presentation"></kpi-grid>
                           </div>
                       </div>
                   </div>
               </div>


           </section>
        </article>
    `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            loading: true,
            showGraphs : false,
            noKpis : false,
            noErp : false,
            section : PersistentSettings.getItem('dash-section') || 'timeline',

            daysLoading : true,
            weeksLoading : true,
            monthsLoading : true,
            quartersLoading : true,
            halfyearsLoading : true,
            yearsLoading : true,

            interval : PersistentSettings.getItem('dash-interval') || 'month',
            cashbook : false,

            showIntervalOptions : false,
            showSeriesOptions : false,
            showDataOptions : false,
            showPreviousOptions : false,
            showFAOptions : false,
            showBudgetOptions : false,

            forbidden : false,

            showGraphOptions : false,
            showGraphOptionsTutorial : false,
            hidden : false,
            showKpiGrid : false,
            showCashbookOptions : false,
            showSeriesGraphOptions : false,
            showPresentationPlaceholder : false,
            reclassified : true
        },
        seriesDefinition : {},
        seriesDefinitionMap: {},
        types : [],
        type : null,
        data : {
            day : {},
            week : {},
            month : {},
            quarter : {},
            'half-year' : {},
            year : {}
        },
        raw : {},
        intervalOptions: [intervalOptions.DAY, intervalOptions.WEEK, intervalOptions.MONTH, intervalOptions.QUARTER, intervalOptions.HALF_YEAR, intervalOptions.YEAR],
        previous : false,
        budget : PersistentSettings.getItem('dash-budget') || false,
        period : 'semiannual',
        easyview : false,
        floatingAvg : PersistentSettings.getItem('dash-floatingAvg') || false,
        faPointSpread : 3,
        pointSpreadProp : 3,
        refresh : 0,
        company : CompanyModel.getCompany(),
        context : ContextModel.getContext(),
        permissions : ContextModel.getContext() || UserModel.getCompanyUserInfo(),
        presetKpis : [
            { id : '_revenue', name : 'revenue' },
            { id : '_contributionMargin', name : 'contributionMargin' },
            { id : '_fixedCostsSub', name : 'fixedCosts' },
            { id : '_profit', name : 'profit' },
            { id : '_exIncomeExpense', name : 'exIncomeExpense' },

            { id : '_contributionMarginRatio', name : 'contributionMarginRatio' },
            { id : '_profitMargin', name : 'profitMargin' },
            { id : '_overheadMargin', name : 'overheadMargin' },
            { id : '_debtToAssetRatio', name : 'debtToAssetRatio' },
            { id : '_exIncomeExpense', name : 'exIncomeExpenseMargin' },

            { id : '_currentRatio', name : 'currentRatio' },
            { id : '_quickRatio', name : 'quickRatio' },
            { id : '_assetTurnover', name : 'assetTurnover' },
            { id : '_inventoryTurnover', name : 'inventoryTurnover' }
        ],
        chartRendered: false,
        drilldownData : {
            deferred : null,
            isDrillDown : false,
            ready : false,
            seriesName : null,
            seriesID : null,
            data : {},
            seriesObject : null
        },
        isTutorial : false,
        tutorial : Tutorial,
        profile : {},
        cashbookOnly : false,
        budgetFile : BudgetFileModel.getBudgetFile(),
        budgetType : 'file',
        graphType : 'line',
        chartInfoFlag : 0,
        staticSeries : null,
        staticType : null,
        triggerDrilldown : false,
        staticCurrency: null,
        erp : ErpModel.getErp(),
        cashbookStates,
        selectedDepartmentId: null
    });

    const methods = {
        init() {
            EventBus.$on('click', this.closeAllOptions);
            document.addEventListener('clickAppBody', this.closeAllOptions);
            EventBus.$on('showGraphOptionsTutorial', function() {
                this.ui.showGraphOptions = true;
                this.ui.showGraphOptionsTutorial = true;
            }.bind(this));

            this.ui.reclassified = !!(this.erp && this.erp.reclassifiedData && this.hasReclassRole());

            this.checkPresets();

            if (this.presentationData) {
                this.loadPresentationData(this.presentationData);
            } else {
                this.loadData();
            }

            this.$store.dispatch('setKpis', this.ui.section === 'kpis');
        },

        hasReclassRole() {
            return true;
            //return this.profile && this.profile.roles && this.profile.roles.indexOf('reclassification_role') >= 0;
        },

        changeGraphType(type) {
            this.graphType = type;
            this.closeAllOptions();
        },

        showGraphOptionsTutorial() {
            if (this.tutorial.current && this.tutorial.current.name == 'lineGraphOptions' && !this.tutorial.state.loading && !this.tutorial.state.finished) {
                this.ui.showGraphOptions = true;
                this.ui.section = 'timeline';
                this.ui.showKpiGrid = false;
                return true;
            }

            return false;
        },

        showKpiSwitchTutorial() {
            if (this.tutorial.current && this.tutorial.current.name == 'kpiSwitch' && !this.tutorial.state.loading && !this.tutorial.state.finished) {
                this.ui.section = 'kpis';
                this.ui.showKpiGrid = true;
                this.$store.dispatch('setEasyView', false);
                return true;
            }

            return false;
        },

        showEasyViewTutorial() {
            if (this.tutorial.current && this.tutorial.current.name == 'easyview' && !this.tutorial.state.loading && !this.tutorial.state.finished) {
                this.$store.dispatch('setEasyView', false);
                return true;
            }

            return false;
        },

        showDaterangeTutorial() {
            if (this.tutorial.current && this.tutorial.current.name == 'dateRange' && !this.tutorial.state.loading && !this.tutorial.state.finished) {
                this.ui.section = 'timeline';
                this.ui.showKpiGrid = false;
                return true;
            }

            return false;
        },

        closeDrilldown(clearCache, doNotAnimate) {
            var scope = this;

            this.drilldownData.isDrillDown = false;
            this.drilldownData.ready = false;
            this.drilldownData.seriesName = null;
            this.drilldownData.seriesID = null;
            this.drilldownData.seriesObject = null;

            if (clearCache) {
                this.drilldownData.data = {};
            }

            if (!doNotAnimate) {
                scope.ui.hidden = true;
                setTimeout(function() {
                    scope.ui.hidden = false;
                }, 100);
            }

            this.refresh++;
        },


        switchToDrilldown() {
            if (!this.drilldownData.isDrillDown) {
                return false;
            }

            var scope = this;

            scope.drilldownData.deferred.resolve(true);
            scope.drilldownData.ready = true;
            scope.ui.hidden = true;
            setTimeout(function() {
                scope.ui.hidden = false;
            }, 100);

            this.refresh++;
        },

        myDrillDown(kpiID, interval) {
            const scope = this;
            if (kpiID) {

                if (interval == 'year') {

                    scope.ui.yearsLoading = true;
                    var ddcYear= new DrilldownDataCollection(kpiID, 'year', this.type, this.ui.reclassified);
                    ddcYear.getData(this.previousType)
                        .then(function(data) {
                            if (!data) {
                                scope.ui.showGraphs = false;
                                scope.ui.loading = false;
                                return false;
                            }

                            scope.data.year = data.year;
                            scope.ui.yearsLoading = false;
                            scope.ui.showGraphs = true;
                            scope.ui.loading = false;
                            scope.setDefaultType();
                        });


                } else if (interval == 'half-year') {
                    scope.ui.halfyearsLoading = true;
                    var ddcHalfyear= new DrilldownDataCollection(kpiID, 'half-year', this.type, this.ui.reclassified);
                    ddcHalfyear.getData(this.previousType)
                        .then(function(data) {
                            if (!data) {
                                scope.ui.showGraphs = false;
                                scope.ui.loading = false;
                                return false;
                            }

                            scope.data['half-year'] = data['half-year'];
                            scope.ui.halfyearsLoading = false;
                            scope.ui.showGraphs = true;
                            scope.ui.loading = false;
                            scope.setDefaultType();
                        });
                } else if (interval == 'quarter') {

                    scope.ui.quartersLoading = true;
                    var ddcQuarter= new DrilldownDataCollection(kpiID, 'quarter', this.type, this.ui.reclassified);
                    ddcQuarter.getData(this.previousType)
                        .then(function(data) {
                            if (!data) {
                                scope.ui.showGraphs = false;
                                scope.ui.loading = false;
                                return false;
                            }

                            scope.data.quarter = data.quarter;
                            scope.ui.quartersLoading = false;
                            scope.ui.showGraphs = true;
                            scope.ui.loading = false;
                            scope.setDefaultType();
                        });

                } else if (interval == 'month') {
                    var ddcMonth = new DrilldownDataCollection(kpiID, 'month', this.type, this.ui.reclassified);
                    ddcMonth.getData(this.previousType)
                        .then(function(data) {
                            if (!data) {
                                scope.ui.showGraphs = false;
                                scope.ui.loading = false;
                                return false;
                            }

                            scope.data.month = data.month;
                            scope.ui.monthsLoading = false;
                            scope.ui.showGraphs = true;
                            scope.ui.loading = false;
                            scope.setDefaultType();
                        });

                } else if (interval == 'week') {

                    scope.ui.weeksLoading = true;
                    var ddcWeek= new DrilldownDataCollection(kpiID, 'week', this.type, this.ui.reclassified);
                    ddcWeek.getData(this.previousType)
                        .then(function(data) {
                            if (!data) {
                                scope.ui.showGraphs = false;
                                scope.ui.loading = false;
                                return false;
                            }

                            scope.data.week = data.week;
                            scope.ui.weeksLoading = false;
                            scope.ui.showGraphs = true;
                            scope.ui.loading = false;
                            scope.setDefaultType();
                        });

                } else if (interval == 'day') {
                    scope.ui.daysLoading = true;
                    var ddcDays= new DrilldownDataCollection(kpiID, 'day', this.type, this.ui.reclassified);
                    ddcDays.getData(this.previousType)
                        .then(function(data) {
                            if (!data) {
                                scope.ui.showGraphs = false;
                                scope.ui.loading = false;
                                return false;
                            }

                            scope.data.day = data.day;
                            scope.ui.daysLoading = false;
                            scope.ui.showGraphs = true;
                            scope.ui.loading = false;
                            scope.setDefaultType();
                        });
                }

            } else {
                this.drilldownData.deferred.reject('No KPI ID');
            }

            return this.drilldownData.deferred.promise;
        },

        drilldown(series, force) {
            this.drilldownData.seriesObject = series;
            var scope = this;
            var kpiID = this.getKpiId(series);

            this.drilldownData.deferred = q.defer();

            if (kpiID) {
                this.drilldownData.seriesID = kpiID;
                this.drilldownData.seriesName = series.name;
                this.drilldownData.isDrillDown = true;
                scope.drilldownData.ready = false;

                if (this.drilldownData.data[kpiID] && !force) {
                    this.switchToDrilldown();
                    return this.drilldownData.deferred.promise;
                }


                this.drilldownData.data[kpiID] = {
                    day : {},
                    week : {},
                    month : {},
                    quarter : {},
                    'half-year' : {},
                    year : {}
                };


                scope.ui.monthsLoading = true;
                var ddcMonth = new DrilldownDataCollection(kpiID, 'month', this.type, this.ui.reclassified);
                ddcMonth.getData(this.previousType)
                    .then(function(res) {
                        if (res) {
                            scope.drilldownData.data[kpiID].month = res.month;
                            scope.ui.monthsLoading = false;

                            if (scope.selectedInterval == 'month') {
                                scope.switchToDrilldown();
                            }

                        } else {
                            scope.drilldownData.deferred.reject('Could not retrieve data');
                        }
                    });


                scope.ui.weeksLoading = true;
                var ddcWeek= new DrilldownDataCollection(kpiID, 'week', this.type, this.ui.reclassified);
                ddcWeek.getData(this.previousType)
                    .then(function(res) {
                        if (res) {
                            scope.drilldownData.data[kpiID].week = res.week;
                            scope.ui.weeksLoading = false;

                            if (scope.selectedInterval == 'week') {
                                scope.switchToDrilldown();
                            }
                        } else {
                            scope.drilldownData.deferred.reject('Could not retrieve data');
                        }
                    });


                scope.ui.quartersLoading = true;
                var ddcQuarter= new DrilldownDataCollection(kpiID, 'quarter', this.type, this.ui.reclassified);
                ddcQuarter.getData(this.previousType)
                    .then(function(res) {
                        if (res) {
                            scope.drilldownData.data[kpiID].quarter = res.quarter;
                            //scope.drilldownData.ready = true;
                            scope.ui.quartersLoading = false;

                            if (scope.selectedInterval == 'quarter') {
                                scope.switchToDrilldown();
                            }
                        } else {
                            scope.drilldownData.deferred.reject('Could not retrieve data');
                        }
                    });


                scope.ui.halfyearsLoading = true;
                var ddcHalfyear= new DrilldownDataCollection(kpiID, 'half-year', this.type, this.ui.reclassified);
                ddcHalfyear.getData(this.previousType)
                    .then(function(res) {
                        if (res) {
                            scope.drilldownData.data[kpiID]['half-year'] = res['half-year'];
                            //scope.drilldownData.ready = true;
                            scope.ui.halfyearsLoading = false;

                            if (scope.selectedInterval == 'half-year') {
                                scope.switchToDrilldown();
                            }
                        } else {
                            scope.drilldownData.deferred.reject('Could not retrieve data');
                        }
                    });


                scope.ui.yearsLoading = true;
                var ddcYear= new DrilldownDataCollection(kpiID, 'year', this.type, this.ui.reclassified);
                ddcYear.getData(this.previousType)
                    .then(function(res) {
                        if (res) {
                            scope.drilldownData.data[kpiID].year = res.year;
                            //scope.drilldownData.ready = true;
                            scope.ui.yearsLoading = false;

                            if (scope.selectedInterval == 'year') {
                                scope.switchToDrilldown();
                            }
                        } else {
                            scope.drilldownData.deferred.reject('Could not retrieve data');
                        }
                    });


                scope.ui.daysLoading = true;
                var ddcDays= new DrilldownDataCollection(kpiID, 'day', this.type, this.ui.reclassified);
                ddcDays.getData(this.previousType)
                    .then(function(res) {
                        if (res) {
                            scope.drilldownData.data[kpiID].day = res.day;
                            //scope.drilldownData.ready = true;
                            scope.ui.daysLoading = false;

                            if (scope.selectedInterval == 'day') {
                                scope.switchToDrilldown();
                            }
                        } else {
                            scope.drilldownData.deferred.reject('Could not retrieve data');
                        }
                    });


            } else {
                this.drilldownData.deferred.reject('No KPI ID');
            }

            return this.drilldownData.deferred.promise;
        },

        getKpiId(series) {
            if (this.dash.id == '_general') {
                return this.getPresetKpiId(series);
            }

            var found = null;

            this.dash.dashboardKpis.forEach(function(dashKpi) {
                if (dashKpi.kpi.name == series.name) {
                    found = dashKpi.kpi.id;
                }
            });

            return found;
        },


        getPresetKpiId(series) {
            var scope = this;
            var found = null;
            this.ui.dictionary = DictionaryModel.getHash();
            this.presetKpis.forEach(function(preset) {
                if (scope.ui.dictionary.kpis[preset.name] == series.name || scope.ui.dictionary.systemKpis[preset.name] == series.name || preset.name == series.name) {
                    found = preset.id;
                }
            });

            return found;
        },


        gridReady() {
            this.ui.showKpiGrid = true;
        },

        checkPresets() {
            this.$store.dispatch('setDashboardAverage', !!this.presetAverage);

            if (this.presetSection) {
                this.ui.section = this.presetSection;
            }

            if (this.presetInterval) {
                this.$store.dispatch('setInterval', this.presetInterval)
            }

            if (this.presetCashbook) {
                this.ui.cashbook = this.presetCashbook;
                const { CASHBOOK, CASHBOOK_DISABLED } = cashbookStates;

                this.$store.dispatch('setDashboardCashbook', this.presetCashbook === 'both'? CASHBOOK : CASHBOOK_DISABLED);
            } else {
                this.ui.cashbook = false;
                const { CASHBOOK_DISABLED } = cashbookStates;

                this.$store.dispatch('setDashboardCashbook', CASHBOOK_DISABLED);
            }

            if (this.presetPrevious) {
                this.$store.dispatch('setPreviousState', true);
                this.$store.dispatch('setPreviousType', this.presetPrevious)
            } else {
                this.$store.dispatch('setPreviousState', false);
            }

            if (this.presetEasyview) {
                this.easyview = this.presetEasyview;
            }

            {
                let floatingAverageIsOn = !!this.presetSpread;

                this.$store.dispatch('setFloatingAverage', floatingAverageIsOn);

                this.$store.dispatch('setFloatingAveragePointSpread', floatingAverageIsOn ? this.presetSpread : null);
                this.faPointSpread = this.presetSpread || 0;
            }

            if (this.presetType) {
                this.type = this.presetType;
                this.staticType = this.presetType;
            }

            if (this.presetGraphType) {
                this.graphType = this.presetGraphType;
            }

            if (this.presetSeries && this.presetSeries.length > 0) {
                this.staticSeries = this.presetSeries;
            }

            this.budget = this.presetBudget;
            this.$store.dispatch('setBudget', !!this.presetBudget);

            if (this.presetCurrency) {
                this.staticCurrency = this.presetCurrency;
            }

            if (this.presetReclassified) {
                this.ui.reclassified = this.presetReclassified;
            }
        },

        currentIntervalLoading() {
            if (this.drilldownData.isDrillDown) {
                return false;
            }

            var key = this.selectedInterval.replace('half-year', 'halfyear') + 'sLoading';
            return this.ui[key];
        },


        /**
         * Load data
         */
        loadData(e) {
            if (this.tutorial.state.started && !this.tutorial.state.finished) {
                this.raw = dataDashboard;
                this.data = datePointer;

                this.types = ["DKK", "%", "x"];
                this.type = '%';
                this.ui.showGraphs = true;
                this.ui.loading = false;
                this.isTutorial = true;

                this.ui.daysLoading = true;
                this.ui.weeksLoading = true;
                this.ui.monthsLoading = true;
                this.ui.quartersLoading = true;
                this.ui. halfyearsLoading = true;
                this.ui.yearsLoading = true;

                this.ui.daysLoading = false;
                this.ui.weeksLoading = false;
                this.ui.monthsLoading = false;
                this.ui.quartersLoading = false;
                this.ui. halfyearsLoading = false;
                this.ui.yearsLoading = false;

                this.$store.dispatch('setDashboardAverage', true);

                setTimeout(function() {
                    this.type = 'DKK';
                    this.ui.refresh++;
                }.bind(this), 1);

                return false;
            }

            if (!ErpModel.getErp() || ErpModel.getErp() == 'forbidden') {
                this.ui.noErp = true;
                this.ui.loading = false;
                return false;
            }

            if (ErpModel.getErp() == 'loading') {
                setTimeout(() => this.loadData(), 1000)
                return false;
            }

            this.permissions = ContextModel.getContext() || UserModel.getCompanyUserInfo();
            this.profile = UserModel.profile();

            this.ui.noErp = false;
            var dashboard = this.dash;

            if (!this.dash) {
                return false;
            }

            var scope = this;

            //Get drilldown going if we're in drilldown mode
            if (this.drilldownData.isDrillDown) {
                this.drilldown(this.drilldownData.seriesObject, true);
            }

            //Reset all variables
            //this.closeDrilldown(true);
            this.ui.noKpis = false;
            this.ui.loading = true;
            this.types = [];
            this.seriesDefinition = {};
            this.seriesDefinitionMap = {};
            this.ui.showKpiGrid = false;


            this.dash.dashboardKpis.forEach(function(dashboardKpi, index) {
                var label = dashboardKpi.kpi.unit.type == 'currency' && ErpModel.getErp().currency ? ErpModel.getErp().currency : dashboardKpi.kpi.unit.label;

                if (!this.seriesDefinition[label]) {
                    this.seriesDefinition[label] = [];
                }
                if (!this.seriesDefinitionMap[label]) {
                    this.seriesDefinitionMap[label] = {};
                }

                this.seriesDefinition[label].push(dashboardKpi.kpi.name);
                this.seriesDefinitionMap[label][dashboardKpi.kpi.name] = this.dash.id == '_general'
                    ? dashboardKpi.kpi.name : dashboardKpi.kpi.id;


                if (this.types.indexOf(label) < 0) {
                    this.types.push(label);
                }
            }, this);


            //There aren't any KPIs for this dashboard
            if (this.types.length === 0) {
                this.ui.noKpis = true;
                this.ui.loading = false;
                this.ui.showGraphs = false;
                return false;
            }


            //Track current dash
            var currDash = this.dash.id;
            scope.ui.forbidden = false;

            if (this.presetDrilldown) {
                this.triggerDrilldown = this.presetDrilldown;
                this.myDrillDown(this.presetDrilldown, this.selectedInterval, dashboard, currDash);
            } else {
                //Get data
                if (this.getPresentationPageInfo?.entry_department_reference && this.isShowPreview) {
                    entryDepartmentsModel.setEntryDepartment({ name: '', id:  this.getPresentationPageInfo?.entry_department_reference});
                }
                this.loadCurrentInterval(this.selectedInterval, dashboard, currDash)
                    .then(() => {});
            }





        },

        loadPresentationData(data) {
            this.ui.noErp = false;
            var dashboard = this.dash;
            this.ui.noKpis = false;
            this.ui.loading = true;
            this.types = [];
            this.seriesDefinition = {};
            this.ui.showKpiGrid = false;

            this.dash.dashboardKpis.forEach(function(dashboardKpi, index) {
                var defaultCurrency = ErpModel.getErp().currency ? ErpModel.getErp().currency : this.staticCurrency;
                var label = dashboardKpi.kpi.unit.type == 'currency' && defaultCurrency ? defaultCurrency : dashboardKpi.kpi.unit.label;

                if (!this.seriesDefinition[label]) {
                    this.seriesDefinition[label] = [];
                }

                this.seriesDefinition[label].push(dashboardKpi.kpi.name);

                if (this.types.indexOf(label) < 0) {
                    this.types.push(label);
                }
            }, this);

            this.ui.forbidden = false;

            var dataCollection = new DataCollection(this.presetInterval, this.seriesDefinition);
            var drilldownDataCollection = new DrilldownDataCollection(this.presetDrilldown, this.presetInterval, 'DKK');
            if (this.presetDrilldown) {
                var formattedData = drilldownDataCollection.formatExistingData(data, this.presetFromDate, this.presetToDate);
                /**
                this.drilldownData.data = {};
                this.drilldownData.data[this.presetDrilldown] = formattedData;
                this.drilldownData.seriesID = this.presetDrilldown;
                this.drilldownData.seriesName = this.presetDrilldown;
                */
            } else {
                var formattedData = dataCollection.formatExistingData(data, this.presetFromDate, this.presetToDate);
            }

            this.raw = data;

            var loadingString = this.presetInterval + 'sLoading';
            this.data[this.presetInterval] = formattedData[this.presetInterval];
            this.ui[loadingString] = false;
            this.ui.showGraphs = true;
            this.ui.loading = false;
            this.setDefaultType();


            this.ui.daysLoading = true;
            this.ui.weeksLoading = true;
            this.ui.monthsLoading = true;
            this.ui.quartersLoading = true;
            this.ui. halfyearsLoading = true;
            this.ui.yearsLoading = true;

            this.ui.daysLoading = false;
            this.ui.weeksLoading = false;
            this.ui.monthsLoading = false;
            this.ui.quartersLoading = false;
            this.ui. halfyearsLoading = false;
            this.ui.yearsLoading = false;
            this.static = true;


            setTimeout(function() {
                this.ui.refresh++;

                this.ui.section = this.presetSection;

                /**
                if (this.presetDrilldown) {
                    this.drilldownData.isDrillDown = true;
                    this.drilldownData.ready = true;
                }
                */
            }.bind(this), 1);
        },

        loadPresentationDrilldownData : function () {},

        loadCurrentInterval(interval, dashboard, currDash) {
            if (interval == 'year') {
                return this.getYearData(dashboard, currDash, true);
            } else if (interval == 'half-year') {
                return this.getHalfyearData(dashboard, currDash, true);
            } else if (interval == 'quarter') {
                return this.getQuarterData(dashboard, currDash, true);
            } else if (interval == 'month') {
                return this.getMonthData(dashboard, currDash, true);
            } else if (interval == 'week') {
                return this.getWeekData(dashboard, currDash, true);
            } else if (interval == 'day') {
                return this.getDayData(dashboard, currDash, true);
            }
        },

        getYearData(dashboard, currDash, includeAggregations) {
            var scope = this;

            this.ui.yearsLoading = true;
            var years = new DataCollection('year', this.seriesDefinition);
            return years.getData(dashboard.id, includeAggregations, this.previousType, this.budgetType, this.presetFromDate, this.presetToDate, this.ui.reclassified)
                .then(function(data) {
                    if (!data) {
                        scope.ui.showGraphs = false;
                        scope.ui.loading = false;
                        return false;
                    }

                    if (currDash == scope.dash.id) {
                        scope.data.year = data.year;
                        scope.ui.yearsLoading = false;
                        scope.ui.showGraphs = true;
                        scope.ui.loading = false;
                        scope.setDefaultType();

                        if (includeAggregations) {
                            scope.raw = years.getRawData();
                        }
                    }
                });
        },

        getHalfyearData(dashboard, currDash, includeAggregations) {
            var scope = this;

            this.ui.halfyearsLoading = true;
            var halfyears = new DataCollection('half-year', this.seriesDefinition);
            return halfyears.getData(dashboard.id, includeAggregations, this.previousType, this.budgetType, this.presetFromDate, this.presetToDate, this.ui.reclassified)
                .then(function(data) {
                    if (!data) {
                        scope.ui.showGraphs = false;
                        scope.ui.loading = false;
                        return false;
                    }

                    if (currDash == scope.dash.id) {
                        scope.data['half-year'] = data['half-year'];
                        scope.ui.halfyearsLoading = false;
                        scope.ui.showGraphs = true;
                        scope.ui.loading = false;
                        scope.setDefaultType();

                        if (includeAggregations) {
                            scope.raw = halfyears.getRawData();
                        }
                    }
                });
        },

        getQuarterData(dashboard, currDash, includeAggregations) {
            var scope = this;

            this.ui.quartersLoading = true;
            var quarters = new DataCollection('quarter', this.seriesDefinition);
            return quarters.getData(dashboard.id, includeAggregations, this.previousType, this.budgetType, this.presetFromDate, this.presetToDate, this.ui.reclassified)
                .then(function(data) {
                    if (!data) {
                        scope.ui.showGraphs = false;
                        scope.ui.loading = false;
                        return false;
                    }

                    if (currDash == scope.dash.id) {
                        scope.data.quarter = data.quarter;
                        scope.ui.quartersLoading = false;
                        scope.ui.showGraphs = true;
                        scope.ui.loading = false;
                        scope.setDefaultType();

                        if (includeAggregations) {
                            scope.raw = quarters.getRawData();
                        }
                    }
                });

        },

        getMonthData(dashboard, currDash, includeAggregations) {
            var scope = this;

            //Get monthly data
            this.ui.monthsLoading = true;
            var months = new DataCollection('month', this.seriesDefinition);
            return months.getData(dashboard.id, includeAggregations, this.previousType, this.budgetType, this.presetFromDate, this.presetToDate, this.ui.reclassified)
                .then(function(data) {
                    if (!data) {
                        scope.ui.showGraphs = false;
                        scope.ui.loading = false;
                        scope.ui.forbidden = true;
                        return false;
                    }

                    if (currDash == scope.dash.id) {
                        scope.data.month = data.month;
                        scope.ui.monthsLoading = false;
                        scope.ui.showGraphs = true;
                        scope.ui.loading = false;
                        scope.setDefaultType();

                        if (includeAggregations) {
                            scope.raw = months.getRawData();
                        }
                    }

                });
        },

        getWeekData(dashboard, currDash, includeAggregations) {
            var scope = this;

            this.ui.weeksLoading = true;
            var weeks = new DataCollection('week', this.seriesDefinition);
            return weeks.getData(dashboard.id, includeAggregations, this.previousType, this.budgetType, this.presetFromDate, this.presetToDate, this.ui.reclassified)
                .then(function(data) {
                    if (!data) {
                        scope.ui.showGraphs = false;
                        scope.ui.loading = false;
                        return false;
                    }

                    if (currDash == scope.dash.id) {
                        scope.data.week = data.week;
                        scope.ui.weeksLoading = false;
                        scope.ui.showGraphs = true;
                        scope.ui.loading = false;
                        scope.setDefaultType();

                        if (includeAggregations) {
                            scope.raw = weeks.getRawData();
                        }
                    }
                });
        },

        getDayData(dashboard, currDash, includeAggregations) {
            var scope = this;
            this.ui.daysLoading = true;
            var days = new DataCollection('day', this.seriesDefinition);
            return days.getData(dashboard.id, includeAggregations, this.previousType, this.budgetType, this.presetFromDate, this.presetToDate, this.ui.reclassified)
                .then(function(data) {
                    if (!data) {
                        scope.ui.showGraphs = false;
                        scope.ui.loading = false;
                        return false;
                    }

                    if (currDash == scope.dash.id) {
                        scope.data.day = data.day;
                        scope.ui.daysLoading = false;
                        scope.ui.showGraphs = true;
                        scope.ui.loading = false;
                        scope.setDefaultType();

                        if (includeAggregations) {
                            scope.raw = days.getRawData();
                        }
                    }

                });
        },

        setDefaultType() {
            if (this.types.length > 0 && !this.presetType && (this.type === null || this.types.indexOf(this.type) < 0) ) {
                this.changeType(this.types[0]);
            }
        },

        changeBudgetType(type) {
            this.budgetType = type;
            this.closeAllOptions();
            this.loadData();
        },

        changeType(type) {
            this.type = type;
            this.closeAllOptions();
        },

        changeCashbook(cb) {
            this.ui.cashbook = cb;
            this.closeAllOptions();
        },

        changeSpread() {
            this.$store.dispatch('setFloatingAveragePointSpread', parseInt(this.faPointSpread));
            this.closeAllOptions();
        },

        closeAllOptions() {
            this.ui.showIntervalOptions = false;
            this.ui.showSeriesOptions = false;
            this.ui.showDataOptions = false;
            this.ui.showPreviousOptions = false;
            this.ui.showFAOptions = false;
            this.ui.showCashbookOptions = false;
            this.ui.showBudgetOptions = false;
            this.ui.showSeriesGraphOptions = false;
        },

        getLoader(interval) {
            var loader = interval.replace('half-year', 'halfyear') + 'sLoading';
            return this.ui[loader];
        },

        getImage(img) {
            return new AssetModel(img).path;
        },

        gotoCompanySettings() {
            this.$router.push('/account/company/erp');
        },

        processChartInfo(chartInfo, isFromDrilldown) {
            //console.log('process chart info')
            //debugger;

            //We have 2 line-charts (normal and one for drilldown) at the same time - so when we are creating new report page - both start processing chart data
            //So it can initiate double page creation - here we are checking - we are saving drilldown data or not
            if ((!this.drilldownData.isDrillDown && isFromDrilldown) || (this.drilldownData.isDrillDown && !isFromDrilldown)) {
                return
            }

            if (chartInfo.series.length === 0) {
                return false;
            }

            function getKeyByValue(object, value) {
                for(var key in object) {
                    if(object[key] === value) {
                        return key;
                    }
                }
            }

            var includeSeries = [];

            chartInfo.series.forEach(function (s) {
                //If it`s system KPI - we are saving a key not the name
                const key = this.dash.id == '_general' ? s.name : getKeyByValue(this.ui.dictionary.systemKpis, s.name);
                //debugger;
                if (chartInfo.hidden.indexOf(s.name) < 0 || this.ui.section == 'kpis') {
                    if (includeSeries.indexOf(s.name) < 0) {
                        includeSeries.push(key || s.name);
                    }
                }
                if (this.ui.showKpiGrid && this.ui.section === 'kpis') {
                    this.dash.dashboardKpis.forEach((item) => {
                        if (includeSeries.indexOf(item.kpi?.name) < 0) {
                            includeSeries.push(item.kpi.name);
                        }
                    })
                }

            }.bind(this));

            this.processReportPageInfo({
                aggregations : this.ui.section === 'kpis' ? true : false,
                balance : 'change',
                benchmark : this.ui.section === 'kpis' ? true : this.isAverageOn,
                budget : this.$store.getters.budget,
                cashbook : this.ui.cashbook ? 'both' : 'false',
                budget_loaded_file : this.budgetFile,
                compare : null,
                pseudo_dashboard : this.dash.id === '_general' ? (this.drilldownData.isDrillDown && this.ui.section !== 'kpis' ? null : this.dash.id) : null,
                dashboard : this.dash.id === '_general' ? null : this.dash.id,
                intervals : this.selectedInterval,
                previous: this.previousType,
                reclassified: this.ui.reclassified,
                settings : {
                    graphType : this.graphType,
                    series : includeSeries,
                    previousEnabled : this.$store.getters.previous,
                    type : chartInfo.type
                },
                kpi_drill_down : this.drilldownData.isDrillDown && this.ui.section !== 'kpis' ? this.drilldownData.seriesID : null,
                spread: this.isFloatingAvgOn ? this.floatingAvgPointsSpread : null,
                entry_department: this.selectedDepartmentId ? this.selectedDepartmentId : null
            });
        },

        changeInterval(interval) {
            if (this.getLoader(interval)) {
                return false;
            }

            this.$store.dispatch('setInterval', interval);
            this.closeAllOptions();
        },

        setCashbookState(selectedCashbookState) {
            const { ONLY_CASHBOOK } = cashbookStates;
            this.cashbookOnly = selectedCashbookState === ONLY_CASHBOOK;
            this.ui.showCashbookOptions = false;

            this.$store.dispatch('setDashboardCashbook', selectedCashbookState);
        },

        toggleCashbook() {
            this.ui.cashbook = !this.ui.cashbook;
            this.$store.dispatch('toggleDashboardCashbook');
        },

        toggleEasyView() {
            this.easyview = !this.easyview;
            this.$store.dispatch('toggleEasyView')
        },

        toggleBudget() {
            this.$store.dispatch('toggleDashboardBudget');
        },

        toggleAverage() {
            this.$store.dispatch('toggleDashboardAverage');
        },

        toggleFloatingAvg() {
            this.$store.dispatch('toggleDashboardFloatingAverage');
        },

        togglePrevious() {
           this.$store.dispatch('togglePrevious')
        },

        changePrevType(type) {
            this.$store.dispatch('setPreviousType', type);
            this.closeAllOptions();
            this.loadData();
        },

        getSelectedDepartment(department) {
            this.selectedDepartmentId = department;
        },

        getInterval() {
            this.loadCurrentInterval(this.selectedInterval, this.dash, this.dash.id);
        }

    };

    const computed = {
        //TODO: DRY!!! Move it to the separate mixin
        UICashbookState() {
            return this.$store.getters.cashbook;
        },

        isCashbookActive() {
            const { ONLY_CASHBOOK, CASHBOOK } = cashbookStates;
            return this.UICashbookState === CASHBOOK || this.UICashbookState === ONLY_CASHBOOK;
        },

        isCashbookOnly() {
            const { ONLY_CASHBOOK, ONLY_CASHBOOK_DISABLED } = cashbookStates;
            return this.UICashbookState === ONLY_CASHBOOK || this.UICashbookState === ONLY_CASHBOOK_DISABLED;
        },

        chartCashbookState() {
            return this.chartRendered && this.UICashbookState;
        },

        chartBudgetState() {
            return this.chartRendered && this.$store.getters.budget;
        },

        isBudgetOn() {
            return this.$store.getters.budget;
        },

        isAverageOn() {
            return this.$store.getters.average;
        },

        chartAverageState() {
            return this.chartRendered && this.isAverageOn;
        },

        isFloatingAvgOn() {
            return this.$store.getters.floatingAverage;
        },

        chartFloatingAvgState() {
            return this.chartRendered && this.isFloatingAvgOn;
        },

        floatingAvgPointsSpread() {
            //TODO: it`s a hack!
            this.faPointSpread =  this.$store.getters.floatingAveragePointSpread;
            return this.$store.getters.floatingAveragePointSpread;
        },

        isPreviousActive() {
            return this.$store.getters.previous;
        },

        previousType() {
            return this.$store.getters.previousType;
        },

        chartPreviousType() {
            return this.chartRendered && this.previousType;
        },

        selectedInterval() {
            return this.$store.getters.interval;
        },

        setEasyView() {
            this.easyview = this.$store.getters.easyview;
            return this.$store.getters.easyview;
        },

        isShowPreview() {
            return this.$store.getters.showPreview;
        },

        isEasyView() {
            return this.$store.getters.easyview;
        },

        getDashboardId() {
            return this.$store.getters.dashboard.id === "_general";
        },

        isTimeline() {
            return this.ui.section === 'timeline' && (!this.currentIntervalLoading() || this.isTutorial) && !this.drilldownData.ready;
        },

        isDrillDownView() {
            return this.ui.section === 'timeline' && !this.currentIntervalLoading() && this.drilldownData.ready && this.drilldownData.seriesName;
        },

        isKpisView() {
            return this.ui.section === 'kpis' && this.raw && this.dash;
        },

        entryDepartmentsEnabled() {
            const context = ContextModel.getContext();
            const company = context ? context.company : CompanyModel.getCompany();
            return company?.settings?.entry_department && this.profile?.roles?.indexOf && this.profile.roles.indexOf('entry_department_role') >= 0
        },

        getPresentationPageInfo() {
            return this.$store.getters.presentationPage;
        }
    };

    export default Vue.extend({
        template,
        data,
        methods,
        props : ['dash', 'presets', 'presetSeries', 'presetSection', 'presetInterval', 'presetCashbook', 'presetBudget', 'presetAverage', 'presetPrevious', 'presetEasyview', 'presetSpread', 'presetType', 'presetGraphType',  'presentationInfoFlag', 'processReportPageInfo', 'presentation', 'presetFromDate', 'presetToDate', 'presentationData', 'presetDrilldown', 'dashParamInfoFlag', 'returnDashParams', 'presetCurrency', 'presetReclassified'],
        components : {
            'line-chart' : lineChart,
            'kpi-grid' : kpiGrid,
            'date-picker' : datePicker,
            'tutorial-slide' : tutorialSlide,
            'valid-ledger' : validLedger,
            'switch-with-labels': switchWithLabels,
            'intervals-selector': intervalsSelector,
            'entry-departments' : entryDepartments
        },
        computed,
        watch : {
            presentationInfoFlag() {
                this.chartInfoFlag++;
            },
            dashParamInfoFlag() {
                var includedSeries = {};
                var dataPointer = this.data;


                if (this.drilldownData.isDrillDown) {
                    dataPointer = this.drilldownData.data[this.drilldownData.seriesID];
                }

                dataPointer[this.selectedInterval][this.type].current.series.forEach(function (s) {
                    if (s.visible) {
                        if (this.drilldownData.isDrillDown) {
                            includedSeries[s.internalName] = s.internalName;
                        } else {
                            for (var sd in this.seriesDefinitionMap[this.type]) {
                                var translatedSeries = this.ui.dictionary.kpis[sd];

                                if (translatedSeries == s.name || sd == s.name) {
                                    includedSeries[sd] = this.seriesDefinitionMap[this.type][sd];
                                }
                            }
                        }
                    }
                }.bind(this));

                this.returnDashParams({
                    startDate : DateRangeModel.getFromString(),
                    endDate : DateRangeModel.getToString(),
                    aggregations : false,
                    intervals : this.selectedInterval,
                    cashbook : this.ui.cashbook ? 'both' : 'false',
                    benchmark : this.isAverageOn,
                    previous: this.isPreviousActive ? this.previousType : 'none',
                    unit : this.type,
                    kpis : includedSeries || this.seriesDefinitionMap[this.type] || [],
                    isDrillDown : this.drilldownData.isDrillDown,
                    drillDownSeriesID: this.drilldownData.seriesID,
                    budget : this.budget
                });
            },

            dash(val) {
                this.init();
                this.closeDrilldown(true);
            },

            type(val) {
                this.closeDrilldown(false, true);
            },

            'ui.section' : function(section) {
                this.refresh++;
                this.$store.dispatch('setKpis', section === 'kpis');
            },
            'ui.reclassified': (function() {
                let isFirstChange = true;
                return function () {
                    if (isFirstChange) {
                        isFirstChange = false;
                        return;
                    }
                    !this.$store?.state?.presentation?.presentationMode ? this.loadData() : '';
                }
            })(),
            'previous' : function(val) {
                PersistentSettings.setItem('dash-previous', val);
            },

            'easyview' : function(val) {
                PersistentSettings.setItem('dash-easyview', val);
                this.$store.dispatch('setEasyView', val);
            },

            'previousType' : function(val) {
                PersistentSettings.setItem('dash-previousType', val);
                this.closeDrilldown(true);
            },

            UICashbookState(currentCashbookState) {

            },
            chartCashbookState(currentCashbookState) {
                if (!currentCashbookState) return;
                const { ONLY_CASHBOOK, CASHBOOK, CASHBOOK_DISABLED, ONLY_CASHBOOK_DISABLED } = cashbookStates;
                setTimeout(() => {
                    switch (currentCashbookState) {
                        case CASHBOOK:
                            this.ui.cashbook = true;
                            this.cashbookOnly = false;
                            break;
                        case CASHBOOK_DISABLED:
                            this.ui.cashbook = false;
                            break;
                        case ONLY_CASHBOOK:
                            this.ui.cashbook = true;
                            this.cashbookOnly = true;
                            break;
                        default:
                            this.ui.cashbook = false;
                            this.cashbookOnly = false;
                    }
                }, 100)
            },
            selectedInterval(val, oldVal) {
                let key = val.replace('half-year', 'halfyear') + 'sLoading';
                if (this.drilldownData.isDrillDown && !this.ui[key]) {
                    this.switchToDrilldown();
                }
                if (oldVal && val !== oldVal) {
                    this.getInterval();
                }
            },
            floatingAvgPointsSpread(val) {
                this.faPointSpread = val;
            },
            presetDrilldown(val) {

            },
            'selectedDepartmentId': function (val, oldVal) {
                if(val !== oldVal) {
                    this.loadData();
                }
            }
        },
        mounted() {
            this.init();
        },
        beforeDestroy() {
            EventBus.$off('click', this.closeAllOptions);
            document.removeEventListener('clickAppBody', this.closeAllOptions);
        }
    });
