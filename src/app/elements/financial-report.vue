/* global saveAs */

    <template>
        <article class="manage-dashboards manage-kpis financial-report-table">

            <section v-show="ui.loading">
                <div class="working"></div>
            </section>


            <section v-show="!ui.loading">

                <div class="graph-bar" v-if="!previewPresentation && !isUnderPresentation && !isBudget">
                    <div class="right trial-balance-float-right">

                        <div v-show="entryDepartmentsEnabled" class="context-container margin-dropdown">
                            <entry-departments @getDepartmentId="getSelectedDepartment" :selectedDepartmentId="selectedDepartmentId"></entry-departments>
                        </div>

                        <intervals-selector  v-show="!isBudget" data-test-id="selectInterval" :intervalOptions="intervalOptions" class="pullup"/>
                        <div class="pullup selector small fade" data-test-id="selectInterval">
                            <i class="cwi-save export" v-if="!isBudget && !isUnderEditPresentation" v-on:click.stop="ui.exportOptions = true"></i>
                            <div class="selector inline" v-if="!isBudget && !isUnderEditPresentation">
                                <div class="label" v-on:click.stop="ui.exportOptions = true">
                                    <span>{{ui.dictionary.palbal.export.action}}</span> <i class="cwi-down"></i>
                                    <div class="options" v-bind:class="{ show : ui.exportOptions }">
                                        <div class="option" v-on:click.stop="exportToExcel()">
                                            <img class="export-type-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACu0lEQVRoQ+2ZMWzTQBSG/2dolIFIjIWhQqpEUCLROLCwkTGFIsIAatkAtdAJUalb1IhsSI2YWqgETBTUgUY0qGPYGGgLhQVYYKEwVgpDhVCMnoOPq+uE2EnrM/ItSZw7+//e+987yyYEfFDA9SME8DuDYQb+1wxQYirdv+9XXSci3SCkANLfF9cOdRu4YwslC8kIfvYkNE3TAUMnkG4AA0SI2cW+K651fD37OV2dMD4Zj+3viQ4QaaZQgsHRTRAo0k5k9xQgWUj2avWIbtSNFAvm6MJAPxG5gpbB9hTgeD5ttBNVN3P60n1upou5BvD2Ra6sOy1uGk2VAFh4JVd21BoCuPGEVwuFGXAT5VZz12+vir+Hyjnz+9L5xaZLrDnKZMBXgMunRjCZnRDRyi8W8PzNkvgdix7A8q0KYtHGBnxneRqPX81vi66vAKyEBR4+2Lid+bq5gcHSkBDIcAzJ4+P3T7g4M7zDGr4X8ckjJ/DgypwQdvXhKFa+rJpQDGcN67idwHcAFnR3ZBqZY6dNba8/r+DaozEUcwWc0xvZYFuxvZyG7xZiUfZo35yfMKF41LZ+IFs6Y34qC8DCbmTGcD0z+kd0rWXhyiBKZIAFccdZGH8qCrpV4coAStSABSC3TKsrXZoZbmofnqMMgNwyNza/iUzcq85htnrf0f98UAkLya2UizX/bEoUMYvMls6CoZQtYnkzsyLOewODya1VSYDt3edvy7RvcNxaqx9e7mDwtQbivUexMP5EiLL7Xd7Mals100r2/cBXANkm7HEWKA/7Bsc3cnxDp+Q+0LTN/OMPJbqQV/HKtNFOAHytgU6EW2tDAIcohs+F3FjLs4UMrFculFNO12qagcA/3HWiDdTj9XatEagXHO1CAQjOKyYXULsy1fPbll1R4+GkIYCHoHV1SZiBrobTw8l+Ay2Al0BP3OV8AAAAAElFTkSuQmCC">
                                            <span>{{ui.dictionary.palbal.export.excel}}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                    <div class="trial-balance-date-picker" v-show="!isBudget">
                        <date-picker :onDateChange="getData"></date-picker>
                    </div>
                </div>


                <div class="graph-bar secondary" v-if="!previewPresentation">
                    <div class="right">
                        <div v-show="(ui.previous || ui.showBudgetComparison) && !isUnderPresentation" class="selector small pullup" style="margin-top: -27px;">
                            <label>{{ui.dictionary.palbal.delta}}</label>
                            <div data-test-id="openDeltaOptions" class="label" v-on:click.stop="ui.deltaOptions = true">
                                <span v-show="deltaType === 'nominal'">{{ui.dictionary.meta.nominal}}</span>
                                <span v-show="deltaType !== 'nominal'">{{deltaType}}</span>
                                <i class="cwi-down"></i>
                                <div class="options" v-bind:class="{ show : ui.deltaOptions }">
                                    <div data-test-id="nominal" class="option" v-on:click.stop="changeDeltaType('nominal')">
                                        <span>{{ui.dictionary.meta.nominal}}</span>
                                    </div>
                                    <div data-test-id="deltaPercent" class="option" v-on:click.stop="changeDeltaType('%')">
                                        <span>%</span>
                                    </div>
                                    <div data-test-id="deltaX" class="option" v-on:click.stop="changeDeltaType('x')">
                                        <span>x</span>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div class="onoff-selector inline-options double">
                            <div data-test-id="onPreviousYear" v-show="!isUnderEditPresentation && !isUnderPresentation && !isBudget" class="onoff-selector primary" :class="{ active : ui.previous }" v-on:click="ui.previous = !ui.previous; ui.showBudgetComparison = false;">{{ui.dictionary.overview.previousYear}}</div>
                            <div data-test-id="onPreviousYear" v-show="!isUnderPresentation && !isBudget" class="onoff-selector primary" :class="{ active : ui.showBudgetComparison }" v-on:click="ui.showBudgetComparison = !ui.showBudgetComparison; ui.previous = false;">Budget</div>
                            <div data-test-id="onCashbook" class="onoff-selector primary" v-show="!isUnderPresentation && !isBudget" :class="{ active : cashbook }" v-on:click="toggleCashbook()"> {{ui.dictionary.overview.cashbook}}</div>
                        </div>

                        <a data-test-id="expandedAll" href="#" v-on:click.prevent="expandAll()">{{ui.dictionary.palbal.expandAll}}</a>
                        &nbsp; | &nbsp;
                        <a data-test-id="collapseAll" href="#" v-on:click.prevent="collapseAll()">{{ui.dictionary.palbal.collapseAll}}</a>
                    </div>

                    <switch-with-labels v-model="ui.reclassified" :firstValue="true" :secondValue="false" @input="getData" v-show="hasReclassRole() && !isUnderPresentation && !isBudget">
                        <span slot="label-left" :class="[ui.reclassified ? 'primary-color' : 'faded']">{{ui.dictionary.overview.reclassified}}</span>
                        <span slot="label-right" :class="[!ui.reclassified ? 'primary-color' : 'faded']">{{ui.dictionary.overview.notReclassified}}</span>
                    </switch-with-labels>

                </div>


                <div v-show="ui.noData" style="padding-left: 2rem;">
                    <p>{{ui.dictionary.overview.noPublicData}}</p>
                </div>

                <div class="working" v-show="ui.loadPeriodsData"></div>
                <div v-show="!ui.noData" ref="dynamictable">
                    <div class="dynamic-table categories" :class="[isUnderEditPresentation ? 'extra-margin' : '']">
                        <div class="container with-margin">

                            <div class="row head tabular-heading" :style="{ width : tableProps.tableWidth - 17 + 'px' }">
                                <div class="first-col tabular-heading" :class="{ 'scrolled-right': scrolledRight }" :style="{ width : tableProps.firstCellWidth + 'px' }">
                                    <div class="cell" :style="{ width : tableProps.firstCellWidth + 'px' }" style="padding: 0;">
                                        <span class="cell-value">{{ui.dictionary.financialReport.category}}</span>
                                    </div>
                                </div>
                                <div class="main-cols">
                                    <div class="cell" v-for="(period, i) in periods"
                                         :style="{ width : tableProps.cellWidth + 'px' }">
                                       <span class="cell-value no-elipsis">
                                           <span class="budget" :style="{ width : tableProps.cellWidth / 3.5 + 'px' }">{{formatPeriod(period)}}</span>
                                           <span v-show="ui.previous || ui.previousPeriod" class="budget" :style="{ width : tableProps.cellWidth / 3.5 + 'px' }">Previous</span>
                                           <span v-show="ui.showBudgetComparison" class="budget" :style="{ width : tableProps.cellWidth / 3.5 + 'px' }">{{ui.dictionary.overview.budget}}</span>
                                           <span v-show="ui.previous || ui.previousPeriod || ui.showBudgetComparison" class="budget" :style="{ width : tableProps.cellWidth / 3.5 + 'px' }">{{ui.dictionary.palbal.delta}}</span>
                                       </span>
                                    </div>
                                    <div class="cell"
                                         v-if="!isBudget"
                                         :style="{ width : tableProps.cellWidth + 'px' }">
                                   <span class="cell-value">
                                       <span>{{getCompareHeading()}}</span>
                                   </span>
                                    </div>
                                </div>
                            </div>

                            <div class="body">
                                <div class="first-col" :class="{ 'scrolled-right': scrolledRight }" :style="{ width : tableProps.firstCellWidth + 'px' }">
                                    <div class="first-col-container">
                                        <div class="row"
                                             v-for="(category, index) in categories"
                                             :class="{ 'sum-row' : category.sum, 'tabular-altrow' : index % 2 != 0 && !category.sum && !category.divider && category.level !== 0 && category.level !== 1, 'tabular-altrow2' : (index % 2 == 0 && !category.sum) || category.divider, divider : category.divider, level0 : category.level == 0, level1 : category.level == 1, level2 : category.level == 2, level3 : category.level == 3 }"
                                             v-show="showCategory(category) && showSubCategory(category)">

                                            <div class="cell reference" :style="{ width : tableProps.firstCellWidth + 'px'}">
                                                <span class="cell-value" v-on:click="toggleCategoryVisibility(category)" :class="{ extraSpace : needsExtraSpace(category.reference), clickable : category.level == 0 && hasCategoryChildren(category, index), pointer : category.level == 1 && hasSubCategoryChildren(category, index) }">

                                                   <span v-show="category.level == 0 && hasCategoryChildren(category, index)">
                                                       <span v-show="isHiddenCategory(category)">+</span>
                                                       <span v-show="!isHiddenCategory(category)">&ndash;</span>
                                                   </span>

                                                   <span v-show="category.level == 1 && hasSubCategoryChildren(category, index)">
                                                       <span v-show="isHiddenSubCategory(category)">+</span>
                                                       <span v-show="!isHiddenSubCategory(category)">&ndash;</span>
                                                   </span>

                                                   <span v-if="!category.divider && !category.unspecified" :title="ui.dictionary.kpiCategories[category.reference]">{{ui.dictionary.kpiCategories[category.reference]}}</span>
                                                   <span v-if="category.divider" :title="ui.dictionary.kpiCategories[category.reference]">{{ui.dictionary.kpiCategories[category.reference]}}</span>
                                                   <span v-if="category.vattype && category.vattype == 'receivable'">{{ui.dictionary.financialReport.receivable}}</span>
                                                   <span v-if="category.vattype && category.vattype == 'payable'">{{ui.dictionary.financialReport.payable}}</span>
                                                   <span v-if="category.unspecified">{{getUnspecifiedTitle(category.reference)}}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="main-cols" v-on:scroll="handleScroll"
                                     v-on:wheel="handleWheelScroll"
                                     :style="{ width : (tableProps.tableWidth - 17) + 'px', marginLeft : (0 - tableProps.firstCellWidth - 3)  + 'px', paddingLeft : tableProps.firstCellWidth  + 'px' }">
                                    <div class="main-cols-container">

                                        <div class="row"
                                             v-for="(category, index) in categories"
                                             :class="{ 'sum-row' : category.sum, 'tabular-altrow' : index % 2 != 0 && !category.sum && !category.divider && category.level !== 0 && category.level !== 1, 'tabular-altrow2' : index % 2 == 0 && !category.sum, divider : category.divider && !category.sum, level0 : category.level == 0, level1 : category.level == 1, level2 : category.level == 2, level3 : category.level == 3 }"
                                             v-show="showCategory(category) && showSubCategory(category)">

                                        <div v-if="!category.divider && category.dataArray" class="cell"
                                             v-for="(data, key) in category.dataArray"
                                             :style="{ width : tableProps.cellWidth + 'px' }"
                                             :class="{ 'sum-row' : category.sum, 'tabular-altrow' : index % 2 != 0 && !category.sum && category.level !== 0 && category.level !== 1, 'tabular-altrow2' : index % 2 == 0 && !category.sum }">

                                           <span class="cell-value no-elipsis" :class="{ extraSpace : needsExtraSpace(category.reference) }">
                                               <span class="budget" :style="{ width : tableProps.cellWidth / 3.5 + 'px' }">{{ formatValue({data: data, cat: category}) }}</span>

                                                   <span v-if="ui.previous" class="budget" :style="{ width : tableProps.cellWidth / 3.5 + 'px' }">{{ formatPrevValue(category, key) }}</span>
                                                   <span v-if="ui.showBudgetComparison" class="budget" :style="{ width : tableProps.cellWidth / 3.5 + 'px' }">{{ formatBudgetComparisonValue(category, key) }}</span>
                                                   <span v-if="ui.previous || ui.showBudgetComparison" class="budget" :style="{ width : tableProps.cellWidth / 3.5 + 'px' }">{{ getDelta(data, category, key, ui.showBudgetComparison) }}</span>
                                               </span>
                                        </div>


                                        <div v-if="!category.divider && !category.dataArray" class="cell"
                                             v-for="(period, key) in periods"
                                             :style="{ width : tableProps.cellWidth + 'px' }"
                                             :class="{ 'sum-row' : category.sum, 'tabular-altrow' : index % 2 != 0 && !category.sum && !category.divider && category.level !== 0 && category.level !== 1, 'tabular-altrow2' : (index % 2 == 0 && !category.sum) || category.divider }">

                                           <span class="cell-value" :class="{ extraSpace : needsExtraSpace(category.reference) }">
                                               {{ formatValue({data: 0, cat: category, isEmpty: true}) }}
                                           </span>
                                        </div>


                                        <div v-if="category.divider" class="cell"
                                             v-for="(period, i) in periods"
                                             :style="{ width : tableProps.cellWidth + 'px' }"
                                             :class="{ 'divider' : !category.sum, 'sum-row' : category.sum, 'tabular-altrow' : index % 2 != 0 && !category.sum && !category.divider && category.level !== 0 && category.level !== 1, 'tabular-altrow2' : (index % 2 == 0 && !category.sum) || category.divider }">

                                           <span class="cell-value" :class="{ extraSpace : needsExtraSpace(category.reference) }">
                                               &nbsp;
                                           </span>
                                        </div>





                                        <div v-if="category.divider && !isBudget" class="cell"
                                             :style="{ width : tableProps.cellWidth + 'px' }"
                                             :class="{ 'divider' : !category.sum, 'sum-row' : category.sum, 'tabular-altrow' : index % 2 != 0 && !category.sum && !category.divider && category.level !== 0 && category.level !== 1, 'tabular-altrow2' : (index % 2 == 0 && !category.sum) || category.divider }">

                                           <span class="cell-value" :class="{ extraSpace : needsExtraSpace(category.reference) }">
                                               &nbsp;
                                           </span>
                                        </div>


                                        <div v-if="!category.divider && category.aggData && !isBudget" class="cell"
                                             :style="{ width : tableProps.cellWidth + 'px' }"
                                             :class="{ 'sum-row' : category.sum, 'tabular-altrow' : index % 2 != 0 && !category.sum && category.level !== 0 && category.level !== 1, 'tabular-altrow2' : index % 2 == 0 && !category.sum }">

                                           <span class="cell-value" :class="{ extraSpace : needsExtraSpace(category.reference) }">
                                                {{formatAggValue(category)}}
                                           </span>
                                        </div>

                                        <div v-if="!category.divider && !category.aggData && !isBudget" class="cell"
                                             :style="{ width : tableProps.cellWidth + 'px' }"
                                             :class="{ 'sum-row' : category.sum, 'tabular-altrow' : index % 2 != 0 && !category.sum && !category.divider && category.level !== 0 && category.level !== 1, 'tabular-altrow2' : (index % 2 == 0 && !category.sum) || category.divider }">

                                           <span class="cell-value" :class="{ extraSpace : needsExtraSpace(category.reference) }">
                                               {{formatAggValue(category, true)}}
                                           </span>
                                        </div>

                                    </div>

                                </div>
                            </div>

                        </div>

                    </div>
                </div>
                </div>
            </section>

        </article>
    </template>

<script>
  import Vue from 'Vue';
  import moment from 'moment';
  import FileSaver from 'FileSaver';
  import DictionaryModel from 'models/DictionaryModel';
  import BalanceDataCollection from 'collections/BalanceDataCollection';
  import AccountCollection from 'collections/AccountCollection';
  import PresentationTemplateCollection from 'collections/PresentationTemplateCollection';
  import datePicker from 'elements/date-picker';
  import switchWithLabels from 'elements/switch-with-labels';
  import intervalsSelector from 'elements/dropdown/intervals-selector';
  import deltaSelector from 'elements/dropdown/delta-selector';
  import Config from 'services/Config';
  import EventBus from 'services/EventBus';
  import NumberFormatter from 'services/NumberFormatter';
  import catConfig from 'config/categories';
  import invertCatConfig from 'config/invert-categories';
  import AssetModel from 'models/AssetModel';
  import ErpModel from 'models/ErpModel';
  import DateRangeModel from 'models/DateRangeModel';
  import UserModel from  'models/UserModel';
  import ContextModel from 'models/ContextModel';
  import Toast from 'services/Toast';
  import FinancialReportHelpers from 'services/FinancialReportHelpers';
  import cashbookStates from 'constants/ui/cashbook';
  import intervalOptions from 'constants/ui/intervals';
  import reportPageTypes from  'constants/reportPageTypes';
  import dashboardMutationTypes from 'store/dashboardMutationTypes';
  import CompanyModel from 'models/CompanyModel';
  import calculateDefinition from  'helpers/fin-report-calculations';
  import entryDepartments from 'elements/entry-departments';
  import EntryDepartmentModel from 'models/EntryDepartmentModel'
  import entryDepartmentHelpers from 'helpers/entryDepartmentHelpers'

  const { MONTH, QUARTER, HALF_YEAR, YEAR } = intervalOptions;

  const findCorrespondingPreviousYearData = ({granularityKey, previousYearCatmap}) =>
    previousYearCatmap.find(cat => cat.granularity_key === parseInt(getPreviousYearGranularityKey(granularityKey)));

  const getPreviousYearGranularityKey = granularityKey =>
    (parseInt(getYearFromKey(granularityKey)) - 1).toString().concat(getIntervalFromKey(granularityKey));

  const findCorrespondingBudgetData = ({granularityKey, budgetComparisonCatMap}) =>
    budgetComparisonCatMap.find(cat => cat.granularity_key === granularityKey);

  const findCorrespondingPreviousPeriodData = ({granularityKey, catmap, previousYearCatmap, selectedIntervalType}) => {
    const granularityKeyToFind = parseInt(getPreviousPeriodGranularityKey(granularityKey, selectedIntervalType));

    return catmap.find(cat => cat.granularity_key === granularityKeyToFind)
      ||
      previousYearCatmap.find(cat => cat.granularity_key === granularityKeyToFind)
  }

  const getPreviousPeriodGranularityKey = (granularityKey, selectedIntervalType) => {
    let interval = parseInt(getIntervalFromKey(granularityKey));
    //If interval is not year because if it is year interval '' will be returned
    //If interval - 1 === 0 it means that previous interval is the part of previous year
    if (interval && (interval - 1 !== 0)) {
      //previous interval
      interval -= 1;
      return parseInt(getYearFromKey(granularityKey)).toString().concat(interval.toString());
    } else if (interval && (interval - 1) === 0){
      //last interval of previous year
      return (parseInt(getYearFromKey(granularityKey)) - 1).toString().concat(getLastIntervalKey(selectedIntervalType));
    } else {
      //It's year interval
      return (parseInt(getYearFromKey(granularityKey)) - 1).toString();
    }
  }

  //Last month / last quarter / last half-year
  const getLastIntervalKey = (selectedIntervalType) => {
    switch (selectedIntervalType) {
      case MONTH:
        return '12'
      case QUARTER:
        return '4'
      case HALF_YEAR:
        return '2'
    }
  }

  const getYearFromKey = key =>  key.toString().slice(0, 4);

  const getIntervalFromKey = key => key.toString().slice(4);

  const getDeltaPostfix = deltaType => deltaType === 'nominal' ? '' : deltaType === 'x' ? 'x' : '%';

  var bindings = function () {
    return {
      ui : {
        dictionary : DictionaryModel.getHash(),
        loading : true,
        noData : false,
        loadedDataSets : 0,
        showIntervalOptions : false,
        reclassified : true,
        exportOptions : false,
        loadPeriodsData: false,
        deltaOptions: false,
        previous: false,
        previousPeriod: false,
        showBudgetComparison: false
      },
      totalsMap: {
        total: {},
        prevYearTotal: {},
        prevPeriodTotal: {},
        aggTotal: {},
        budgetComparisonTotal: {}
      },
      currentData: null,
      previousYearData: null,
      budgetComparisonData: null,
      deltaType: 'nominal',
      accounts : [],
      catmap : [],
      aggregateCategories : [],
      categories : [],
      periods : [],
      tableProps : {
        additionalPadding : 50,
        tableWidth : 0,
        maxCellWidth : 0,
        firstCellWidth : 600,
        cellWidth : 200,
        remainingCellWidth : 0
      },
      showCashFlowAnalysis: UserModel.profile().roles && UserModel.profile().roles.indexOf('cash_flow_analysis_role') >= 0,
      scrolledDown : false,
      scrolledRight : false,
      intervalOptions: [MONTH, QUARTER, HALF_YEAR, YEAR],
      invertCategories : invertCatConfig.inverted,
      hideList : [],
      hideSubList : [],
      totalGroups : 0,
      hideToggle: true,
      totalSubGroups : 0,
      balance : 'to_date',
      compare : 'end_year_to_date',
      cashbook : false,
      erp : ErpModel.getErp(),
      compareYear : null,
      profile : UserModel.profile(),
      openedRows: [],
      fromDate: null,
      toDate: null,
      financialReportSource: null,
      interval: null,
      company: CompanyModel.getCompany(),
      selectedDepartmentId: null
    };
  };


  var methods = {
    init : function () {
      EventBus.$on('click', this.closeAllOptions);

      var catList = Config.get('categoryList');
      this.categories = catConfig[catList];

      if (this.previewPresentation) {
        this.checkPresets();
      } else {
        if (this.erp && this.erp.reclassifiedData && this.hasReclassRole()) {
          this.ui.reclassified = true;
        } else {
          this.ui.reclassified = false;
        }
      }

      if (!this.isUnderPresentation) {
        this.getData();
      } else {
        this.getPresentationData();
        this.changeInterval(this.presentationPage.intervals);
        this.ui.showBudgetComparison = !this.isBudget && this.presentationPage.budget_included;
        this.deltaType = this.presentationPage.settings.deltaType || 'nominal'
      }
    },

    checkPresets() {
      const { presetCashbook : cashbook, presetFromDate: fromDate, presetToDate: toDate, presetFinancialReportSource: financialReportSource, presetIntervals: interval, presetBudgetComparison } = this;

      Object.assign(this, {
        cashbook,
        fromDate,
        toDate,
      });

      //TODO - we need to separate it from the rest of application
      this.changeInterval(interval);
      this.ui.reclassified = financialReportSource === 'reclassified';
      this.ui.showBudgetComparison = presetBudgetComparison;
      this.deltaType = this.presetDeltaType || 'nominal'
    },

    needsExtraSpace : function (ref) {
      return ref == 'sum8' || ref == 'sum9' || ref == 'sum11';
    },

    getPresentationAccounts : function () {
      PresentationTemplateCollection.getFinancialReportAccounts(this.presentationToken, this.presentationId,this.presentationPage.id).then(function (res) {
        this.addOrderAndCategory(res);
      }.bind(this));
    },

    exportToExcel : function() {
      var scope = this;
      var dc= new BalanceDataCollection();

      const fromDate = moment(DateRangeModel.getFromString()).format('DD.MM.YYYY');
      const toDate = moment(DateRangeModel.getToString()).format('DD.MM.YYYY');

      const context = ContextModel.getContext();
      const company =  context ? context.company : CompanyModel.getCompany();

      dc.getFinExcelData(null, null, this.selectedInterval, this.compare, this.balance, this.cashbook, this.ui.reclassified)
        .then(function(data) {
          if (!data) {
            Toast.show(scope.ui.dictionary.palbal.export.error , 'warning');
            return false;
          }
          var blob = new Blob([data], {
            type : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          FileSaver.saveAs(blob, `${fromDate}-${toDate}_${company.name}.xlsx`);
        });

      this.closeAllOptions();
    },

    hasReclassRole : function () {
      return true;
      //return this.profile && this.profile.roles && this.profile.roles.indexOf('reclassification_role') >= 0;
    },

    getCompareHeading : function () {
      if (this.compareYear) {
        if (this.compareYear.length > 7) {
          const from = this.compareYear.split('/')[0];
          const to = this.compareYear.split('/')[1];
          this.compareYear = `${from}/${to.slice(2)}`;
        }
        if (this.compare == 'end_year_total') {
          return this.ui.dictionary.palbal.compare.replace(':year', this.compareYear);
        } else {
          return this.ui.dictionary.palbal.compareToDate.replace(':year', this.compareYear);
        }
      } else {
        return ' ';
      }
    },

    getImage : function(img) {
      return new AssetModel(img).path;
    },

    expandAll : function() {
      this.hideList = [];
      this.hideSubList = [];
    },

    collapseAll : function() {
      this.expandAll();
      for (var i = 0; i <= this.totalGroups; i++) {
        this.hideList.push(i);
      }

      for (var i = 0; i <= this.totalSubGroups; i++) {
        this.hideSubList.push(i);
      }
    },

    toggleSubCategoryVisibility : function (category) {
      var hi = this.hideSubList.indexOf(category.subGroup);

      if (hi >= 0) {
        this.hideSubList.splice(hi, 1);
      } else {
        this.hideSubList.push(category.subGroup);
      }
    },

    toggleCategoryVisibility : function (category) {
      if (category.level == 1) {
        this.toggleSubCategoryVisibility(category);
        return false;
      }

      if (category.level != 0) {
        return false;
      }

      var hi = this.hideList.indexOf(category.group);

      if (hi >= 0) {
        this.hideList.splice(hi, 1);
      } else {
        this.hideList.push(category.group);
      }
    },

    showCategory : function(category) {
      if ( (category.level != 0 && !category.sum && !category.divider && this.hideList.indexOf(category.group) >= 0) || category.invisible || (category.type === 'cashflow' && !this.showCashFlowAnalysis) ) {
        return false;
      }

      return true;
    },

    showSubCategory : function(category) {
      if ( (category.level >= 2 && !category.sum && !category.divider && this.hideSubList.indexOf(category.subGroup) >= 0) || category.invisible || (category.type === 'cashflow' && !this.showCashFlowAnalysis) ) {
        return false;
      }

      return true;
    },

    hasCategoryChildren : function (category, index) {
      if (this.categories[index + 1] && this.categories[index + 1].group == category.group && !this.categories[index + 1].sum && !this.categories[index + 1].divider) {
        return true;
      }

      return false;
    },

    hasSubCategoryChildren : function (category, index) {
      if (this.categories[index + 1] && this.categories[index + 1].subGroup == category.subGroup && this.categories[index + 1].group == category.group && !this.categories[index + 1].sum && !this.categories[index + 1].divider) {
        return true;
      }

      return false;
    },

    isHiddenCategory : function (category) {
      return this.hideList.indexOf(category.group) >= 0;
    },

    isHiddenSubCategory : function (category) {
      return this.hideSubList.indexOf(category.subGroup) >= 0;
    },

    closeAllOptions : function() {
      this.ui.showIntervalOptions = false;
      this.ui.exportOptions = false;
      this.ui.deltaOptions = false;
    },

    formatPeriod : function (val) {
      var chars = val.split('');

      if (this.selectedInterval == 'quarter') {
        chars.splice(chars.length-1,0,' Q');
      } else if (this.selectedInterval == 'month') {
        var monNum = Number(chars[4] + chars[5]) - 1;
        chars.splice(chars.length-2,2, ' ' + this.ui.dictionary.locale.monthsShort[monNum]);
      } else if (this.selectedInterval == 'half-year') {
        var indicator = this.ui.dictionary.locale.first;
        if (chars[4] == 2) {
          indicator = this.ui.dictionary.locale.second;
        }
        chars.splice(chars.length-1,1,' ' + indicator);
      }

      return chars.join('');
    },

    getValue({data, cat, isEmpty, isBudget = this.isBudget}) {
      let value = 0;
      let bali = 4;
      let pali = 0;

      if (this.cashbook) {
        bali = 5;
        pali = 1;
      }

      if (isBudget) {
        bali = 2;
        pali = 0;
      }

      try {
        if ((cat.sum || cat.tag === 'unspecified' || cat.tag === 'cashflow' || cat.tag === 'special' || cat.tag === 'categorySum') && !isEmpty) {
          value = data;
        } else if (cat.type == 'bal' && !isEmpty) {
          if (data.values[bali]) {
            value = data.values[bali].value;
          } else {
            value = 0;
          }
        } else if (cat.type == 'pal' && !isEmpty) {
          if (data.values[pali]) {
            value = data.values[pali].value;
          } else {
            value = 0;
          }
        }

        if (this.invertCategories.indexOf(cat.reference) >= 0) {
          value = value * -1;
        }

        if (cat.reference == 'VatAndDuties' && cat.vattype == 'receivable' && value < 0) {
          value = 0;
        } else if (cat.reference == 'VatAndDuties' && cat.vattype == 'payable' && value < 0) {
          value = value * -1;
        } else if (cat.reference == 'VatAndDuties' && cat.vattype == 'payable' && value > 0) {
          value = 0;
        }

        return value;
      } catch (e) {
        console.log(e);
      }


    },

    formatValue : function ({data, cat, isEmpty, isBudget = this.isBudget}) {
      return NumberFormatter.format(this.getValue({data, cat, isEmpty, isBudget}));
    },

    formatPrevValue(cat, key, isEmpty = false) {
      try {
        const relevantItem = this.previousYearData._embedded.items[key];
        const data = relevantItem._embedded.items.find(item => cat.id === item.grouping_id);

        if (cat.sum || cat.tag === 'unspecified' || cat.tag === 'cashflow' || cat.tag === 'special' || cat.tag === 'categorySum') {
          return this.formatValue({cat, data: cat.prevYearDataArray[key], isEmpty});
        }

        return this.formatValue({cat, data, isEmpty});
      } catch (e) {
        //console.log(e);
      }
    },

    formatBudgetComparisonValue(cat, key, isEmpty = false) {
      const data = cat.budgetComparisonDataArray[key];
      return data ? this.formatValue({cat, data, isEmpty, isBudget: true}) : '0.00';
    },

    formatPrevPeriodValue(cat, key, isEmpty = false) {
      try {
        // console.log('cat', cat);
        const data = cat?.prevPeriodDataArray[key] || '0.00';
        return this.formatValue({cat, data, isEmpty});
      } catch (e) {
        //console.log('error', e);
      }

    },

    getDelta(currentData, cat, key, isBudget = false) {
      try {
        if (cat.prevYearDataArray) {

          const compareData = isBudget? cat.budgetComparisonDataArray[key] : cat.prevYearDataArray[key];

          const valOne = this.getValue({cat, data: currentData}) || 0;
          const valTwo = compareData ? this.getValue({cat, data: compareData, isBudget}) : 0;

          let delta = 0;

          if (this.deltaType === 'nominal') {
            delta = valOne - valTwo;
          } else if (this.deltaType === '%' && valTwo != 0) {
            delta = (valOne / valTwo) * 100;
          } else if (this.deltaType === 'x' && valTwo != 0) {
            delta = valOne / valTwo;
          }

          if (this.deltaType === 'nominal') {
            return NumberFormatter.format(delta) + getDeltaPostfix(this.deltaType);
          } else {
            return Number.isInteger(delta) ? delta.toString() + getDeltaPostfix(this.deltaType) : delta.toFixed(2).toString() + getDeltaPostfix(this.deltaType);
          }
        } else {
          return '0.00'
        }
      } catch (e) {
        console.log(e);
      }

    },

    formatAggValue : function (category, isEmpty) {
      if (category.type === 'cashflow') {
        return  '-'
      }

      try {
        let value = 0;
        let bali = this.isBudget? 2 : 4;
        let pali = 0;

        if (this.cashbook) {
          bali = 5;
          pali = 1;
        }

        if ((category.sum || category.tag === 'unspecified' || category.tag === 'special' || category.tag === 'categorySum') && !isEmpty) {
          value = category.aggData;
        } else if (category.type == 'bal' && !isEmpty) {
          value = category.aggData.values[bali].value;
        } else if (category.type == 'pal' && !isEmpty) {
          value = category.aggData.values[pali].value;
        }

        if (this.invertCategories.indexOf(category.reference) >= 0) {
          value = value * -1;
        }

        if (category.reference === 'VatAndDuties' && category.vattype == 'receivable' && value < 0) {
          value = 0;
        } else if (category.reference === 'VatAndDuties' && category.vattype == 'payable' && value < 0) {
          value = value * -1;
        } else if (category.reference === 'VatAndDuties' && category.vattype == 'payable' && value > 0) {
          value = 0;
        }



        return NumberFormatter.format(value);
      } catch (e) {
        console.log('error', e);
      }

    },

    handleScroll : function(e) {
      this.scrolledDown = e.target.scrollTop > 0;
      this.scrolledRight = e.target.scrollLeft > 0;
      this.$refs.dynamictable.querySelector('.body .first-col .first-col-container').style.top = (0 - e.target.scrollTop) + 'px';
      this.$refs.dynamictable.querySelector('.head .main-cols').style.left = (0 - e.target.scrollLeft) + 'px';
    },

    handleWheelScroll : function(e) {
      if(window.navigator.userAgent.match(/Trident\/7\./)) {
        e.preventDefault();
        this.$refs.dynamictable.querySelector('.body .main-cols').scrollTop += e.deltaY;
      }
    },

    calculateTableProperties : function() {
      setTimeout(function() {
        if (this.$refs.dynamictable && this.$refs.dynamictable.querySelector('.container') && (this.isUnderPresentation || this.isPreviewPresentation)) {
          this.calculateProperty();
        } else if (!this.isUnderPresentation && !this.isPreviewPresentation){
          this.calculateProperty();
        }
      }.bind(this), 1000);
    },

    calculateProperty : function () {
      this.tableProps.cellWidth = 360;
      this.ui.loadPeriodsData = false;
      this.tableProps.tableWidth = this.$refs.dynamictable.querySelector('.container').offsetWidth;
      this.tableProps.maxCellWidth = Math.round(this.tableProps.tableWidth * 0.25);

      let firstCellWantedWidth = (this.longestAccountName * 10) + this.tableProps.additionalPadding;

      this.tableProps.firstCellWidth = firstCellWantedWidth > this.tableProps.maxCellWidth ? this.tableProps.maxCellWidth : firstCellWantedWidth;
      this.tableProps.remainingCellWidth = this.tableProps.tableWidth - this.tableProps.firstCellWidth - 17;

      let cols = this.periods.length + 1;
      let wantedCellWidth;
      if (!this.isBudget) {
        wantedCellWidth = Math.round(this.tableProps.remainingCellWidth / cols) - 1;
      } else {
        wantedCellWidth = Math.round(this.tableProps.remainingCellWidth / (cols - 1)) - 1;
      }

      this.tableProps.cellWidth = wantedCellWidth < this.tableProps.cellWidth ? this.tableProps.cellWidth : wantedCellWidth;
    },

    formatCategories : function () {
      const { total, prevYearTotal , aggTotal, budgetComparisonTotal } = this.totalsMap;

      var group = 0;
      var subGroup = 0;
      var bali = this.isBudget ? 2 : 4;
      var pali = 0;

      if (this.cashbook && !this.isBudget) {
        bali = 5;
        pali = 1;
      }

      try {
        this.categories.forEach(function (category) {

          if (category.level == 0) {
            group++;
          }

          if (category.level == 1) {
            subGroup++;
          }
          category.group = group;
          category.subGroup = subGroup;
          this.totalGroups = group;
          this.totalSubGroups = subGroup;

          if (category.tag === 'unspecified' || category.tag === 'sum' || category.type === 'cashflow' || category.tag === 'special' || category.tag === 'categorySum') {
            const totals = [];
            const prevYearTotals = [];
            const budgetComparisonTotals = [];

            const palBalIdx = category.type === 'pal' ? pali : bali;

            const commonArgs = {
              reference: category.reference,
              palBalIdx,
              palIdx: pali,
              balIdx: bali,
              cashbook: this.cashbook,
              isBudget: this.isBudget
            };

            try {
              category.dataArray.forEach((datum, index) => {
                const calcVal = calculateDefinition.calculate({index, referenceMap: total, ...commonArgs});
                totals.push(calcVal);
              });

              if (category.prevYearDataArray && !this.isBudget && !this.isUnderPresentation) {
                category.prevYearDataArray.forEach((datum, index) => {
                  prevYearTotals.push(calculateDefinition.calculate({index, referenceMap: prevYearTotal, ...commonArgs}));
                });
                category.prevYearDataArray = prevYearTotals;
              }

              const hasBudgetData = category.budgetComparisonDataArray && category.budgetComparisonData && Object.keys(category.budgetComparisonData).length !== 0;

              if (hasBudgetData && !this.isBudget) {
                const budgetArgs = {
                  ...commonArgs,
                  palBalIdx: category.type === 'pal' ? 0 : 2,
                  palIdx: 0,
                  balIdx: 2,
                  isBudget: true
                }

                category.budgetComparisonDataArray.forEach((datum, index) => {
                  budgetComparisonTotals.push(calculateDefinition.calculate({index, referenceMap: budgetComparisonTotal, ...budgetArgs}));
                });

                category.budgetComparisonDataArray = budgetComparisonTotals;
              }

              category.dataArray = totals;
                if (!this.isBudget) {
                  category.aggData = calculateDefinition.calculateAggregated({referenceMap: aggTotal, ...commonArgs});
                }
            } catch (e) {
              console.log('error', e);
            }

          }
        }.bind(this));
        this.ui.loading = false;
      } catch (error) {
        console.error(error);
      }

      this.collapseAll();

      this.calculateTableProperties();
    },

    getData : function () {
      this.ui.loading = true;
      this.ui.noData = false;
      this.ui.loadedDataSets = 0;

      const ac = new AccountCollection(true);

      ac.getAccounts()
        .then(res => { this.addOrderAndCategory(res) });

        this.isShowPreview ? entryDepartmentHelpers.changeDepartmentModel(this.getPresentationPageInfo?.entry_department_reference) : entryDepartmentHelpers.clearDepartmentModel(this.selectedDepartmentId)

      const presetFromDate = (this.previewPresentation || this.isBudget) ? this.presetFromDate : null;
      const presetToDate = (this.previewPresentation || this.isBudget) ? this.presetToDate : null;

      const requestsToMake = this.isBudget ? [this.loadBudgetCategories({
          fromDate: presetFromDate,
          toDate: presetToDate
        })]
        :
        [
          this.loadCategories({presetFromDate, presetToDate}),
          this.loadCategoriesPreviousYearData({presetFromDate, presetToDate}),
          this.loadBudgetCategories({
            fromDate: presetFromDate || DateRangeModel.getFromStringPadded(),
            toDate: presetToDate || DateRangeModel.getToStringPadded(),
            interval: this.selectedInterval
          })
        ];

      Promise.all(requestsToMake).then((res) => {
        this.currentData = res[0];
        this.previousYearData = res[1] || null;
        this.budgetComparisonData = res[2] || null;
        if (this.currentData?._embedded?.items?.length > 0) {
          this.onCategoriesLoaded(this.currentData, this.previousYearData, this.budgetComparisonData);
        } else {
          this.ui.noData = true;
          if(this.isBudgetView) {
            EventBus.$emit('showManageBudget', true);
          }
        }

        if (this.ui.loadedDataSets >= 2) {
          this.ui.loading = false;
          this.formatCategories();
        } else {
          this.ui.loadedDataSets++;
        }
      });

      this.getAggregateData();
      if(this.isSelectedCompany) {
        this.$store.dispatch('selectCompany', false);
      }
    },

    loadCategories({presetFromDate, presetToDate}) {
      const bdc = new BalanceDataCollection();
      if(this.isSelectedCompany) {
        return bdc.getCategories(this.selectedInterval, this.ui.reclassified, presetFromDate, presetToDate, this.isSelectedCompany)
      } else {
        return bdc.getCategories(this.selectedInterval, this.ui.reclassified, presetFromDate, presetToDate, null)
      }

    },

    loadBudgetCategories({fromDate, toDate, interval}) {
      const collection = new BalanceDataCollection();
      return collection.getBudgetCategoriesData(fromDate, toDate, interval);
    },

    loadCategoriesPreviousYearData({presetFromDate, presetToDate}) {
      if(this.isBudget) {
        return Promise.resolve(null);
      }

      const bdc = new BalanceDataCollection();
      return bdc.getCategoriesPreviousYearData(this.selectedInterval, this.ui.reclassified, presetFromDate, presetToDate);
    },

    onCategoriesLoaded(res, previousYearRes, budgetComparisonRes) {
      this.catmap =  res._embedded.items;
      const previousYearCatmap = previousYearRes?._embedded.items;
      const budgetComparisonCatMap = budgetComparisonRes?._embedded.items;

      this.periods = [];

      this.populateCategories({
        catmap: this.catmap,
        categories: this.categories,
        periods: this.periods,
        previousYearCatmap,
        budgetComparisonCatMap
      })

      this.addTotalPlaceHolders(this.categories);
    },

    //TODO: Move it to the standalone function later
    populateCategories({catmap, previousYearCatmap, categories, periods, budgetComparisonCatMap}) {
      try {
        catmap.forEach((cat) => {
          //Setting up periods
          periods.push(String(cat.granularity_key));

          let previousYearCat = null;
          let previousPeriodCat = null;
          let budgetComparisonCat = null;

          if (budgetComparisonCatMap) {
            budgetComparisonCat = findCorrespondingBudgetData({
              granularityKey: cat.granularity_key,
              budgetComparisonCatMap
            });
          }

          if (previousYearCatmap) {
            // previousPeriodCat = findCorrespondingPreviousPeriodData({
            //     granularityKey: cat.granularity_key,
            //     catmap,
            //     previousYearCatmap,
            //     selectedIntervalType: this.selectedInterval
            // });

            //Find corresponding previous year data
            previousYearCat = findCorrespondingPreviousYearData({
              granularityKey: cat.granularity_key,
              previousYearCatmap: previousYearCatmap
            });
          }
          if (cat._embedded?.items?.length > 0) {
            cat._embedded.items.forEach((item, idx) => {
              categories.forEach((category) => {
                if (category.id === item.grouping_id || category.sum) {
                  const previousYearDataItem = (previousYearCat?._embedded?.items) ? previousYearCat._embedded.items[idx] : null;
                  const budgetComparisonDataItem = (budgetComparisonCat?._embedded?.items) ? budgetComparisonCat._embedded.items[idx] : null;
                  //const previousPeriodDataItem = (previousPeriodCat?._embedded?.items) ? previousPeriodCat._embedded.items[idx] : null;
                  this.populateCategory({
                    category,
                    dataItem: item,
                    previousYearDataItem,
                    budgetComparisonDataItem
                    //previousPeriodDataItem
                  })
                }
              });
            });
          }

          this.periods.length ? this.$store.dispatch('setPeriodsData', true) : this.$store.dispatch("setPeriodsData", false);
        });
      } catch (e) {
        console.log(e);
      }


    },

    populateCategory({category, dataItem, previousYearDataItem, budgetComparisonDataItem}) {
      const isCalculatedCategory = category.tag === 'unspecified' || category.type === 'cashflow' || category.tag === 'special' || category.tag === 'categorySum';

      if (!category.data || (category.dataArray && category.dataArray.length >= this.periods.length) || isCalculatedCategory) {
        category.data = {};
        category.dataArray = [];
      }

      if (!category.prevYearData ||  (category.prevYearDataArray && category.prevYearDataArray.length >= this.periods.length) || isCalculatedCategory) {
        category.prevYearData = {};
        category.prevYearDataArray = [];
      }

      if (!category.budgetComparisonData || !budgetComparisonDataItem || (category.budgetComparisonDataDataArray && category.budgetComparisonDataDataArray.length >= this.periods.length) || isCalculatedCategory) {
        category.budgetComparisonData = {};
        category.budgetComparisonDataArray = [];
      }

      if (!category.data[dataItem.granularity_key]) {
        category.data[dataItem.granularity_key] = {};

        if (previousYearDataItem) {
          category.prevYearData[previousYearDataItem.granularity_key] = {};
        }

        if (budgetComparisonDataItem) {
          category.budgetComparisonData[budgetComparisonDataItem.granularity_key] = {};
        }
      }

      if (previousYearDataItem && category.prevYearDataArray) {
        category.prevYearData[previousYearDataItem.granularity_key] = previousYearDataItem;
        category.prevYearDataArray.push(previousYearDataItem);
      } else {
        category.prevYearDataArray.push(null);
      }

      if (budgetComparisonDataItem && category.budgetComparisonDataArray) {
        category.budgetComparisonData[budgetComparisonDataItem.granularity_key] = budgetComparisonDataItem;
        category.budgetComparisonDataArray.push(budgetComparisonDataItem);
      }

      category.data[dataItem.granularity_key] = dataItem;
      if (category.dataArray) {
        category.dataArray.push(dataItem);
      }

      //If it has an id - its data is calculated on the backend side
      if (category.id) {
        this.totalsMap.total[category.reference] = category.dataArray;
        this.totalsMap.prevYearTotal[category.reference] = category.prevYearDataArray;
        this.totalsMap.budgetComparisonTotal[category.reference] = category.budgetComparisonDataArray;
      }
    },


    addOrderAndCategory : function(res) {
      if (res && res.data && res.data.map) {
        this.accounts = res.data.map;
        this.accounts.forEach(function (account) {
          this.categories.forEach(function (cat) {
            if (cat.reference == account.reference) {
              cat.type = account.type;
              cat.order = account.order;
            }
          });

        }.bind(this));
      } else {
        this.ui.noData = true;
      }

      if (this.ui.loadedDataSets >= 2) {
        this.ui.loading = false;
        this.formatCategories();
      } else {
        this.ui.loadedDataSets++;
      }
    },

    getPresentationData() {
      this.ui.loading = true;

      const args = {
        token: this.presentationToken,
        presentationId: this.presentationId,
        pageId: this.presentationPage.id,
        pageSize: 100,
        pageNumber: 1,
        pageType: 'financial-report'
      };

      const requests = [PresentationTemplateCollection.getFinancialReportByRangeData({...args})];

      if (this.presentationPage.budget_included) {
        requests.push(PresentationTemplateCollection.getFinancialReportByRangeData({...args, pageType: 'financial-report-budget'}))
      }

      try {
        this.ui.noData = false;
        this.ui.loadedDataSets = 0;
        this.getPresentationAccounts();
        Promise.all(requests)
          .then(res => {
            this.onFinReportLoaded(res);
            this.getPresentationAggregateData();
          });
      } catch (error) {
        console.error(error);
      }
    },

    onFinReportLoaded(res) {
      const maxDataSets = 2;
      const reportData = res[0]._embedded?.items || null;
      const budgetComparisonData = res[1]?._embedded?.items || null;

      if (reportData) {
        this.catmap =  reportData;
        this.periods = [];

        this.populateCategories({
          catmap: reportData,
          categories: this.categories,
          periods: this.periods,
          budgetComparisonCatMap: budgetComparisonData
        })

        this.addTotalPlaceHolders(this.categories);

      } else {
        this.ui.noData = true;
      }

      if (budgetComparisonData) {
        this.ui.showBudgetComparison = true;
      }

      if (this.ui.loadedDataSets >= maxDataSets) {
        this.ui.loading = false;
        this.formatCategories();
      } else {
        this.ui.loadedDataSets++;
      }

    },

    addTotalPlaceHolders(categories) {
      let totalsPlaceholder = [];

      for (let i = 0; i < this.periods.length; i++) {
        totalsPlaceholder.push(0);
      }

      categories.forEach(function (category) {
        if (category.sum || (category.tag === 'unspecified') || category.type === 'cashflow' || category.tag === 'special' || category.tag === 'categorySum') {
          category.dataArray = totalsPlaceholder;
          category.prevYearDataArray = totalsPlaceholder;
          category.prevPeriodDataArray = totalsPlaceholder;
          category.budgetComparisonDataArray = totalsPlaceholder;
        }
      });
    },

    getPresentationAggregateData() {
      const args = {
        token: this.presentationToken,
        presentationId: this.presentationId,
        pageId:  this.presentationPage.id,
        pageType: 'financial-report-range',
        pageSize: 100,
        pageNumber: 1
      }

      PresentationTemplateCollection.getFinancialReportByRangeData(args)
        .then(this.onAggregatedCategoriesLoaded);
    },

    getAggregateData : function (only) {
      if (only) {
        this.ui.loadedDataSets = 2;
        this.ui.loading = true;
      }

      //Determine latest financial year
      let reqFromDate = this.isPreviewPresentation ? this.fromDate : DateRangeModel.getFromStringPadded();
      let reqToDate = this.isPreviewPresentation ? this.toDate : DateRangeModel.getToStringPadded();

      let toDate = this.isPreviewPresentation ? this.toDate : DateRangeModel.getToDate();
      let toStamp = moment(toDate).unix();
      let finYears = this.erp.financialYears;
      let specifiedFinYear = null;

      const source = this.isBudget ? 'budget' : this.ui.reclassified ? 'reclassified' : 'bookkeeping';

      if (finYears) {
        finYears.forEach(function (finYear) {
          if (moment(finYear.start).unix() <= toStamp && moment(finYear.end).unix() >= toStamp) {
            specifiedFinYear = finYear;
          }
        });
      }

      if (specifiedFinYear && this.compare == 'end_year_to_date') {
        let specFinYearDateFrom = moment(specifiedFinYear.start).toDate();
        let specFinYearStringFrom = DateRangeModel.paddedDateString(specFinYearDateFrom);
        reqFromDate = specFinYearStringFrom;

        let bdc = new BalanceDataCollection(reqFromDate, reqToDate);
        bdc.getAggregateCategories(reqFromDate, reqToDate, source)
          .then(this.onAggregatedCategoriesLoaded);

      } else if (specifiedFinYear && this.compare === 'end_year_total') {
        let specFinYearDateFrom = moment(specifiedFinYear.start).toDate();
        let specFinYearStringFrom = DateRangeModel.paddedDateString(specFinYearDateFrom);
        reqFromDate = specFinYearStringFrom;

        let specFinYearDateTo = moment(specifiedFinYear.end).toDate();
        let specFinYearStringTo = DateRangeModel.paddedDateString(specFinYearDateTo);
        reqToDate = specFinYearStringTo;

        let bdc = new BalanceDataCollection(reqFromDate, reqToDate);
        bdc.getAggregateCategories(reqFromDate, reqToDate, source)
          .then(this.onAggregatedCategoriesLoaded);
      } else if (specifiedFinYear) {
        let specFinYearDateFrom = moment(specifiedFinYear.start).toDate();
        let specFinYearStringFrom = DateRangeModel.paddedDateString(specFinYearDateFrom);
        reqFromDate = specFinYearStringFrom;

        let specFinYearDateTo = moment(specifiedFinYear.end).toDate();
        let specFinYearStringTo = DateRangeModel.paddedDateString(specFinYearDateTo);
        reqToDate = specFinYearStringTo;

        let bdc = new BalanceDataCollection(reqFromDate, reqToDate);
        bdc.getAggregateCategories(null, null, source)
          .then(this.onAggregatedCategoriesLoaded);
      } else {
        let bdc = new BalanceDataCollection(reqFromDate, reqToDate);
        bdc.getAggregateCategories(null, null, source)
          .then(this.onAggregatedCategoriesLoaded);
      }

      var reqFromYear = reqFromDate.split('-')[0];
      var reqToYear = reqToDate.split('-')[0];
      if (this.isBudgetView && this.isImportBudgetStatus && this.getPrevYearBudgetDate) {
        this.compareYear = moment(this.getPrevYearBudgetDate[0]).format('YYYY') + '/' + moment(this.getPrevYearBudgetDate[1]).format('YYYY');
      } else {
        reqFromYear === reqToYear ? this.compareYear = reqToYear : this.compareYear = `${reqFromYear}/${reqToYear}`;
      }
    },

    onAggregatedCategoriesLoaded(res) {
      const maxDataSets = this.isUnderPresentation ? 1 : 2;

      if (!this.isImportBudgetStatus ) {
        if (res?._embedded.items?.length > 0) {
          this.aggregateCategories =  res._embedded.items;

          this.aggregateCategories.forEach(function (cat) {
            this.categories.forEach(function (category) {
              if (category.id == cat.grouping_id) {
                category.aggData = cat;
                this.totalsMap.aggTotal[category.reference] = cat;
              }
            }.bind(this));
          }.bind(this));
        } else {
          this.ui.noData = true;
          if(this.isBudgetView) {
            EventBus.$emit('showManageBudget', true);
          }
        }
      } else {
        this.$store.dispatch('importBudget', false)
        this.$store.dispatch('setPreviousYearBudgetDate', null);
      }

      if (this.ui.loadedDataSets >= maxDataSets) {
        this.ui.loading = false;
        this.formatCategories();
      } else {
        this.ui.loadedDataSets++;
      }
    },

    toggleCashbook: function () {
      this.$store.dispatch('toggleDashboardCashbook');
    },

    changeInterval : function(interval) {
      this.$store.dispatch('setInterval', interval);
      this.closeAllOptions();
    },


    getUnspecifiedTitle : function (category) {
      return this.ui.dictionary.kpiCategories.unspecified + ' ' + this.ui.dictionary.kpiCategories[category];
    },

    changeDeltaType(type) {
      this.deltaType = type;
      this.closeAllOptions();
    },

    getSelectedDepartment(department) {
      this.selectedDepartmentId = department;
    }

  };

  const computed = {
    //TODO: DRY!!! Move it to the separate mixin
    UICashbookState() {
      return this.$store.getters.cashbook;
    },

    isCashbookActive() {
      const {ONLY_CASHBOOK, CASHBOOK} = cashbookStates;
      return this.UICashbookState === CASHBOOK || this.UICashbookState === ONLY_CASHBOOK;
    },

    selectedInterval() {
      const { DAY, WEEK, MONTH } = intervalOptions;
      let interval = this.isBudget ? MONTH : this.$store.getters.interval;
      //Minimal interval for BalanceView is month
      interval = (interval === DAY || interval === WEEK)? MONTH : interval;

      return interval;
    },

    presentationId() {
      return this.$store.getters.presentationId;
    },
    presentationToken() {
      return this.$store.getters.presentationToken;
    },
    presentationPage() {
      return this.$store.getters.presentationPage;
    },
    isUnderEditPresentation() {
      return this.$store.getters.presentationEditMode;
    },
    isUnderPresentation() {
      return this.$store.getters.presentationMode;
    },
    longestAccountName() {
      let width = 0;
      this.categories.map((category) => {
        const categoryReferenceLength = category.reference && category.reference.length ? category.reference.length : 0;
        if (categoryReferenceLength > width) {
          width = categoryReferenceLength
        }
      });

      return width;
    },
    dataFinReportIsLoad() {
      return this.$store.getters.finReportIsLoaded;
    },
    isPreviewPresentation() {
      return this.$store.getters.showPreview;
    },
    isSelectedCompany() {
      return this.$store.getters.selectCompany;
    },
    presetDates() {
      return {fromDate: this.presetFromDate, toDate: this.presetToDate}
    },
    isImportBudgetStatus() {
      return this.$store.getters.isImportBudget;
    },
    getPrevYearBudgetDate() {
      return this.$store.getters.budgetPreviousYear;
    },
    isBudgetView() {
      return this.$route.fullPath === '/account/overview/budget';
    },
    entryDepartmentsEnabled() {
      const context = ContextModel.getContext();
      const company = context ? context.company : CompanyModel.getCompany();
      return company?.settings?.entry_department && this.profile?.roles?.indexOf && this.profile.roles.indexOf('entry_department_role') >= 0
    },

    getPresentationPageInfo() {
      return this.$store.getters.presentationPage;
    },

    isShowPreview() {
        return this.$store.getters.showPreview;
    }
  };

  const watch = {
    selectedInterval(cal) {
      this.getData();
    },
    presentationPage(page) {
      if (this.previewPresentation) {
        this.init();
      } else if (page.intervals){
        this.changeInterval(page.intervals);
      }
    },
    isCashbookActive(val) {
      if (!this.previewPresentation) {
        this.cashbook = val;
      }
      this.formatCategories();
    },
    presentationInfoFlag : function (pageNumber) {
      const financial_report_source = this.isBudget ? 'budget' : this.ui.reclassified ? 'reclassified' : 'bookkeeping';

      let entryDepartment = EntryDepartmentModel.getEntryDepartment()?.id;

      this.processReportPageInfo({
        start_date :  DateRangeModel.getFromString(),
        end_date : DateRangeModel.getToString(),
        range_select_from_date : DateRangeModel.getFromString(),
        range_select_to_date : DateRangeModel.getToString(),
        financial_report_source,
        financial_report_grouping : 'category',
        intervals : this.selectedInterval,
        settings: {openedRows: [...this.openedRows], deltaType: this.deltaType},
        cashbook: this.cashbook ? 'true' : 'false',
        context: reportPageTypes.FINANCIAL_REPORT,
        number: pageNumber,
        front_page: false,
        kpi_drill_down: null,
        dashboard: null,
        pseudo_dashboard: null,
        budget_included: this.isBudget || this.ui.showBudgetComparison,
        realized_included: !this.isBudget,
        entry_department: entryDepartment ? entryDepartment : null
      });
    },

    deltaType(deltaType) {
      this.onCategoriesLoaded(this.currentData, this.previousYearData, this.budgetComparisonData);
      this.formatCategories();
    },
    presetDates() {
      if(this.isBudget) {
        this.getData();
      }
    },

    'selectedDepartmentId': function (val, oldVal) {
      if(val !== oldVal) {
        this.getData();
      }
    }
  };

  export default {
    props: ['presentationInfoFlag', 'processReportPageInfo', 'previewPresentation', 'presetFromDate', 'presetToDate', 'presetFinancialReportSource', 'presetCashbook', 'presetIntervals', 'isBudget', 'presetBudgetComparison', 'presetDeltaType'],
    data: bindings,
    computed,
    watch,
    methods: methods,
    components: {
      'date-picker': datePicker,
      'switch-with-labels': switchWithLabels,
      'intervals-selector': intervalsSelector,
      'delta-selector': deltaSelector,
      'entry-departments': entryDepartments
    },
    mounted: function () {
      this.init();
    }
  };
</script>


