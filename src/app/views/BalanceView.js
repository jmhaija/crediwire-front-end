/* global saveAs */


define([

    'Vue',
    'FileSaver',
    'moment',
    'models/DictionaryModel',
    'models/ErpModel',
    'models/DateRangeModel',
    'models/AssetModel',
    'models/UserModel',
    'models/ContextModel',
    'collections/BalanceDataCollection',
    'elements/date-picker',
    'elements/tutorial-slide',
    'elements/valid-ledger',
    'services/PersistentSettings',
    'services/EventBus',
    'services/NumberFormatter',
    'services/Tutorial',
    'services/Toast',
    'collections/LedgerEntryCollection',
    'views/LedgerView',
    'elements/line-chart',
    'elements/modals/ledger-modal',
    'elements/switch-with-labels',
    'elements/dropdown/intervals-selector',
    'elements/dropdown/delta-selector',
    'models/BudgetFileModel',
    'constants/ui/cashbook',
    'constants/ui/intervals',
    'store/dashboardMutationTypes',
    'config/tutorial-static-data',
    'models/CompanyModel',
    'elements/entry-departments',
    'services/Config',
    'models/EntryDepartmentModel',
    'helpers/entryDepartmentHelpers'
], function(Vue, FileSaver, moment, DictionaryModel, ErpModel, DateRangeModel, AssetModel, UserModel, ContextModel, BalanceDataCollection, datePicker, tutorialSlide, validLedger, PersistentSettings, EventBus, NumberFormatter, Tutorial, Toast, LedgerEntryCollection, LedgerView, lineChart, ledgerModal, switchWithLabels, intervalsSelector, deltaSelector, BudgetFileModel, cashbookStates, intervalOptions, dashboardMutationTypes, tutorialStaticData, CompanyModel, entryDepartments, Config, EntryDepartmentModel, entryDepartmentHelpers) {
    var template = [
        '<article ref="balancesheet" class="manage-dashboards manage-kpis balance-table">',

        '   <section v-show="ui.loading">',
        '       <div class="working" :class="{\'loader-centered\' : $route.fullPath === \'/account/overview/budget\'}"></div>',
        '   </section>',

        '   <section v-show="!ui.loading">',

        '       <div class="graph-bar" v-show="!presets && !preview && !presentation">',
        '           <div class="right trial-balance-float-right">',

        '               <div v-show="profile.roles && context && budgetFile" class="onoff-selector primary" style="margin-right: 0;" :class="{ active : isBudgetOn }" v-on:click="toggleBudget()"><span v-show="budgetType == \'company\'">{{ui.dictionary.budget.defaultVersion}}</span><span v-show="budgetType == \'file\'">{{ui.dictionary.budget.loadedVersion}}</span></div>',
        '                   <div class="selector inline" v-show="profile.roles && context && budgetFile">',
        '                       <div class="label" v-on:click.stop="ui.showBudgetOptions = true">',
        '                           <i class="cwi-down"></i>',
        '                           <div class="options" v-bind:class="{ show : ui.showBudgetOptions }" style="left: -210px;">',
        '                               <div class="option" v-bind:class="{ selected : budgetType == \'company\' }" v-on:click.stop="changeBudgetType(\'company\')">{{ui.dictionary.budget.defaultVersion}}</div>',
        '                               <div class="option" v-bind:class="{ selected : budgetType == \'file\' }" v-on:click.stop="changeBudgetType(\'file\')">{{ui.dictionary.budget.loadedVersion}}</div>',
        '                           </div>',
        '                       </div>',
        '                   </div>',


        '                   <switch-with-labels v-model="ui.section" firstValue="table" secondValue="timeline" @input="changeSection" style="margin: 19px 1rem 0 0;" v-show="profile.roles && profile.roles.indexOf(\'trial_balance_over_time_role\') >= 0">',
        '                       <span data-test-id="selectTable" slot="label-left" :class="[ui.section === \'table\' ? \'primary-color\' : \'faded\']">{{ui.dictionary.salesPotential.tableView}}</span>',
        '                       <span data-test-id="selectTimeline" slot="label-right" :class="[ui.section === \'timeline\' ? \'primary-color\' : \'faded\']">{{ui.dictionary.salesPotential.timelineView}}</span>',
        '                   </switch-with-labels>',


        '               <div data-test-id="onCashbook" class="onoff-selector primary" :class="{ active : isCashbookActive }" v-on:click="toggleCashbook()"> {{ui.dictionary.overview.cashbook}}</div>',

        '               <div v-show="entryDepartmentsEnabled" class="context-container margin-dropdown">',
        '                   <entry-departments @getDepartmentId="getSelectedDepartment" :selectedDepartmentId="selectedDepartmentId"></entry-departments>',
        '               </div>',

        '               <intervals-selector data-test-id="selectInterval" :intervalOptions="intervalOptions" class="pullup"/>',

        '                <div class="selector small fade pullup" :class="{ hidden : ui.hidden }">',
        '                    <label>{{ui.dictionary.overview.validLedger}}</label>',
        '                    <valid-ledger></valid-ledger>',
        '                </div>',

        '           </div>',
        '           <div class="trial-balance-date-picker">',
        '               <date-picker :onDateChange="loadData"></date-picker>',
        '           </div>',
        '       </div>',


        '       <div class="graph-bar secondary" v-show="!presets && !preview && ui.section == \'table\' && !presentation">',
        '           <div class="right" v-show="ui.showTable">',
        '               <div data-test-id="onBudget" v-show="profile.roles && (!context || !budgetFile) && !hideBudgetToggle & !isUnderEditPresentation && !isUnderPresentation" class="onoff-selector primary" :class="{ active : isBudgetOn }" v-on:click="toggleBudget();">{{ui.dictionary.overview.budget}}</div>',
        '               <div data-test-id="onPreviousPeriod" v-show="!isUnderEditPresentation && !isUnderPresentation" class="onoff-selector inline-selector" :class="{ active : ui.previous }" v-on:click="togglePrevious();">{{ui.dictionary.overview.previousYear}}</div>',

        '             <div class="selector small pullup delta-trial-balance" v-show="isBudgetOn || ui.previous">',
        '                 <label>{{ui.dictionary.palbal.delta}}</label>',
        '                 <div data-test-id="openDeltaOptions" class="label" v-on:click.stop="ui.deltaOptions = true">',
        '                   <span v-show="deltaType == \'nominal\'">{{ui.dictionary.meta.nominal}}</span>',
        '                   <span v-show="deltaType != \'nominal\'">{{deltaType}}</span>',
        '                   <i class="cwi-down"></i>',
        '                   <div class="options" v-bind:class="{ show : ui.deltaOptions }">',
        '                       <div data-test-id="nominal" class="option" v-on:click.stop="changeDeltaType(\'nominal\')">',
        '                           <span>{{ui.dictionary.meta.nominal}}</span>',
        '                       </div>',
        '                       <div data-test-id="deltaPercent" class="option" v-on:click.stop="changeDeltaType(\'%\')">',
        '                           <span>%</span>',
        '                       </div>',
        '                       <div data-test-id="deltaX" class="option" v-on:click.stop="changeDeltaType(\'x\')">',
        '                           <span>x</span>',
        '                       </div>',
        '                   </div>',
        '                 </div>',
        '             </div>',

        '               <div class="onoff-selector inline-options">',
        '               <a href="#" v-on:click.prevent="expandAll()">{{ui.dictionary.palbal.expandAll}}</a>',
        '               &nbsp; | &nbsp;',
        '               <a href="#" v-on:click.prevent="collapseAll()">{{ui.dictionary.palbal.collapseAll}}</a>',
        '               &nbsp; | &nbsp;',
        '               <v-popover :open="showDownloadTrialBalanceTutorial()" placement="bottom">',
        '                   <i class="cwi-save export" v-on:click.stop="ui.exportOptions = true" v-if="!isUnderEditPresentation"></i>',
        '                   <div class="selector inline" v-if="!isUnderEditPresentation">',
        '                       <div class="label" v-on:click.stop="ui.exportOptions = true">',
        '                           <span>{{ui.dictionary.palbal.export.action}}</span> <i class="cwi-down"></i>',
        '                           <div class="options" v-bind:class="{ show : ui.exportOptions }">',
        '                               <div class="option" v-on:click.stop="exportToExcel()">',
        '                                   <img class="export-type-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACu0lEQVRoQ+2ZMWzTQBSG/2dolIFIjIWhQqpEUCLROLCwkTGFIsIAatkAtdAJUalb1IhsSI2YWqgETBTUgUY0qGPYGGgLhQVYYKEwVgpDhVCMnoOPq+uE2EnrM/ItSZw7+//e+987yyYEfFDA9SME8DuDYQb+1wxQYirdv+9XXSci3SCkANLfF9cOdRu4YwslC8kIfvYkNE3TAUMnkG4AA0SI2cW+K651fD37OV2dMD4Zj+3viQ4QaaZQgsHRTRAo0k5k9xQgWUj2avWIbtSNFAvm6MJAPxG5gpbB9hTgeD5ttBNVN3P60n1upou5BvD2Ra6sOy1uGk2VAFh4JVd21BoCuPGEVwuFGXAT5VZz12+vir+Hyjnz+9L5xaZLrDnKZMBXgMunRjCZnRDRyi8W8PzNkvgdix7A8q0KYtHGBnxneRqPX81vi66vAKyEBR4+2Lid+bq5gcHSkBDIcAzJ4+P3T7g4M7zDGr4X8ckjJ/DgypwQdvXhKFa+rJpQDGcN67idwHcAFnR3ZBqZY6dNba8/r+DaozEUcwWc0xvZYFuxvZyG7xZiUfZo35yfMKF41LZ+IFs6Y34qC8DCbmTGcD0z+kd0rWXhyiBKZIAFccdZGH8qCrpV4coAStSABSC3TKsrXZoZbmofnqMMgNwyNza/iUzcq85htnrf0f98UAkLya2UizX/bEoUMYvMls6CoZQtYnkzsyLOewODya1VSYDt3edvy7RvcNxaqx9e7mDwtQbivUexMP5EiLL7Xd7Mals100r2/cBXANkm7HEWKA/7Bsc3cnxDp+Q+0LTN/OMPJbqQV/HKtNFOAHytgU6EW2tDAIcohs+F3FjLs4UMrFculFNO12qagcA/3HWiDdTj9XatEagXHO1CAQjOKyYXULsy1fPbll1R4+GkIYCHoHV1SZiBrobTw8l+Ay2Al0BP3OV8AAAAAElFTkSuQmCC">',
        '                                   <span>{{ui.dictionary.palbal.export.excel}}</span>',
        '                               </div>',
        '                           </div>',
        '                       </div>',
        '                   </div>',
        '                   <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>',
        '               </v-popover>',
        '               </div>',

        '           </div>',

        '       </div>',

        '       <div class="right" style="float: right;" v-show="ui.section == \'table\' && isUnderPresentation">',
        '          <a data-test-id="expandAll" href="#" v-on:click.prevent="expandAll()">{{ui.dictionary.palbal.expandAll}}</a>',
        '             &nbsp; | &nbsp;',
        '          <a data-test-id="collapseAll" href="#" v-on:click.prevent="collapseAll()">{{ui.dictionary.palbal.collapseAll}}</a>',
        '             &nbsp; | &nbsp;',
        '       </div>',


        '       <div v-show="ui.noData && !isBudgetOn" class="extra-padded">',
        '           <p>{{ui.dictionary.overview.noPublicData}}</p>',
        '       </div>',
        '       <div v-show="ui.noErp && !isBudgetOn" class="extra-padded">',
        '           <p>{{ui.dictionary.overview.noErp}}</p>',
        '       </div>',


        '<article ref="dynamictable" v-if="ui.showTable && !presets && ui.section == \'table\'">',
        '   <div class="dynamic-table" :class="[isUnderEditPresentation ? \'extra-margin\' : \'\']">',
        '       <div class="container with-margin">',

        '           <div class="row head tabular-heading" :style="{ width : tableProps.tableWidth - 17 + \'px\' }">',
        '               <div class="first-col tabular-heading" :class="{ \'scrolled-right\': scrolledRight }" :style="{ width : tableProps.firstCellWidth + \'px\' }">',
        '                   <div class="cell" :style="{ width : tableProps.firstCellWidth + \'px\' }" style="padding: 0;">',
        '                       <span v-show="profile && profile.roles && profile.roles.indexOf(\'trial_balance_over_time_role\') >= 0 && !preview && !presentation" class="timeline-checkmark tooltip"><i class="cwi-graph icon"></i> <div class="message right">{{ui.dictionary.salesPotential.includeInTimeline}}</div></span>',
        '                       <span class="cell-value">{{ui.dictionary.palbal.account}}</span>',
        '                   </div>',
        '               </div',
        '               ><div class="main-cols">',
        '                   <div class="cell"',
        '                        v-for="(period, i) in table.periods"',
        '                        :style="{ width : tableProps.cellWidth + \'px\' }">',
        '                       <span class="cell-value">',
        '                           <span>{{formatPeriod(period)}}</span>',
        '                           <span class="budget" v-show="isBudgetOn && !simple" :style="{ width : tableProps.cellWidth / 3.5 + \'px\'}">{{ui.dictionary.overview.budget}}</span>',
        '                           <span class="budget" v-show="ui.previous" :style="{ width : tableProps.cellWidth / 3.5 + \'px\'}">{{ui.dictionary.overview.previous}}</span>',
        '                           <span class="budget" v-show="(isBudgetOn && !simple) || ui.previous" :style="{ width : tableProps.cellWidth / 3.5 + \'px\'}">{{ui.dictionary.palbal.delta}}</span>',
        '                       </span>',
        '                   </div>',
        '               </div>',
        '           </div>',


        '           <div class="body">',
        '               <div class="first-col" :class="{ \'scrolled-right\': scrolledRight }" :style="{ width : tableProps.firstCellWidth + \'px\' }">',
        '                   <div class="first-col-container">',

        '                       <div class="row separator tabular-altrow">',
        '                           <div class="cell" :style="{ width : tableProps.firstCellWidth + \'px\' }">',
        '                               <span class="cell-value">{{ui.dictionary.palbal.pal}}</span>',
        '                           </div>',
        '                       </div>',

        '                       <div class="row"',
        '                            v-for="(palAccount, index) in table.pal"',
        '                            :class="getClass(palAccount.type, palAccount.group)"',
        '                            v-show="showAccount(palAccount)">',

        '                           <div class="cell" :style="{ width : tableProps.firstCellWidth + \'px\'}">',
        '                               <span class="cell-value" :title="palAccount.name">',


        '                                   <span class="timeline-checkmark" v-show="!isUnderPresentation && !isShowPreview && !presentation && profile && profile.roles && profile.roles.indexOf(\'trial_balance_over_time_role\') >= 0 && (palAccount.type == \'pal\' || palAccount.type == \'sum\')">',
        '                                       <div class="checkbox-field">',
        '                                           <label><input data-test-id="selectItemValue" type="checkbox" @change="getValue(palAccount)" v-model="palAccount.timeline"><i></i></label>',
        '                                       </div>',
        '                                   </span>',

        '                                   <span class="timeline-checkmark" v-if="isUnderEditPresentation && !isShowPreview && !presentation && profile && profile.roles && profile.roles.indexOf(\'trial_balance_over_time_role\') >= 0 && (palAccount.type == \'he2\')">',
        '                                       <div class="checkbox-field">',
        '                                           <label><input data-test-id="selectItemValue" type="checkbox" @change="getValue(palAccount)" v-model="palAccount.timeline"><i></i></label>',
        '                                       </div>',
        '                                   </span>',


        '                                   <span class="clickable" v-show="showPlus(palAccount) && hasChildren(\'pal\', index)" v-on:click="showGroup(palAccount.group)"><span class="pm">+</span> {{palAccount.name}}</span>',
        '                                   <span class="clickable" v-show="showMinus(palAccount) && hasChildren(\'pal\', index)" v-on:click="hideGroup(palAccount.group)"><span class="pm">&ndash;</span> {{palAccount.name}}</span>',
        '                                   <span v-on:click="openLedger(palAccount)" :class="{ clickable : palAccount.type == \'pal\' && profile.roles && profile.roles.indexOf(\'entry_role\') >= 0 && !isUnderEditPresentation && !isUnderPresentation  }" v-show="(!showPlus(palAccount) && !showMinus(palAccount)) || !hasChildren(\'pal\', index)">{{palAccount.name}}</span>',
        '                               </span>',
        '                           </div>',
        '                       </div>',


        '                       <div class="row separator padded" v-show="table.bal.length">',
        '                           <div class="cell" :style="{ width : tableProps.firstCellWidth + \'px\' }">',
        '                               <span class="cell-value">{{ui.dictionary.palbal.bal}}</span>',
        '                           </div>',
        '                       </div>',

        '                       <div class="row"',
        '                            v-for="(balAccount, index) in table.bal"',
        '                            :class="getClass(balAccount.type, balAccount.group)"',
        '                            v-show="showAccount(balAccount)">',

        '                           <div class="cell" :style="{ width : tableProps.firstCellWidth + \'px\' }">',
        '                               <span class="cell-value" :title="balAccount.name">',



        '                                   <span class="timeline-checkmark" v-show="!isUnderPresentation && !isShowPreview && profile && profile.roles && profile.roles.indexOf(\'trial_balance_over_time_role\') >= 0 && (balAccount.type == \'bal\' || balAccount.type == \'sum\')">',
        '                                       <div class="checkbox-field test">',
        '                                           <label><input type="checkbox" @change="getValue(balAccount)" v-model="balAccount.timeline"><i></i></label>',
        '                                       </div>',
        '                                   </span>',

        '                                   <span class="timeline-checkmark" v-if="isUnderEditPresentation && !isShowPreview && !presentation && profile && profile.roles && profile.roles.indexOf(\'trial_balance_over_time_role\') >= 0 && (balAccount.type == \'he2\')">',
        '                                       <div class="checkbox-field">',
        '                                           <label><input type="checkbox" @change="getValue(balAccount)" v-model="balAccount.timeline"><i></i></label>',
        '                                       </div>',
        '                                   </span>',

        '                                   <span class="clickable" v-show="showPlus(balAccount) && hasChildren(\'bal\', index)" v-on:click="showGroup(balAccount.group)"><span class="pm">+</span> {{balAccount.name}}</span>',
        '                                   <span class="clickable" v-show="showMinus(balAccount) && hasChildren(\'bal\', index)" v-on:click="hideGroup(balAccount.group)"><span class="pm">&ndash;</span> {{balAccount.name}}</span>',
        '                                   <span v-on:click="openLedger(balAccount)" :class="{ clickable : balAccount.type == \'bal\' && profile.roles && profile.roles.indexOf(\'entry_role\') >= 0 && !isUnderEditPresentation && !isUnderPresentation }" v-show="(!showPlus(balAccount) && !showMinus(balAccount)) || !hasChildren(\'bal\', index)">{{balAccount.name}}</span>',
        '                               </span>',
        '                           </div>',
        '                       </div>',


        '                   </div>',
        '               </div',
        '               ><div class="main-cols" v-on:scroll="handleScroll"',
        '                                       v-on:wheel="handleWheelScroll"',
        '                                       :style="{ width : tableProps.tableWidth + \'px\', marginLeft : (0 - tableProps.firstCellWidth)  + \'px\', paddingLeft : tableProps.firstCellWidth  + \'px\' }">',
        '                   <div class="main-cols-container">',

        '                       <div class="row separator tabular-altrow">',
        '                           <div class="cell"',
        '                                v-for="period in table.periods"',
        '                                :style="{ width : tableProps.cellWidth + \'px\' }">',
        '                               <span class="cell-value">&nbsp;</span>',
        '                           </div>',
        '                       </div>',

        '                       <div class="row"',
        '                           v-for="(palAccount, index) in table.pal"',
        '                           :class="getClass(palAccount.type, palAccount.group)"',
        '                           v-show="showAccount(palAccount)">',

        '                           <div class="cell" :class="{ \'tabular-altrow\' : palAccount.group % 2 != 0 }"',
        '                                v-for="(value, key) in palAccount.values"',
        '                                :style="{ width : tableProps.cellWidth + \'px\' }">',

        '                               <span class="cell-value">',
        '                                   <span v-show="!isHeading(palAccount.type)">{{formatNumber(value)}}</span>',

        '                                   <span class="budget" v-show="!isHeading(palAccount.type) && ui.previous" :style="{ width : tableProps.cellWidth / 3.5 + \'px\'}">{{formatNumber(palAccount.previous[key])}}</span>',

        '                                   <span class="budget" v-show="!isHeading(palAccount.type) && ui.previous" :style="{ width : tableProps.cellWidth / 3.5 + \'px\'}">{{getCompareRealDelta(value, palAccount.previous[key])}}</span>',

        '                                   <span class="budget" v-show="!isHeading(palAccount.type) && isBudgetOn && !simple" :style="{ width : tableProps.cellWidth / 3.5 + \'px\'}">{{formatNumber(palAccount.budget[key])}}</span>',
        '                                   <span class="budget" v-show="!isHeading(palAccount.type) && isBudgetOn && !simple" :style="{ width : tableProps.cellWidth / 3.5 + \'px\'}">{{getCompareRealDelta(value, palAccount.budget[key])}}</span>',

        '                                   <span v-show="isHeading(palAccount.type)">&nbsp;</span>',
        '                               </span>',
        '                           </div>',
        '                       </div>',


        '                       <div class="row separator padded">',
        '                           <div class="cell"',
        '                                v-for="period in table.periods"',
        '                                :style="{ width : tableProps.cellWidth + \'px\' }">',
        '                               <span class="cell-value">&nbsp;</span>',
        '                           </div>',
        '                       </div>',

        '                       <div class="row"',
        '                           v-for="(balAccount, index) in table.bal"',
        '                           :class="getClass(balAccount.type, balAccount.group)"',
        '                           v-show="showAccount(balAccount)">',

        '                           <div class="cell" :class="{ \'tabular-altrow\' : balAccount.group % 2 != 0 }"',
        '                                v-for="(value, key) in balAccount.values"',
        '                                :style="{ width : tableProps.cellWidth + \'px\' }">',

        '                               <span class="cell-value">',
        '                                   <span v-show="!isHeading(balAccount.type)">{{formatNumber(value)}}</span>',

        '                                   <span class="budget" v-show="!isHeading(balAccount.type) && ui.previous" :style="{ width : tableProps.cellWidth / 3.5 + \'px\'}">{{formatNumber(balAccount.previous[key])}}</span>',

        '                                   <span class="budget" v-show="!isHeading(balAccount.type) && ui.previous" :style="{ width : tableProps.cellWidth / 3.5 + \'px\'}">{{getCompareRealDelta(value, balAccount.previous[key])}}</span>',

        '                                   <span class="budget" v-show="!isHeading(balAccount.type) && isBudgetOn && !simple" :style="{ width : tableProps.cellWidth / 3.5 + \'px\'}">{{formatNumber(balAccount.budget[key])}}</span>',
        '                                   <span class="budget" v-show="!isHeading(balAccount.type) && isBudgetOn && !simple" :style="{ width : tableProps.cellWidth / 3.5 + \'px\'}">{{getCompareRealDelta(value, balAccount.budget[key])}}</span>',
        '                                   <span v-show="isHeading(balAccount.type)">&nbsp;</span>',
        '                               </span>',
        '                           </div>',
        '                       </div>',


        '                   </div>',
        '               </div>',
        '           </div>',


        '       </div>',
        '   </div>',
        '</article>',


        '       <div v-show="ui.section == \'timeline\' && !ui.noTimeData">',
        '           <line-chart :percentMultiply="false" :chart="chart" :init="!ui.loading" :reinit="ui.section == \'timeline\'" :interval="selectedInterval" :cashbook="false" :types="currency" :type="actualType" :average="false" :previous="false" :budget="false" :floatingAverage="false" :allowInversion="true"></line-chart>',
        '       </div>',

        '       <div class="splash" v-show="ui.section == \'timeline\' && ui.noTimeData">',
        '            <h1>{{ui.dictionary.salesPotential.selectAccountsTitle}}</h1>',
        '            <p>{{ui.dictionary.salesPotential.selectAccountsDescription}}</p>',
        '       </div>',




        '       <div v-if="presets" v-show="ui.showTable" class="extra-padded">',
        '           <div>',
        '               <table class="palbal">',
        '                   <thead :class="{ sticky : ui.stickHeader }">',
        '                       <tr><td>{{ui.dictionary.palbal.account}}</td><td v-for="period in table.periods">{{formatPeriod(period)}}</td></tr>',
        '                   </thead>',
        '                   <tbody>',
        '                       <tr class="separator"><td>{{ui.dictionary.palbal.pal}}</td><td v-for="period in table.periods">&nbsp;</td></tr>',

        '                       <tr v-for="(palAccount, index) in table.pal" :class="getClass(palAccount.type, palAccount.group)" v-show="showAccount(palAccount)"><td :title="palAccount.name"><span class="clickable" v-show="showPlus(palAccount) && hasChildren(\'pal\', index)" v-on:click="showGroup(palAccount.group)"><span class="pm">+</span> {{palAccount.name}}</span><span class="clickable" v-show="showMinus(palAccount) && hasChildren(\'pal\', index)" v-on:click="hideGroup(palAccount.group)"><span class="pm">&ndash;</span> {{palAccount.name}}</span><span v-show="(!showPlus(palAccount) && !showMinus(palAccount)) || !hasChildren(\'pal\', index)">{{palAccount.name}}</span></td><td v-for="value in palAccount.values"><span v-show="!isHeading(palAccount.type)">{{formatNumber(value)}}</span><span v-show="isHeading(palAccount.type)">&nbsp;</span></td></tr>',

        '                       <tr class="separator"><td>{{ui.dictionary.palbal.bal}}</td><td v-for="period in table.periods">&nbsp;</td></tr>',
        '                       <tr v-for="(balAccount, index) in table.bal" :class="getClass(balAccount.type, balAccount.group)" v-show="showAccount(balAccount)"><td :title="balAccount.name"><span class="clickable" v-show="showPlus(balAccount) && hasChildren(\'bal\', index)" v-on:click="showGroup(balAccount.group)"><span class="pm">+</span> {{balAccount.name}}</span><span class="clickable" v-show="showMinus(balAccount) && hasChildren(\'bal\', index)" v-on:click="hideGroup(balAccount.group)"><span class="pm">&ndash;</span> {{balAccount.name}}</span><span v-show="(!showPlus(balAccount) && !showMinus(balAccount)) || !hasChildren(\'bal\', index)">{{balAccount.name}}</span></td><td v-for="value in balAccount.values"><span v-show="!isHeading(balAccount.type)">{{formatNumber(value)}}</span><span v-show="isHeading(balAccount.type)">&nbsp;</span></td></tr>',
        '                   </tbody>',
        '               </table>',
        '           </div>',
        '       </div>',



        '   </section>',


        '</article>'
    ].join('');

    const { CASHBOOK, CASHBOOK_DISABLED } = cashbookStates;

    const { MONTH, QUARTER, HALF_YEAR, YEAR } = intervalOptions;

    let resizeTimeout;

    const getBudgetDataIdx = (dateKey, data = []) => {
        for (let index = 0; index < data.length; ++index) {
            if (bdItem.key === dateKey) {
                return index
            }
        }
        return -1
    }

    const findBudgetDataForTheDate = ({dateKey, accountType, accountIdx, budgetData}) => {
        let value = ' ';
        const dataIdx = getBudgetDataIdx(dateKey);

        if (dataIdx >= 0) {
            return  budgetData[dataIdx][accountType][accountIdx].value || ' ';
        }

        return value;
    };

    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                loading : true,
                noErp : false,
                noData : false,
                showTable : false,
                stickHeader : false,
                showIntervalOptions : false,
                exportOptions : false,
                section : 'table',
                noTimeData : true,
                showBudgetOptions : false,
                cashbook : false,
                deltaOptions : false,
                previous : false,
                changedGroupVisibility : false
            },
            company: CompanyModel.getCompany(),
            showId: null,
            arrIndexes: [],
            type : 'quarter',
            cashbook : false,
            budget : false,
            hideBudgetToggle: true,
            table : {},
            hideList : [],
            totalGroups : 0,
            useH3 : false,
            intervalOptions: [intervalOptions.MONTH, intervalOptions.QUARTER, intervalOptions.HALF_YEAR, intervalOptions.YEAR],
            balance : PersistentSettings.getItem('palbal-balance') || 'to_date', //or 'to_date'
            compare : PersistentSettings.getItem('palbal-compare') || 'end_year_to_date', //or end_year_to_date
            tutorial : Tutorial,
            scrolledDown : false,
            scrolledRight : false,
            tableProps : {
                longestAccountName : 0,
                additionalPadding : 50,
                tableWidth : 0,
                maxCellWidth : 0,
                firstCellWidth : 600,
                cellWidth : 200,
                remainingCellWidth : 0
            },
            selectedRows: [],
            rawData : null,
            rawPreviousData : null,
            profile : {},
            ledgerAccount : null,
            context : ContextModel.getContext(),
            budgetFile : BudgetFileModel.getBudgetFile(),
            budgetType : 'file',
            deltaType : 'nominal',
            erp: ErpModel.getErp(),
            actualType: '',
            selectedDepartmentId: null
        };
    };



    var methods = {
        init : function() {
            if (this.preview) {
                this.setBudgetState(true);
            }

            EventBus.$on('click', this.closeAllOptions);
            EventBus.$on('companyErpChanged', this.loadData);
            document.addEventListener('clickAppBody', this.closeAllOptions);

            if (this.isUnderPresentation || this.isShowPreview) {
                this.checkPresets();
            }

            if (this.presetData && this.presetSection !== 'timeline') {
                this.rawData = this.presetData;
                this.format(this.presetData);
            } else if (this.presetSection === 'timeline' && this.ui.section === 'table' && this.isUnderPresentation) {
                this.rawData = this.presetData;
                this.format(this.presetData);
                if (this.presetSection === 'timeline') {
                    this.changeSection('timeline');
                }
            } else {
                this.loadData();
            }
        },

        togglePrevious : function () {
            this.ui.previous = !this.ui.previous;

            if (this.isBudgetOn && this.ui.previous) {
                this.toggleBudget();
            }

            if (this.ui.section === 'table') {
                this.format(this.rawData, this.rawPreviousData);
            }
        },

        changeDeltaType : function (type) {
            this.deltaType = type;
            this.closeAllOptions();
        },

        getCompareRealDelta : function (real, compare) {
            var delta = 0;

            if (!compare || isNaN(compare)) {
                budget = 0;
            }

            if (this.deltaType == 'nominal') {
                delta = compare - real;
            } else if (this.deltaType == '%' && compare != 0) {
                delta = (real / compare) * 100;
            } else if (this.deltaType == 'x' && compare != 0) {
                delta = real / compare;
            }

            return this.formatNumber(delta, (this.deltaType == '%' || this.deltaType == 'x')) + (this.deltaType == 'nominal' ? '' : this.deltaType);
        },

        getValue: function (rowData) {
            const isChecked = rowData.timeline;
            if (isChecked) {
                this.selectedRows.push(rowData.id);
            } else {
                this.selectedRows = this.selectedRows.filter(selectedRow => selectedRow !== rowData.id);
            }
            this.selectedRows = [...this.selectedRows];
        },

        changeBudgetType : function (type) {
            this.budgetType = type;
            this.closeAllOptions();
            this.loadData();
        },

        changeSection : function (section) {
            let relevantCurrency = this.currency[0];
            if (section == 'timeline') {
                this.chart[this.selectedInterval][relevantCurrency].current.categories = this.table.periods.slice(0, -1);
                this.chart[this.selectedInterval][relevantCurrency].current.series = [];
                this.ui.noTimeData = false;

                this.table.pal.forEach(function (palAccount) {
                    if (palAccount.timeline) {
                        this.chart[this.selectedInterval][relevantCurrency].current.series.push({
                            name : palAccount.name,
                            data : palAccount.values.slice(0, -1)
                        });
                    }
                }.bind(this));

                this.table.bal.forEach(function (balAccount) {
                    if (balAccount.timeline) {
                        this.chart[this.selectedInterval][relevantCurrency].current.series.push({
                            name : balAccount.name,
                            data : balAccount.values.slice(0, -1)
                        });
                    }
                }.bind(this));

                if (this.chart[this.selectedInterval][relevantCurrency].current.series.length === 0) {
                    this.ui.noTimeData = true;
                }
                this.ui.section = section;
            } else {
                this.ui.section = section;
                /**
                 this.calculateTableProperties();
                 */
            }
        },


        openLedger : function (account) {
            if (!this.profile.roles || this.profile.roles.indexOf('entry_role') < 0 || (account.type != 'pal' && account.type != 'bal' || this.isUnderEditPresentation || this.isUnderPresentation) ) {
                return false;
            }
            this.ledgerAccount = account;
            this.$modal.show(ledgerModal, {ledgerAccount: account}, {height: 'auto', width: '70%'});
        },

        calculateTableProperties : function() {
            //Reset table properties
            this.tableProps.maxCellWidth = 0;
            this.tableProps.firstCellWidth = 60;
            this.tableProps.cellWidth = (this.isBudgetOn || this.ui.previous) ? 360 : 200;
            this.tableProps.remainingCellWidth = 0;

            setTimeout(function() {
                this.tableProps.tableWidth = this.$refs.dynamictable?.querySelector('.container')?.offsetWidth;
                this.tableProps.maxCellWidth = Math.round(this.tableProps.tableWidth * 0.25);
                var firstCellWantedWidth = (this.tableProps.longestAccountName * 10) + this.tableProps.additionalPadding;

                this.tableProps.firstCellWidth = firstCellWantedWidth > this.tableProps.maxCellWidth ? this.tableProps.maxCellWidth : firstCellWantedWidth;

                this.tableProps.remainingCellWidth = this.tableProps.tableWidth - this.tableProps.firstCellWidth - 17;

                var cols = this.table.periods.length;
                var wantedCellWidth = Math.round(this.tableProps.remainingCellWidth / cols) - 1;

                this.tableProps.cellWidth = wantedCellWidth < this.tableProps.cellWidth ? this.tableProps.cellWidth : wantedCellWidth;
            }.bind(this), 200);
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

        showDownloadTrialBalanceTutorial : function() {
            return this.tutorial.current && (this.tutorial.current.name == 'downloadTrialBalance' || this.tutorial.current.name == 'trialBalance') && !this.tutorial.state.loading && !this.tutorial.state.finished;
        },

        formatPeriod : function(period) {
            if (period.indexOf(this.ui.dictionary.palbal.total) >= 0 || period.indexOf(this.ui.dictionary.palbal.toDate) >= 0) {
                return period;
            } else if (this.selectedInterval == 'week') {
                return moment(period, 'YYYY [W]w').format(this.ui.dictionary.locale.intervals.week);
            } else if (this.selectedInterval == 'month') {
                return moment(period, 'YYYY-MM').format(this.ui.dictionary.locale.intervals.month);
            } else if (this.selectedInterval == 'quarter') {
                return moment(period, 'YYYY [Q]Q').format(this.ui.dictionary.locale.intervals.quarter);
            } else if (this.selectedInterval == 'half-year') {
                if (period.indexOf('1ST') >= 0) {
                    return moment(period, 'YYYY [1ST]').format(this.ui.dictionary.locale.intervals['half-year-1']);
                } else {
                    return moment(period, 'YYYY [1ND]').format(this.ui.dictionary.locale.intervals['half-year-2']);
                }
            }

            return period;
        },

        exportToExcel : function() {
            var scope = this;
            var dc= new BalanceDataCollection();
            const fromDate = moment(DateRangeModel.getFromString()).format('DD.MM.YYYY');
            const toDate = moment(DateRangeModel.getToString()).format('DD.MM.YYYY');

            const context = ContextModel.getContext();
            const company =  context ? context.company : CompanyModel.getCompany();

            dc.getExcelData(this.selectedInterval, this.isCashbookActive, this.balance, this.compare)
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

        checkPresets : function() {
            if (this.presetInterval) {
                this.$store.dispatch('setInterval', this.presetInterval);
            }

            if (this.presetCashbook) {
                this.$store.dispatch('setDashboardCashbook', CASHBOOK);
            } else {
                this.$store.dispatch('setDashboardCashbook', CASHBOOK_DISABLED);
            }

            if (this.presetBalance) {
                this.balance = this.presetBalance;
            }

            if (this.presetCompare) {
                this.compare = this.presetCompare;
            }
        },

        getImage : function(img) {
            return new AssetModel(img).path;
        },

        changeInterval : function(interval) {
            this.$store.dispatch('setInterval', interval);
            this.closeAllOptions();
        },

        closeAllOptions : function() {
            this.ui.showIntervalOptions = false;
            this.ui.exportOptions = false;
            this.ui.showBudgetOptions = false;
            this.ui.deltaOptions = false;
        },

        format : function(rawData, previousData) {
            if (!rawData) {
                return false;
            }

            var scope = this;
            var data = rawData[this.selectedInterval];
            var budgetData = null;
            var dataCompare = rawData.compare;
            var budgetDataCompare = null;



            if (previousData) {
                var prevData = previousData[this.selectedInterval];
                var prevDataCompare = previousData.compare;
            }

            if (this.isBudgetOn && rawData.budget) {
                budgetData = rawData.budget[this.selectedInterval];
                budgetDataCompare = rawData.budget.compare;
            } else if (this.isBudgetOn) {
                data = rawData;
            }


            var numPeriods = data ? data.length : 0;
            var periods = [];
            var palRows = [];
            var balRows = [];
            var group = 0;

            if (data === undefined || data[0] === undefined) {
                this.ui.noData = true;
                this.ui.loading = false;
                this.table = {};
                this.ui.showTable = false;
                return false;
            } else {
                this.ui.noData = false;
            }
            //Headings
            for (var p = 0; p < numPeriods; p++) {
                periods.push(data[p].key);
            }

            //Compare heading
            if (dataCompare !== undefined && dataCompare.key !== undefined) {
                if (this.compare == 'end_year_total') {
                    periods.push(this.ui.dictionary.palbal.compare.replace(':year', dataCompare.key));
                } else {
                    periods.push(this.ui.dictionary.palbal.compareToDate.replace(':year', dataCompare.key));
                }
            }

            data[0].pal.forEach(function(val, key) {
                if (data[0].pal[key].type == 'he1' || data[0].pal[key].type == 'he2' || (data[0].pal[key].type == 'he3' && scope.useH3)) {
                    group++;
                } else if (data[0].pal[key].type == 'he3' && group === 0) {
                    scope.useH3 = true;
                    group++;
                }

                palRows[key] = { id : data[0].pal[key].id , number : data[0].pal[key].number, name : data[0].pal[key].name, type : data[0].pal[key].type, values : [], previous : [], previousPeriod: [], budget : [], group : group };

                for (var i = 0; i < numPeriods; i++) {
                    if (data[i].pal[key].value !== undefined) {
                        palRows[key].values.push(data[i].pal[key].value);
                    } else {
                        palRows[key].values.push(' ');
                    }


                    if (prevData && prevData[i] && prevData[i].pal && prevData[i].pal[key].value !== undefined) {
                        palRows[key].previous.push(prevData[i].pal[key].value);
                        palRows[key].previousPeriod.push(prevData[i].pal[key].value);
                    } else {
                        palRows[key].previous.push(' ');
                        palRows[key].previousPeriod.push(' ');
                    }

                    palRows[key].budget.push(findBudgetDataForTheDate({
                        dateKey: data[i].key,
                        accountType: 'pal',
                        accountIdx: key,
                        budgetData
                    }));
                }

                //Compare values
                if (dataCompare !== undefined && dataCompare.key !== undefined) {
                    if (dataCompare.pal[key].value !== undefined) {
                        palRows[key].values.push(dataCompare.pal[key].value);
                    } else {
                        palRows[key].values.push(' ');
                    }


                    if (prevDataCompare && prevDataCompare.pal && prevDataCompare.pal[key].value !== undefined) {
                        palRows[key].previous.push(prevDataCompare.pal[key].value);
                    } else {
                        palRows[key].previous.push(' ');
                    }

                    if (budgetDataCompare && budgetDataCompare.pal && budgetDataCompare.pal[key].value !== undefined) {
                        palRows[key].budget.push(budgetDataCompare.pal[key].value);
                    } else {
                        palRows[key].budget.push(' ');
                    }
                }

                //Get longest account name
                if (palRows[key].name.length > scope.tableProps.longestAccountName) {
                    scope.tableProps.longestAccountName = palRows[key].name.length;
                }
            });


            data[0].bal.forEach(function(val, key) {
                if (data[0].bal[key].type == 'he1' || data[0].bal[key].type == 'he2' || (data[0].bal[key].type == 'he3' && scope.useH3)) {
                    group++;
                } else if (data[0].bal[key].type == 'he3' && group === 0) {
                    scope.useH3 = true;
                    group++;
                }

                balRows[key] = { id : data[0].bal[key].id, number : data[0].bal[key].number, name : data[0].bal[key].name, type : data[0].bal[key].type, values : [], previousPeriod : [], previous : [], budget : [], group : group };

                for (var i = 0; i < numPeriods; i++) {
                    if (data[i].bal[key].value !== undefined) {
                        balRows[key].values.push(data[i].bal[key].value);
                    } else {
                        balRows[key].values.push(' ');
                    }


                    if (prevData && prevData[i] && prevData[i].bal && prevData[i].bal[key].value !== undefined) {
                        balRows[key].previous.push(prevData[i].bal[key].value);
                        balRows[key].previousPeriod.push(prevData[i].bal[key].value);
                    } else {
                        balRows[key].previous.push(' ');
                        balRows[key].previousPeriod.push(' ');
                    }

                    balRows[key].budget.push(findBudgetDataForTheDate({
                        dateKey: data[i].key,
                        accountType: 'bal',
                        accountIdx: key,
                        budgetData
                    }));
                }

                //Compare values
                if (dataCompare !== undefined && dataCompare.key !== undefined) {
                    if (dataCompare.bal[key].value !== undefined) {
                        balRows[key].values.push(dataCompare.bal[key].value);
                    } else {
                        balRows[key].values.push(' ');
                    }


                    if (prevDataCompare && prevDataCompare.bal && prevDataCompare.bal[key].value !== undefined) {
                        balRows[key].previous.push(prevDataCompare.bal[key].value);
                    } else {
                        balRows[key].previous.push(' ');
                    }


                    if (budgetDataCompare && budgetDataCompare.bal && budgetDataCompare.bal[key].value !== undefined) {
                        balRows[key].budget.push(budgetDataCompare.bal[key].value);
                    } else {
                        balRows[key].budget.push(' ');
                    }
                }

                //Get longest account name
                if (balRows[key].name.length > scope.tableProps.longestAccountName) {
                    scope.tableProps.longestAccountName = balRows[key].name.length;
                }
            });

            this.calculateTableProperties();

            var table = {
                periods : periods,
                pal : palRows,
                bal : balRows
            };

            if (this.rowsIdsToShow && this.rowsIdsToShow.length) {
                const listHasThatIndex = ({id}) => (this.rowsIdsToShow.indexOf(id) > -1);
                table.bal = [...table.bal.filter(listHasThatIndex)];
                table.bal.forEach(bal => { bal.timeline = true });

                table.pal = [...table.pal.filter(listHasThatIndex)];
                table.pal.forEach(pal => { pal.timeline = true });
            }

            if (this.selectedRows) {
                this.selectedRows.forEach((id) => {
                    table.pal.forEach((item) => {
                        if(item.id === id) {
                            item.timeline = true;
                        }
                    })

                    table.bal.forEach((item) => {
                        if(item.id === id) {
                            item.timeline = true;
                        }
                    })
                })
            }

            let groupedPal = [];
            let groupedBal = [];

            /*    this.table = table;

                this.ui.showTable = true;
                this.ui.loading = false; */
            this.totalGroups = group;

            if (this.totalGroups > 0 && !this.presets) {
                if (!this.rowsIdsToShow || !this.rowsIdsToShow.length) {
                    this.expandAll();
                    this.collapseAll();
                } else {
                    palRows.forEach((item) => {
                        table.pal.forEach((val) => {
                            if (val.group === item.group && groupedPal.findIndex(i => i.id === val.id) === -1) {
                                groupedPal.push(val);
                            }
                        });
                        if (groupedPal.length) {
                            if (groupedPal.findIndex(i => i.type === "he1" || i.type === "he2" || i.type === "he3" && i.type === "pal") !== -1) {
                                this.hideGroup(item.group);
                            } else {
                                this.showGroup(item.group);
                            }
                        }
                    });
                    balRows.forEach((item) => {
                        table.bal.forEach((val) => {
                            if (val.group === item.group && groupedBal.findIndex(i => i.id === val.id) === -1) {
                                groupedBal.push(val);
                            }
                        });
                        if (groupedBal.length) {
                            if (groupedBal.findIndex(i => i.type === "he1" || i.type === "he2" || i.type === "he3" && i.type === "bal") !== -1) {
                                this.hideGroup(item.group);
                            } else {
                                this.showGroup(item.group);
                            }
                        }
                    });
                }
            }

            this.table = table;
            this.ui.showTable = true;
            this.ui.loading = false;

        },


        loadData : function() {
            if (this.tutorial.state.started && !this.tutorial.state.finished) {
                this.format(tutorialStaticData);
                return false;
            }

            if(this.presetData) {
                this.rawData = this.presetData;
                this.format(this.presetData);
                if (this.presetSection === 'timeline') {
                    this.changeSection('timeline');
                }
            }

            if (!ErpModel.getErp()) {
                if (this.isUnderEditPresentation || this.isUnderPresentation) {
                    this.ui.noErp = false;
                    return true;
                } else {
                    this.ui.noErp = true;
                    this.ui.loading = false;
                    return false;
                }
            }

            this.ui.showTable = false;
            this.ui.loading = true;
            this.ui.noData = false;
            this.ui.section = this.presetSection || 'table';
            this.rawData = null;
            this.profile = UserModel.profile();

            let data = new BalanceDataCollection();
            if (this.$route.fullPath === "/account/overview/budget") {
                const prevYearDate = [];
                const from = moment(this.presetToDate).subtract(12, 'months').format('YYYY-MM-DD');
                const to = moment(this.presetToDate).format('YYYY-MM-DD');
                prevYearDate.push(from);
                prevYearDate.push(to);
                if (!this.isUnderEditPresentation && !this.isUnderPresentation && !this.isShowPreview) {
                    this.$store.dispatch('setPreviousYearBudgetDate', prevYearDate);
                    EventBus.$emit('callDatePicker', true);
                    data.getBudgetCategoriesData(from, to);
                } else {
                    data.getBudgetCategoriesData(this.presetFromDate, this.presetToDate);
                }
            } else {
                this.isShowPreview ? entryDepartmentHelpers.changeDepartmentModel(this.getPresentationPageInfo?.entry_department_reference, this.selectedDepartmentId) : entryDepartmentHelpers.clearDepartmentModel(this.selectedDepartmentId);
                data.getData(this.selectedInterval, this.isCashbookActive, this.balance, this.compare, this.simple, this.presetFromDate, this.presetToDate, this.budgetType)
                    .then(function(res) {
                        if (this.isUnderEditPresentation || this.isUnderPresentation) {
                            if (res._embedded && res._embedded.items) {
                                this.rawData = res._embedded.items;
                                this.format(res._embedded.items);
                            } else {
                                this.rawData = res;
                                this.format(res);
                            }

                            if (this.presetSection === 'timeline') {
                                this.changeSection('timeline')
                            }
                        } else {
                            this.loadPreviousData(res);
                        }

                    }.bind(this));
            }


        },


        loadPreviousData : function (currentRes) {
            var data = new BalanceDataCollection();

            data.getPreviousData(this.selectedInterval, this.isCashbookActive, this.balance, this.compare, this.simple, this.presetFromDate, this.presetToDate, this.budgetType)
                .then(function(res) {
                    if (currentRes._embedded && currentRes._embedded.items) {
                        this.rawData = currentRes._embedded.items;
                        this.rawPreviousData = res._embedded.items;
                        this.format(currentRes._embedded.items, res._embedded.items);
                    } else {
                        this.rawData = currentRes;
                        this.rawPreviousData = res;
                        this.format(currentRes, res);
                    }
                }.bind(this));
        },


        showAccount : function(account) {
            if ( (account.type == 'pal' || account.type == 'bal') && this.hideList.indexOf(account.group) >= 0 ) {
                return false;
            }

            return true;
        },


        showPlus : function(account) {
            if (this.presets) {
                return false;
            }

            if (account.type == 'he1' || account.type == 'he2' || (account.type == 'he3' && this.useH3)) {
                if ( this.hideList.indexOf(account.group) >= 0 ) {
                    return true;
                }
            }

            return false;
        },


        showMinus : function(account) {
            if (this.presets) {
                return false;
            }

            if (account.type == 'he1' || account.type == 'he2' || (account.type == 'he3' && this.useH3)) {
                if ( this.hideList.indexOf(account.group) < 0 ) {
                    return true;
                }
            }

            return false;
        },


        hasChildren : function(type, index) {
            /**
             var next = this.table[type][index + 1];

             if (next && next.type != 'he1' && next.type != 'he2' && next.type != 'he3' && next.type != 'sum') {
                return true;
            }

             return false;
             */

            var found = false;

            this.table[type].forEach(function (item) {
                if (item.type != 'he1' && item.type != 'he2' && item.type != 'he3' && item.type != 'sum') {
                    found = true;
                }
            });

            return found;
        },


        hideGroup : function(group) {
            this.ui.changedGroupVisibility = true;
            this.hideList.push(group);
        },


        showGroup : function(group) {
            if (this.isShowPreview || this.isUnderPresentation) {
                let uniqValue = [];
                for (let str of this.hideList) {
                    if (!uniqValue.includes(str)) {
                        uniqValue.push(str);
                    }
                }
                this.hideList = uniqValue;
            }
            this.ui.changedGroupVisibility = true;
            this.hideList.splice(this.hideList.indexOf(group), 1);
        },


        getClass : function(type, group) {
            var classes = {
                he1 : false,
                he2 : false,
                he3 : false,
                he4 : false,
                sum : false,
                pal : false,
                bal : false,
                topspace : false,
                'tabular-row' : group % 2 == 0,
                'tabular-altrow' : group % 2 != 0,
            };

            classes[type] = true;

            if (type == 'he3' && this.useH3) {
                classes.topspace = true;
            }

            return classes;
        },


        isHeading : function(type) {
            var classes = this.getClass(type);

            return classes.he1 || classes.he2 || classes.he3 || classes.he4;
        },

        expandAll : function() {
            this.hideList = [];
        },

        collapseAll : function() {
            for (var i = 0; i <= this.totalGroups; i++) {
                this.hideList.push(i);
            }
        },

        formatNumber : function(value, justRound) {
            if (justRound) {
                return Math.round( value * 10 ) / 10;
            }

            return NumberFormatter.format(value);
        },

        toggleBudget: function () {
            if (this.ui.previous && !this.isBudgetOn) {
                this.ui.previous = false;
            }
            this.$store.dispatch('toggleDashboardBudget');
        },

        setBudgetState: function (budgetState) {
            this.$store.dispatch('setBudget', budgetState);
        },

        toggleCashbook: function () {
            this.$store.dispatch('toggleDashboardCashbook');
            this.loadData();
        },

        onResize() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(this.calculateTableProperties, 100);
        },

        getSelectedDepartment(department) {
            this.selectedDepartmentId = department;
        },

        resetSelectedRows() {
            this.selectedRows = [];
            this.$store.dispatch('saveReportPage', false);
            this.table.pal.forEach((item) => {
                if(item.timeline) {
                    item.timeline = false;
                }
            })
            this.table.bal.forEach((item) => {
                if(item.timeline) {
                    item.timeline = false;
                }
            })
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

        isBudgetOn() {
            return false
        },

        selectedInterval() {
            const { DAY, WEEK, MONTH } = intervalOptions;
            let interval = this.$store.getters.interval;
            //Minimal interval for BalanceView is month OR if it`s preview it uses only MONTH interval
            interval = (interval === DAY || interval === WEEK || this.preview)? MONTH : interval;

            return interval;
        },

        isUnderEditPresentation() {
            return this.$store.getters.presentationEditMode;
        },
        isUnderPresentation() {
            return this.$store.getters.presentationMode;
        },
        isShowPreview() {
            return this.$store.getters.showPreview;
        },
        currency() {
            let currency = [];
            this.erp?.currency ? currency.push(this.erp?.currency) : currency.push(Config.get('defaultCurrency'));
            this.actualType = this.erp?.currency || Config.get('defaultCurrency');
            return currency;
        },

        chart() {
            let actualCurrency = this.currency[0];
            return {
                week: {
                    [actualCurrency]: {
                        current: {
                            categories: [],
                            series: []
                        }
                    }
                },
                month: {
                    [actualCurrency]: {
                        current: {
                            categories: [],
                            series: []
                        }
                    }
                },
                quarter: {
                    [actualCurrency]: {
                        current: {
                            categories: [],
                            series: []
                        }
                    }
                },
                'half-year': {
                    [actualCurrency]: {
                        current: {
                            categories: [],
                            series: []
                        }
                    }
                },
                year: {
                    [actualCurrency]: {
                        current: {
                            categories: [],
                            series: []
                        }
                    }
                }
            }
        },

        entryDepartmentsEnabled() {
            const context = ContextModel.getContext();
            const company = context ? context.company : CompanyModel.getCompany();
            return company?.settings?.entry_department && this.profile?.roles?.indexOf && this.profile.roles.indexOf('entry_department_role') >= 0
        },

        isSaveReportPage() {
            return this.$store.getters.isSavePresentationPage;
        },

        getPresentationPageInfo() {
            return this.$store.getters.presentationPage;
        }
    };

    return Vue.extend({
        template : template,
        computed,
        data : bindings,
        methods : methods,
        props : ['presets', 'presetInterval', 'presetCashbook', 'presetBalance', 'presetCompare', 'preview', 'simple', 'presetFromDate', 'presetToDate', 'presentationInfoFlag', 'processReportPageInfo', 'presentation', 'presetData', 'rowsIdsToShow', 'presetSection'],
        components : {
            'date-picker' : datePicker,
            'delta-selector' : deltaSelector,
            'tutorial-slide' : tutorialSlide,
            'valid-ledger' : validLedger,
            'ledger-view' : LedgerView,
            'line-chart' : lineChart,
            'switch-with-labels': switchWithLabels,
            'intervals-selector': intervalsSelector,
            'entry-departments' : entryDepartments
        },
        created : function() {
            this.init();
            window.addEventListener('resize', this.onResize);
        },
        beforeDestroy : function() {
            window.onscroll = null;
            EventBus.$off('click');
            document.removeEventListener('clickAppBody', this.closeAllOptions);
            EventBus.$off('companyErpChanged');
            window.removeEventListener('resize', this.onResize);
        },
        watch : {
            presentationInfoFlag : function () {
                let entryDepartment = EntryDepartmentModel.getEntryDepartment()?.id;
                this.processReportPageInfo({
                    aggregations : false,
                    balance : this.balance,
                    benchmark : null,
                    budget : this.isBudgetOn,
                    budget_loaded_file : this.budgetFile,
                    compare : this.compare,
                    pseudo_dashboard : '_palbal',
                    intervals : this.selectedInterval,
                    settings: {balanceRowsToShow: this.selectedRows, section: this.ui.section},
                    cashbook: this.isCashbookActive ? 'true' : 'false',
                    entry_department: entryDepartment ? entryDepartment : null
                });
            },
            'ui.section': function (val, oldVal) {
                this.$emit('sectionChanged', val)
                if (val === 'table' && val !== oldVal) {
                    this.format(this.rawData, this.rawPreviousData);
                }
            },
            balance : function(val) {
                this.loadData();
                PersistentSettings.setItem('palbal-balance', val);
            },
            compare : function(val) {
                this.loadData();
                PersistentSettings.setItem('palbal-compare', val);
            },
            isBudgetOn(val) {
                this.format(this.rawData, this.rawPreviousData);
            },
            UICashbookState : function() {
                this.loadData();
            },
            selectedInterval() {
                this.loadData();
            },
            rowsIdsToShow() {
                this.loadData();
            },
            'selectedDepartmentId': function (val, oldVal) {
                if(val !== oldVal) {
                    this.loadData();
                }
            },
            isSaveReportPage(saved) {
                if (saved) {
                    this.resetSelectedRows();
                }
            }
        }
    });
});
