/* global $ */
    import Vue from 'Vue'
    import DictionaryModel from 'models/DictionaryModel'
    import ErpModel from 'models/ErpModel'
    import KpiModel from 'models/KpiModel'
    import pieChart from 'components/pieChart.vue'
    import barChart from 'components/barChart.vue'
    import mathFormula from 'elements/math-formula'
    import kpiCard from 'components/kpiCard.vue'
    import drilldownCard from 'elements/drilldown-card'
    import Config from 'services/Config'

    const template = [
        '<article ref="kpigrid">',

        /**
         * Custom KPIs
         */
        '       <div class="kpi-grid"',
        '            v-if="dashId != \'_general\' && dashId != \'_public\'"',
        '            v-for="kpi in byOrder(kpis)">',

        '           <kpi-card',
        '               :kpi="kpi"',
        '               :rawdata="rawdata"',
        '               :easyview="easyview"',
        '               :currentType="currentType"',
        '               :previousType="previousType"',
        '               :budget="budget"',
        '               :readyCallback="readyCallback">',
        '           </kpi-card>',

        '       </div',

        '       ><div class="kpi-grid" v-if="dashId != \'_general\' && dashId != \'_public\' && !presentation">',
        '           <div class="kpi-card add-new" v-on:click="addNewKpi()">',
        '               <div class="heading">{{ui.dictionary.customKpis.add}}</div>',
        '               <div class="add-sign">+</div>',
        '               <div class="kpi-labels">',
        '                   <div class="value-container">',
        '                       <div class="value">',
        '                           <div class="number">--</div>',
        '                        <div class="label">{{ui.dictionary.kpis.current}}</div>',
        '                       </div>',
        '                   </div',
        '                  ><div class="value-container">',
        '                       <div class="value">',
        '                           <div class="number">--</div>',
        '                           <div class="label">{{ui.dictionary.kpis.previous}}</div>',
        '                     </div>',
        '                   </div',
        '                   ><div class="value-container">',
        '                       <div class="value">',
        '                           <div class="number">--</div>',
        '                           <div class="label">{{ui.dictionary.kpis.average}}</div>',
        '                       </div>',
        '                   </div>',
        '               </div>',
        '           </div>',
        '       </div>',




        /**
         * Realtime / general overview
         */
                /**
                 * Column 1
                 */
        '       <div class="kpi-grid"',
        '            v-if="dashId == \'_general\'">',


        '           <div class="title-card">',
        '               <h3>{{translateKpi(\'profit\')}}</h3>',
        //'                                             <span v-show="!ui.breakdowns.profit"><i class="cwi-down clickable" v-on:click="toggleBreakdown(\'profit\')"></i></span><span v-show="ui.breakdowns.profit"><i class="cwi-up clickable" v-on:click="toggleBreakdown(\'profit\')"></i></span></h3>',
        '           </div>',

                    /**
                     * Profit Margin
                     */
        '           <div class="kpi-card" id="profit-box">',
        '               <div class="icons">',
        '                   <i class="cwi-info" v-on:click="toggleTooltip(\'profitMargin\')"></i>',
        '               </div>',


        '               <div class="heading">{{translateKpi(\'profitMargin\')}} <div class="tooltip" :class="{ open : tooltips.profitMargin }"><div class="equation"><math-formula :ignorePeriods="true" :numerator="[translateFormula(\'ebt\')]" :denominator="[translateFormula(\'revenue\')]" inDenom="true" :isPercent="true" autoShow="true"></math-formula></div>{{translateDefinition(\'profitMargin\')}}</div></div>',


        '               <div class="pie-chart-area">',
        '                   <bar-chart :kpi="getKpiObjectGeneral(\'profitMargin\')"',
        '                              orientation="horizontal"',
        '                              :percent="true"></bar-chart>',
        '               </div>',

        '               <div id="profit-labels" :class="{ fixLabels : fixLabels }">',
        '                    <div v-show="fixLabels" class="fixedLabelsLabel">{{translateKpi(\'profitMargin\')}}</div>',
        '                    <div class="value-container" :class="{ negative : negatives.current[\'profitMargin\'] }">',
        '                       <div class="value" :style="{ borderColor : colors.current[\'profitMargin\'] }">',
        '                           <div v-if="rawdata[currentType] && rawdata[currentType].self && rawdata[currentType].self.aggregation && rawdata[currentType].self.aggregation[\'profitMargin\'] !== undefined" class="number">{{formatNumber(createKpiObjectMock(\'profitMargin\'), \'%\')}}</div>',
        '                           <div v-if="!rawdata[currentType] || !rawdata[currentType].self || !rawdata[currentType].self.aggregation || rawdata[currentType].self.aggregation[\'profitMargin\'] === undefined" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                           <div class="label">{{ui.dictionary.kpis.current}}</div>',
        '                      </div>',
        '                   </div',
        '                   ><div class="value-container" :class="{ negative : negatives.previous[\'profitMargin\'] || (rawdata[previousType] && rawdata[previousType].self && rawdata[previousType].self.aggregation && rawdata[previousType].self.aggregation[\'profitMargin\'] && rawdata[previousType].self.aggregation[\'profitMargin\'] < 0)}">',
        '                       <div class="value" :title="getTitle" :style="{ borderColor : colors.previous[\'profitMargin\'] }">',
        '                           <div v-if="rawdata[previousType] && rawdata[previousType].self && rawdata[previousType].self.aggregation && rawdata[previousType].self.aggregation[\'profitMargin\']" class="number">{{formatNumber(rawdata[previousType].self.aggregation[\'profitMargin\'], \'%\')}}</div>',
        '                           <div v-if="!rawdata[previousType] || !rawdata[previousType].self || !rawdata[previousType].self.aggregation || !rawdata[previousType].self.aggregation[\'profitMargin\']" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                           <div class="label" v-show="isPrevious">{{ui.dictionary.kpis.previous}}</div>',
        '                           <div class="label" v-show="isLastYear">{{ui.dictionary.kpis.lastYear}}</div>',
        '                           <div class="label" v-show="budget">{{ui.dictionary.kpis.budget}}</div>',
        '                      </div>',
        '                   </div',
        '                   ><div class="value-container" :class="{ negative : negatives.average[\'profitMargin\'] }">',
        '                       <div class="value" :style="{ borderColor : colors.average[\'profitMargin\'] }">',
        '                           <div v-if="currentType !== \'currentCashBook\' && rawdata[currentType] && rawdata[currentType].benchmark && rawdata[currentType].benchmark.aggregation && rawdata[currentType].benchmark.aggregation[\'profitMargin\']" class="number">{{formatNumber(rawdata[currentType].benchmark.aggregation[\'profitMargin\'], \'%\')}} <i v-show="rawdata[currentType].benchmark.aggregation.benchmarkCount.profitMargin" class="cwi-info tiny" :title="ui.dictionary.overview.sample + \': \' + rawdata[currentType].benchmark.aggregation.benchmarkCount.profitMargin"></i></div>',
        '                           <div v-if="currentType === \'currentCashBook\' && rawdata.current && rawdata.current.benchmark && rawdata.current.benchmark.aggregation && rawdata.current.benchmark.aggregation[\'profitMargin\']" class="number">{{formatNumber(rawdata.current.benchmark.aggregation[\'profitMargin\'], \'%\')}} <i v-show="rawdata.current.benchmark.aggregation.benchmarkCount.profitMargin" class="cwi-info tiny" :title="ui.dictionary.overview.sample + \': \' + rawdata.current.benchmark.aggregation.benchmarkCount.profitMargin"></i></div>',
        '                           <div v-if="(currentType !== \'currentCashBook\' && (!rawdata[currentType] || !rawdata[currentType].benchmark || !rawdata[currentType].benchmark.aggregation || !rawdata[currentType].benchmark.aggregation[\'profitMargin\'])) || (currentType === \'currentCashBook\' && (!rawdata.current || !rawdata.current.benchmark || !rawdata.current.benchmark.aggregation || !rawdata.current.benchmark.aggregation[\'profitMargin\']))" class="number"> -- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                           <div class="label">{{ui.dictionary.kpis.average}}</div>',
        '                      </div>',
        '                   </div>',
        '               </div>',

        '               <drilldown-card :kpi="getKpiObjectGeneral(\'profitMargin\', true)" :currentType="currentType" :previousType="previousType"></drilldown-card>',
        '           </div><span id="scroll-marker"></span>',


                    /**
                     * Contribution Margin
                     */
        '           <div class="kpi-card" v-if="ui.breakdowns.profit">',

        '               <div class="icons">',
        '                   <i class="cwi-info" v-on:click="toggleTooltip(\'contributionMargin\')"></i><i class="cwi-sliders" v-on:click="toggleSliders(\'contributionMarginRatio\'); disableTooltip(\'contributionMargin\');"></i>',
        '               </div>',

        '               <div class="heading">{{translateKpi(\'contributionMarginRatio\')}} <div class="tooltip" :class="{ open : tooltips.contributionMargin }"><div class="equation"><math-formula :ignorePeriods="true" :numerator="[translateFormula(\'revenue\'), \'-\', translateFormula(\'variableCosts\')]" :denominator="[translateFormula(\'revenue\')]" inDenom="true" :isPercent="true" autoShow="true"></math-formula></div>{{translateDefinition(\'contributionMargin\')}}</div></div>',


        '               <div class="kpi-sliders" :class="{ open : sliders.contributionMarginRatio }">',
        '                   <div class="slider">',
        '                       <div class="scale"><span>{{limits.contributionMarginRatio.min}}%</span><span></span><span>{{limits.contributionMarginRatio.max}}%</span></div>',
        '                       <input :disabled="rawdata[currentType].self.aggregation.revenue === 0" type="range" :min="limits.contributionMarginRatio.min" :max="limits.contributionMarginRatio.max" step="0.5" v-model="calcKpis.contributionMarginRatio" v-on:input="revCalcContributionMarginRatio(calcKpis.contributionMarginRatio)" v-on:change="revCalcContributionMarginRatio(calcKpis.contributionMarginRatio)">',
        '                       <span class="disabled-label" v-show="rawdata[currentType].self.aggregation.revenue === 0">{{ui.dictionary.overview.sliderDisabled}}</span>',
        '                   </div>',
        '                   <div class="reset-button" v-show="rawdata[currentType].self.aggregation.revenue !== 0"><button v-on:click="resetContributionMarginRatio(originalKpiValues.contributionMarginRatio)">{{ui.dictionary.overview.reset}}</button></div>',
        '               </div>',


        '               <div class="pie-chart-area">',
        '                   <bar-chart :kpi="getKpiObjectGeneral(\'contributionMarginRatio\')"',
        '                              orientation="horizontal"',
        '                              :percent="true"></bar-chart>',
        '               </div>',

        '               <div class="value-container" :class="{ negative : negatives.current[\'contributionMarginRatio\'] }">',
        '                   <div class="value" :style="{ borderColor : colors.current[\'contributionMarginRatio\'] }">',
        '                       <div v-if="rawdata[currentType] && rawdata[currentType].self && rawdata[currentType].self.aggregation && rawdata[currentType].self.aggregation[\'contributionMarginRatio\'] !== undefined" class="number">{{formatNumber(createKpiObjectMock(\'contributionMarginRatio\'), \'%\')}}</div>',
        '                       <div v-if="!rawdata[currentType] || !rawdata[currentType].self || !rawdata[currentType].self.aggregation || rawdata[currentType].self.aggregation[\'contributionMarginRatio\'] === undefined" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                       <div class="label">{{ui.dictionary.kpis.current}}</div>',
        '                   </div>',
        '               </div',
        '               ><div class="value-container" :class="{ negative : negatives.previous[\'contributionMarginRatio\'] || (rawdata[previousType] && rawdata[previousType].self && rawdata[previousType].self.aggregation && rawdata[previousType].self.aggregation[\'contributionMarginRatio\'] && rawdata[previousType].self.aggregation[\'contributionMarginRatio\'] < 0) }">',
        '                   <div class="value" :title="getTitle" :style="{ borderColor : colors.previous[\'contributionMarginRatio\'] }">',
        '                       <div v-if="rawdata[previousType] && rawdata[previousType].self && rawdata[previousType].self.aggregation && rawdata[previousType].self.aggregation[\'contributionMarginRatio\']" class="number">{{formatNumber(rawdata[previousType].self.aggregation[\'contributionMarginRatio\'], \'%\')}}</div>',
        '                       <div v-if="!rawdata[previousType] || !rawdata[previousType].self || !rawdata[previousType].self.aggregation || !rawdata[previousType].self.aggregation[\'contributionMarginRatio\']" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                           <div class="label" v-show="isPrevious">{{ui.dictionary.kpis.previous}}</div>',
        '                           <div class="label" v-show="isLastYear">{{ui.dictionary.kpis.lastYear}}</div>',
        '                           <div class="label" v-show="budget">{{ui.dictionary.kpis.budget}}</div>',
        '                   </div>',
        '               </div',
        '               ><div class="value-container" :class="{ negative : negatives.average[\'contributionMarginRatio\'] }">',
        '                   <div class="value" :style="{ borderColor : colors.average[\'contributionMarginRatio\'] }">',
        '                       <div v-if="currentType !== \'currentCashBook\' && rawdata[currentType] && rawdata[currentType].benchmark && rawdata[currentType].benchmark.aggregation && rawdata[currentType].benchmark.aggregation[\'contributionMarginRatio\']" class="number">{{formatNumber(rawdata[currentType].benchmark.aggregation[\'contributionMarginRatio\'], \'%\')}} <i v-show="rawdata[currentType].benchmark.aggregation.benchmarkCount.contributionMarginRatio" class="cwi-info tiny" :title="ui.dictionary.overview.sample + \': \' + rawdata[currentType].benchmark.aggregation.benchmarkCount.contributionMarginRatio"></i></div>',
        '                       <div v-if="currentType === \'currentCashBook\' && rawdata.current && rawdata.current.benchmark && rawdata.current.benchmark.aggregation && rawdata.current.benchmark.aggregation[\'contributionMarginRatio\']" class="number">{{formatNumber(rawdata.current.benchmark.aggregation[\'contributionMarginRatio\'], \'%\')}} <i v-show="rawdata.current.benchmark.aggregation.benchmarkCount.contributionMarginRatio" class="cwi-info tiny" :title="ui.dictionary.overview.sample + \': \' + rawdata.current.benchmark.aggregation.benchmarkCount.contributionMarginRatio"></i></div>',
        '                       <div v-if="(currentType !== \'currentCashBook\' && (!rawdata[currentType] || !rawdata[currentType].benchmark || !rawdata[currentType].benchmark.aggregation || !rawdata[currentType].benchmark.aggregation[\'contributionMarginRatio\'])) || (currentType === \'currentCashBook\' && (!rawdata.current || !rawdata.current.benchmark || !rawdata.current.benchmark.aggregation || !rawdata.current.benchmark.aggregation[\'contributionMarginRatio\']))" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                       <div class="label">{{ui.dictionary.kpis.average}}</div>',
        '                   </div>',
        '               </div>',
        '               <drilldown-card :kpi="getKpiObjectGeneral(\'contributionMarginRatio\', true)" :currentType="currentType" :previousType="previousType"></drilldown-card>',
        '           </div>',


                    /**
                     * Overhead Margin
                     */
        '           <div class="kpi-card" v-if="ui.breakdowns.profit">',

        '               <div class="icons">',
        '                   <i class="cwi-info" v-on:click="toggleTooltip(\'overheadMargin\')"></i><i class="cwi-sliders" v-on:click="toggleSliders(\'overheadMargin\'); disableTooltip(\'overheadMargin\');"></i>',
        '               </div>',


        '               <div class="heading">{{translateKpi(\'overheadMargin\')}} <div class="tooltip" :class="{ open : tooltips.overheadMargin }"><div class="equation"><math-formula :ignorePeriods="true" :numerator="[translateFormula(\'fixedCosts\')]" :denominator="[translateFormula(\'revenue\')]" inDenom="true" :isPercent="true" autoShow="true"></math-formula></div>{{translateDefinition(\'overheadMargin\')}}</div></div>',


        '               <div class="kpi-sliders" :class="{ open : sliders.overheadMargin }">',
        '                   <div class="slider">',
        '                       <div class="scale"><span>{{limits.overheadMargin.min}}%</span><span></span><span>{{limits.overheadMargin.max}}%</span></div>',
        '                       <input :disabled="rawdata[currentType].self.aggregation.revenue === 0" type="range" :min="limits.overheadMargin.min" :max="limits.overheadMargin.max" step="0.5" v-model="calcKpis.overheadMargin" v-on:input="revCalcOverheadMargin(calcKpis.overheadMargin)" v-on:change="revCalcOverheadMargin(calcKpis.overheadMargin)">',
        '                       <span class="disabled-label" v-show="rawdata[currentType].self.aggregation.revenue === 0">{{ui.dictionary.overview.sliderDisabled}}</span>',
        '                   </div>',
        '                   <div class="reset-button" v-show="rawdata[currentType].self.aggregation.revenue !== 0"><button v-on:click="resetOverheadMargin(originalKpiValues.overheadMargin)">{{ui.dictionary.overview.reset}}</button></div>',
        '               </div>',


        '               <div class="pie-chart-area">',
        '                   <bar-chart :kpi="getKpiObjectGeneral(\'overheadMargin\')"',
        '                              orientation="horizontal"',
        '                              :percent="true"></bar-chart>',
        '               </div>',

        '               <div class="value-container" :class="{ negative : negatives.current[\'overheadMargin\'] }">',
        '                   <div class="value" :style="{ borderColor : colors.current[\'overheadMargin\'] }">',
        '                       <div v-if="rawdata[currentType] && rawdata[currentType].self && rawdata[currentType].self.aggregation && rawdata[currentType].self.aggregation[\'overheadMargin\'] !== undefined" class="number">{{formatNumber(createKpiObjectMock(\'overheadMargin\'), \'%\')}}</div>',
        '                       <div v-if="!rawdata[currentType] || !rawdata[currentType].self || !rawdata[currentType].self.aggregation || rawdata[currentType].self.aggregation[\'overheadMargin\'] === undefined" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                       <div class="label">{{ui.dictionary.kpis.current}}</div>',
        '                   </div>',
        '               </div',
        '               ><div class="value-container" :class="{ negative : negatives.previous[\'overheadMargin\'] }">',
        '                   <div class="value" :title="getTitle" :style="{ borderColor : colors.previous[\'overheadMargin\'] }">',
        '                       <div v-if="rawdata[previousType] && rawdata[previousType].self && rawdata[previousType].self.aggregation && rawdata[previousType].self.aggregation[\'overheadMargin\']" class="number">{{formatNumber(rawdata[previousType].self.aggregation[\'overheadMargin\'], \'%\')}}</div>',
        '                       <div v-if="!rawdata[previousType] || !rawdata[previousType].self || !rawdata[previousType].self.aggregation || !rawdata[previousType].self.aggregation[\'overheadMargin\']" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                           <div class="label" v-show="isPrevious">{{ui.dictionary.kpis.previous}}</div>',
        '                           <div class="label" v-show="isLastYear">{{ui.dictionary.kpis.lastYear}}</div>',
        '                           <div class="label" v-show="budget">{{ui.dictionary.kpis.budget}}</div>',
        '                   </div>',
        '               </div',
        '               ><div class="value-container" :class="{ negative : negatives.average[\'overheadMargin\'] }">',
        '                   <div class="value" :style="{ borderColor : colors.average[\'overheadMargin\'] }">',
        '                       <div v-if="currentType !== \'currentCashBook\' && rawdata[currentType] && rawdata[currentType].benchmark && rawdata[currentType].benchmark.aggregation && rawdata[currentType].benchmark.aggregation[\'overheadMargin\']" class="number">{{formatNumber(rawdata[currentType].benchmark.aggregation[\'overheadMargin\'], \'%\')}} <i v-show="rawdata[currentType].benchmark.aggregation.benchmarkCount.overheadMargin" class="cwi-info tiny" :title="ui.dictionary.overview.sample + \': \' + rawdata[currentType].benchmark.aggregation.benchmarkCount.overheadMargin"></i></div>',
        '                       <div v-if="currentType === \'currentCashBook\' && rawdata.current && rawdata.current.benchmark && rawdata.current.benchmark.aggregation && rawdata.current.benchmark.aggregation[\'overheadMargin\']" class="number">{{formatNumber(rawdata.current.benchmark.aggregation[\'overheadMargin\'], \'%\')}} <i v-show="rawdata.current.benchmark.aggregation.benchmarkCount.overheadMargin" class="cwi-info tiny" :title="ui.dictionary.overview.sample + \': \' + rawdata.current.benchmark.aggregation.benchmarkCount.overheadMargin"></i></div>',
        '                       <div v-if="(currentType !== \'currentCashBook\' && (!rawdata[currentType] || !rawdata[currentType].benchmark || !rawdata[currentType].benchmark.aggregation || !rawdata[currentType].benchmark.aggregation[\'overheadMargin\'])) || (currentType === \'currentCashBook\' && (!rawdata.current || !rawdata.current.benchmark || !rawdata.current.benchmark.aggregation || !rawdata.current.benchmark.aggregation[\'overheadMargin\']))" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                       <div class="label">{{ui.dictionary.kpis.average}}</div>',
        '                   </div>',
        '               </div>',
        '               <drilldown-card :kpi="getKpiObjectGeneral(\'overheadMargin\', true)" :currentType="currentType" :previousType="previousType"></drilldown-card>',
        '           </div>',


                    /**
                     * Ex. Income/Expense Margin
                     */
        '           <div class="kpi-card" v-if="ui.breakdowns.profit">',

        '               <div class="icons">',
        '                   <i class="cwi-info" v-on:click="toggleTooltip(\'exIncomeExpenseMargin\')"></i><i class="cwi-sliders" v-on:click="toggleSliders(\'exIncomeExpenseMargin\'); disableTooltip(\'exIncomeExpenseMargin\');"></i>',
        '               </div>',

        '               <div class="heading">{{translateKpi(\'exIncomeExpenseMargin\')}} <div class="tooltip" :class="{ open : tooltips.exIncomeExpenseMargin }"><div class="equation"><math-formula :ignorePeriods="true" :numerator="[translateFormula(\'exIncome\'), \'-\', translateFormula(\'exExpense\')]" :denominator="[translateFormula(\'revenue\')]" inDenom="true" autoShow="true" :isPercent="true"></math-formula></div>{{translateDefinition(\'exIncomeExpenseMargin\')}}</div></div>',


        '               <div class="kpi-sliders" :class="{ open : sliders.exIncomeExpenseMargin }">',
        '                   <div class="slider">',
        '                       <div class="scale"><span>{{limits.exIncomeExpenseMargin.min}}%</span><span></span><span>{{limits.exIncomeExpenseMargin.max}}%</span></div>',
        '                       <input :disabled="rawdata[currentType].self.aggregation.revenue === 0" type="range" :min="limits.exIncomeExpenseMargin.min" :max="limits.exIncomeExpenseMargin.max" step="0.5" v-model="calcKpis.exIncomeExpenseMargin" v-on:input="revCalcExIncomeExpenseMargin(calcKpis.exIncomeExpenseMargin)" v-on:change="revCalcExIncomeExpenseMargin(calcKpis.exIncomeExpenseMargin)">',
        '                       <span class="disabled-label" v-show="rawdata[currentType].self.aggregation.revenue === 0">{{ui.dictionary.overview.sliderDisabled}}</span>',
        '                   </div>',
        '                   <div class="reset-button" v-show="rawdata[currentType].self.aggregation.revenue !== 0"><button v-on:click="resetExIncomeExpenseMargin(originalKpiValues.exIncomeExpenseMargin)">{{ui.dictionary.overview.reset}}</button></div>',
        '               </div>',


        '               <div class="pie-chart-area">',
        '                   <bar-chart :kpi="getKpiObjectGeneral(\'exIncomeExpenseMargin\')"',
        '                              orientation="horizontal"',
        '                              :percent="true"></bar-chart>',
        '               </div>',

        '               <div class="value-container" :class="{ negative : negatives.current[\'exIncomeExpenseMargin\'] }">',
        '                   <div class="value" :style="{ borderColor : colors.current[\'exIncomeExpenseMargin\'] }">',
        '                       <div v-if="rawdata[currentType] && rawdata[currentType].self && rawdata[currentType].self.aggregation && rawdata[currentType].self.aggregation[\'exIncomeExpenseMargin\'] !== undefined" class="number">{{formatNumber(createKpiObjectMock(\'exIncomeExpenseMargin\'), \'%\')}}</div>',
        '                       <div v-if="!rawdata[currentType] || !rawdata[currentType].self || !rawdata[currentType].self.aggregation || rawdata[currentType].self.aggregation[\'exIncomeExpenseMargin\'] === undefined" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                       <div class="label">{{ui.dictionary.kpis.current}}</div>',
        '                   </div>',
        '               </div',
        '               ><div class="value-container" :class="{ negative : negatives.previous[\'exIncomeExpenseMargin\'] }">',
        '                   <div class="value" :title="getTitle" :style="{ borderColor : colors.previous[\'exIncomeExpenseMargin\'] }">',
        '                       <div v-if="rawdata[previousType] && rawdata[previousType].self && rawdata[previousType].self.aggregation && rawdata[previousType].self.aggregation[\'exIncomeExpenseMargin\']" class="number">{{formatNumber(rawdata[previousType].self.aggregation[\'exIncomeExpenseMargin\'], \'%\')}}</div>',
        '                       <div v-if="!rawdata[previousType] || !rawdata[previousType].self || !rawdata[previousType].self.aggregation || !rawdata[previousType].self.aggregation[\'exIncomeExpenseMargin\']" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                           <div class="label" v-show="isPrevious">{{ui.dictionary.kpis.previous}}</div>',
        '                           <div class="label" v-show="isLastYear">{{ui.dictionary.kpis.lastYear}}</div>',
        '                           <div class="label" v-show="budget">{{ui.dictionary.kpis.budget}}</div>',
        '                   </div>',
        '               </div',
        '               ><div class="value-container" :class="{ negative : negatives.average[\'exIncomeExpenseMargin\'] }">',
        '                   <div class="value" :style="{ borderColor : colors.average[\'exIncomeExpenseMargin\'] }">',
        '                       <div v-if="currentType !== \'currentCashBook\' && rawdata[currentType] && rawdata[currentType].benchmark && rawdata[currentType].benchmark.aggregation && rawdata[currentType].benchmark.aggregation[\'exIncomeExpenseMargin\']" class="number">{{formatNumber(rawdata[currentType].benchmark.aggregation[\'exIncomeExpenseMargin\'], \'%\')}} <i v-show="rawdata[currentType].benchmark.aggregation.benchmarkCount.exIncomeExpenseMargin" class="cwi-info tiny" :title="ui.dictionary.overview.sample + \': \' + rawdata[currentType].benchmark.aggregation.benchmarkCount.exIncomeExpenseMargin"></i></div>',
        '                       <div v-if="currentType === \'currentCashBook\' && rawdata.current && rawdata.current.benchmark && rawdata.current.benchmark.aggregation && rawdata.current.benchmark.aggregation[\'exIncomeExpenseMargin\']" class="number">{{formatNumber(rawdata.current.benchmark.aggregation[\'exIncomeExpenseMargin\'], \'%\')}} <i v-show="rawdata.current.benchmark.aggregation.benchmarkCount.exIncomeExpenseMargin" class="cwi-info tiny" :title="ui.dictionary.overview.sample + \': \' + rawdata.current.benchmark.aggregation.benchmarkCount.exIncomeExpenseMargin"></i></div>',
        '                       <div v-if="(currentType !== \'currentCashBook\' && (!rawdata[currentType] || !rawdata[currentType].benchmark || !rawdata[currentType].benchmark.aggregation || !rawdata[currentType].benchmark.aggregation[\'exIncomeExpenseMargin\'])) || (currentType === \'currentCashBook\' && (!rawdata.current || !rawdata.current.benchmark || !rawdata.current.benchmark.aggregation || !rawdata.current.benchmark.aggregation[\'exIncomeExpenseMargin\']))" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                       <div class="label">{{ui.dictionary.kpis.average}}</div>',
        '                   </div>',
        '               </div>',
        '               <drilldown-card :kpi="getKpiObjectGeneral(\'exIncomeExpenseMargin\', true)" :currentType="currentType" :previousType="previousType"></drilldown-card>',
        '           </div>',


        '           <div class="kpi-card title-card clickable" v-on:click="toggleBreakdown(\'profit\')">',
        '               <span v-show="!ui.breakdowns.profit"><i class="cwi-down clickable"></i></span><span v-show="ui.breakdowns.profit"><i class="cwi-up clickable"></i></span>',
        '           </div>',


        '       </div>',



                /**
                 * Column 2
                 */
                '<div class="kpi-grid"',
        '            v-if="dashId == \'_general\'">',


        '           <div class="title-card">',
        '               <h3>{{translateKpi(\'liquidity\')}}</h3>',
        '           </div>',

                    /**
                     * Current Ratio
                     */
        '           <div class="kpi-card">',

        '               <div class="icons">',
        '                   <i class="cwi-info" v-on:click="toggleTooltip(\'currentRatio\')"></i>',
        '               </div>',

        '               <div class="heading">{{translateKpi(\'currentRatio\')}} <div class="tooltip" :class="{ open : tooltips.currentRatio }"><div class="equation"><math-formula :ignorePeriods="true" :numerator="[translateFormula(\'currentAssets\')]" :denominator="[translateFormula(\'currentLiabilities\')]" inDenom="true" autoShow="true"></math-formula></div>{{translateDefinition(\'currentRatio\')}}</div></div>',

        '               <div class="pie-chart-area">',
        '                   <bar-chart :kpi="getKpiObjectGeneral(\'currentRatio\')"',
        '                              orientation="vertical"></bar-chart>',
        '               </div>',

        '               <div class="value-container" :class="{ negative : negatives.current[\'currentRatio\'] }">',
        '                   <div class="value" :style="{ borderColor : colors.current[\'currentRatio\'] }">',
        '                       <div v-if="rawdata[currentType] && rawdata[currentType].self && rawdata[currentType].self.aggregation && rawdata[currentType].self.aggregation[\'currentRatio\'] !== undefined" class="number">{{formatNumber(rawdata[currentType].self.aggregation[\'currentRatio\'], \'x\')}}</div>',
        '                       <div v-if="!rawdata[currentType] || !rawdata[currentType].self || !rawdata[currentType].self.aggregation || rawdata[currentType].self.aggregation[\'currentRatio\'] === undefined" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                       <div class="label">{{ui.dictionary.kpis.current}}</div>',
        '                   </div>',
        '               </div',
        '               ><div class="value-container" :class="{ negative : negatives.previous[\'currentRatio\'] }">',
        '                   <div class="value" :title="getTitle" :style="{ borderColor : colors.previous[\'currentRatio\'] }">',
        '                       <div v-if="rawdata[previousType] && rawdata[previousType].self && rawdata[previousType].self.aggregation && rawdata[previousType].self.aggregation[\'currentRatio\']" class="number">{{formatNumber(rawdata[previousType].self.aggregation[\'currentRatio\'], \'x\')}}</div>',
        '                       <div v-if="!rawdata[previousType] || !rawdata[previousType].self || !rawdata[previousType].self.aggregation || !rawdata[previousType].self.aggregation[\'currentRatio\']" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                           <div class="label" v-show="isPrevious">{{ui.dictionary.kpis.previous}}</div>',
        '                           <div class="label" v-show="isLastYear">{{ui.dictionary.kpis.lastYear}}</div>',
        '                           <div class="label" v-show="budget">{{ui.dictionary.kpis.budget}}</div>',
        '                   </div>',
        '               </div',
        '               ><div class="value-container" :class="{ negative : negatives.average[\'currentRatio\'] }">',
        '                   <div class="value" :style="{ borderColor : colors.average[\'currentRatio\'] }">',
        '                       <div v-if="currentType !== \'currentCashBook\' && rawdata[currentType] && rawdata[currentType].benchmark && rawdata[currentType].benchmark.aggregation && rawdata[currentType].benchmark.aggregation[\'currentRatio\']" class="number">{{formatNumber(rawdata[currentType].benchmark.aggregation[\'currentRatio\'], \'x\')}} <i v-show="rawdata[currentType].benchmark.aggregation.benchmarkCount.currentRatio" class="cwi-info tiny" :title="ui.dictionary.overview.sample + \': \' + rawdata[currentType].benchmark.aggregation.benchmarkCount.currentRatio"></i></div>',
        '                       <div v-if="currentType === \'currentCashBook\' && rawdata.current && rawdata.current.benchmark && rawdata.current.benchmark.aggregation && rawdata.current.benchmark.aggregation[\'currentRatio\']" class="number">{{formatNumber(rawdata.current.benchmark.aggregation[\'currentRatio\'], \'x\')}} <i v-show="rawdata.current.benchmark.aggregation.benchmarkCount.currentRatio" class="cwi-info tiny" :title="ui.dictionary.overview.sample + \': \' + rawdata.current.benchmark.aggregation.benchmarkCount.currentRatio"></i></div>',
        '                       <div v-if="(currentType !== \'currentCashBook\' && (!rawdata[currentType] || !rawdata[currentType].benchmark || !rawdata[currentType].benchmark.aggregation || !rawdata[currentType].benchmark.aggregation[\'currentRatio\'])) || (currentType === \'currentCashBook\' && (!rawdata.current || !rawdata.current.benchmark || !rawdata.current.benchmark.aggregation || !rawdata.current.benchmark.aggregation[\'currentRatio\']))" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                       <div class="label">{{ui.dictionary.kpis.average}}</div>',
        '                   </div>',
        '               </div>',
        '               <drilldown-card :kpi="getKpiObjectGeneral(\'currentRatio\', true)" :currentType="currentType" :previousType="previousType"></drilldown-card>',
        '           </div>',

                    /**
                     * Quick Ratio
                     */
        '           <div class="kpi-card" v-if="ui.breakdowns.liquidity">',

        '               <div class="icons">',
        '                   <i class="cwi-info" v-on:click="toggleTooltip(\'quickRatio\')"></i>',
        '               </div>',


        '               <div class="heading">{{translateKpi(\'quickRatio\')}} <div class="tooltip" :class="{ open : tooltips.quickRatio }"><div class="equation"><math-formula :ignorePeriods="true" :numerator="[translateFormula(\'currentAssets\'), \'-\', translateFormula(\'inventory\')]" :denominator="[translateFormula(\'currentLiabilities\')]" inDenom="true" autoShow="true"></math-formula></div>{{translateDefinition(\'quickRatio\')}}</div></div>',

        '               <div class="pie-chart-area">',
        '                   <bar-chart :kpi="getKpiObjectGeneral(\'quickRatio\')"',
        '                              orientation="vertical"></bar-chart>',
        '               </div>',

        '               <div class="value-container" :class="{ negative : negatives.current[\'quickRatio\'] }">',
        '                   <div class="value" :style="{ borderColor : colors.current[\'quickRatio\'] }">',
        '                       <div v-if="rawdata[currentType] && rawdata[currentType].self && rawdata[currentType].self.aggregation && rawdata[currentType].self.aggregation[\'quickRatio\'] !== undefined" class="number">{{formatNumber(rawdata[currentType].self.aggregation[\'quickRatio\'], \'x\')}}</div>',
        '                       <div v-if="!rawdata[currentType] || !rawdata[currentType].self || !rawdata[currentType].self.aggregation || rawdata[currentType].self.aggregation[\'quickRatio\'] === undefined" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                       <div class="label">{{ui.dictionary.kpis.current}}</div>',
        '                   </div>',
        '               </div',
        '               ><div class="value-container" :class="{ negative : negatives.previous[\'quickRatio\'] }">',
        '                   <div class="value" :title="getTitle" :style="{ borderColor : colors.previous[\'quickRatio\'] }">',
        '                       <div v-if="rawdata[previousType] && rawdata[previousType].self && rawdata[previousType].self.aggregation && rawdata[previousType].self.aggregation[\'quickRatio\']" class="number">{{formatNumber(rawdata[previousType].self.aggregation[\'quickRatio\'], \'x\')}}</div>',
        '                       <div v-if="!rawdata[previousType] || !rawdata[previousType].self || !rawdata[previousType].self.aggregation || !rawdata[previousType].self.aggregation[\'quickRatio\']" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                           <div class="label" v-show="isPrevious">{{ui.dictionary.kpis.previous}}</div>',
        '                           <div class="label" v-show="isLastYear">{{ui.dictionary.kpis.lastYear}}</div>',
        '                           <div class="label" v-show="budget">{{ui.dictionary.kpis.budget}}</div>',
        '                   </div>',
        '               </div',
        '               ><div class="value-container" :class="{ negative : negatives.average[\'quickRatio\'] }">',
        '                   <div class="value" :style="{ borderColor : colors.average[\'quickRatio\'] }">',
        '                       <div v-if="currentType !== \'currentCashBook\' && rawdata[currentType] && rawdata[currentType].benchmark && rawdata[currentType].benchmark.aggregation && rawdata[currentType].benchmark.aggregation[\'quickRatio\']" class="number">{{formatNumber(rawdata[currentType].benchmark.aggregation[\'quickRatio\'], \'x\')}} <i v-show="rawdata[currentType].benchmark.aggregation.benchmarkCount.quickRatio" class="cwi-info tiny" :title="ui.dictionary.overview.sample + \': \' + rawdata[currentType].benchmark.aggregation.benchmarkCount.quickRatio"></i></div>',
        '                       <div v-if=" currentType === \'currentCashBook\' && rawdata.current && rawdata.current.benchmark && rawdata.current.benchmark.aggregation && rawdata.current.benchmark.aggregation[\'quickRatio\']" class="number">{{formatNumber(rawdata.current.benchmark.aggregation[\'quickRatio\'], \'%\')}} <i v-show="rawdata.current.benchmark.aggregation.benchmarkCount.quickRatio" class="cwi-info tiny" :title="ui.dictionary.overview.sample + \': \' + rawdata.current.benchmark.aggregation.benchmarkCount.quickRatio"></i></div>',
        '                       <div v-if="(currentType !== \'currentCashBook\' && (!rawdata[currentType] || !rawdata[currentType].benchmark || !rawdata[currentType].benchmark.aggregation || !rawdata[currentType].benchmark.aggregation[\'quickRatio\'])) || (currentType === \'currentCashBook\' && (!rawdata.current || !rawdata.current.benchmark || !rawdata.current.benchmark.aggregation || !rawdata.current.benchmark.aggregation[\'quickRatio\']))" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                       <div class="label">{{ui.dictionary.kpis.average}}</div>',
        '                   </div>',
        '               </div>',
        '               <drilldown-card :kpi="getKpiObjectGeneral(\'quickRatio\', true)" :currentType="currentType" :previousType="previousType"></drilldown-card>',
        '           </div>',

        '           <div class="kpi-card title-card clickable" v-on:click="toggleBreakdown(\'liquidity\')">',
        '               <span v-show="!ui.breakdowns.liquidity"><i class="cwi-down clickable"></i></span><span v-show="ui.breakdowns.liquidity"><i class="cwi-up clickable"></i></span>',
        '           </div>',

        '       </div>',



                /**
                 * Column 3
                 */
                '<div class="kpi-grid"',
        '            v-if="dashId == \'_general\'">',


        '           <div class="title-card">',
        '               <h3>{{translateKpi(\'activity\')}}</h3>',
        '           </div>',

                    /**
                     * Asset Turnover
                     */
        '           <div class="kpi-card">',

        '               <div class="icons">',
        '                   <i class="cwi-info" v-on:click="toggleTooltip(\'assetTurnover\')"></i>',
        '               </div>',


        '               <div class="heading">{{translateKpi(\'assetTurnover\')}} <div class="tooltip" :class="{ open : tooltips.assetTurnover }"><div class="equation"><math-formula :ignorePeriods="true" :numerator="[translateFormula(\'revenue\')]" :denominator="[translateFormula(\'totalAssets\')]" inDenom="true" autoShow="true"></math-formula></div>{{translateDefinition(\'assetTurnover\')}}</div></div>',

        '               <div class="pie-chart-area">',
        '                   <bar-chart :kpi="getKpiObjectGeneral(\'assetTurnover\')"',
        '                              orientation="vertical"></bar-chart>',
        '               </div>',

        '               <div class="value-container" :class="{ negative : negatives.current[\'assetTurnover\'] }">',
        '                   <div class="value" :style="{ borderColor : colors.current[\'assetTurnover\'] }">',
        '                       <div v-if="rawdata[currentType] && rawdata[currentType].self && rawdata[currentType].self.aggregation && rawdata[currentType].self.aggregation[\'assetTurnover\'] !== undefined" class="number">{{formatNumber(rawdata[currentType].self.aggregation[\'assetTurnover\'], \'x\')}}</div>',
        '                       <div v-if="!rawdata[currentType] || !rawdata[currentType].self || !rawdata[currentType].self.aggregation || rawdata[currentType].self.aggregation[\'assetTurnover\'] === undefined" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                       <div class="label">{{ui.dictionary.kpis.current}}</div>',
        '                   </div>',
        '               </div',
        '               ><div class="value-container" :class="{ negative : negatives.previous[\'assetTurnover\'] }">',
        '                   <div class="value" :title="getTitle" :style="{ borderColor : colors.previous[\'assetTurnover\'] }">',
        '                       <div v-if="rawdata[previousType] && rawdata[previousType].self && rawdata[previousType].self.aggregation && rawdata[previousType].self.aggregation[\'assetTurnover\']" class="number">{{formatNumber(rawdata[previousType].self.aggregation[\'assetTurnover\'], \'x\')}}</div>',
        '                       <div v-if="!rawdata[previousType] || !rawdata[previousType].self || !rawdata[previousType].self.aggregation || !rawdata[previousType].self.aggregation[\'assetTurnover\']" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                           <div class="label" v-show="isPrevious">{{ui.dictionary.kpis.previous}}</div>',
        '                           <div class="label" v-show="isLastYear">{{ui.dictionary.kpis.lastYear}}</div>',
        '                           <div class="label" v-show="budget">{{ui.dictionary.kpis.budget}}</div>',
        '                   </div>',
        '               </div',
        '               ><div class="value-container" :class="{ negative : negatives.average[\'assetTurnover\'] }">',
        '                   <div class="value" :style="{ borderColor : colors.average[\'assetTurnover\'] }">',
        '                       <div v-if="currentType !== \'currentCashBook\' && rawdata[currentType] && rawdata[currentType].benchmark && rawdata[currentType].benchmark.aggregation && rawdata[currentType].benchmark.aggregation[\'assetTurnover\']" class="number">{{formatNumber(rawdata[currentType].benchmark.aggregation[\'assetTurnover\'], \'x\')}} <i v-show="rawdata[currentType].benchmark.aggregation.benchmarkCount.assetTurnover" class="cwi-info tiny" :title="ui.dictionary.overview.sample + \': \' + rawdata[currentType].benchmark.aggregation.benchmarkCount.assetTurnover"></i></div>',
        '                       <div v-if="currentType === \'currentCashBook\' && rawdata.current && rawdata.current.benchmark && rawdata.current.benchmark.aggregation && rawdata.current.benchmark.aggregation[\'assetTurnover\']" class="number">{{formatNumber(rawdata.current.benchmark.aggregation[\'assetTurnover\'], \'x\')}} <i v-show="rawdata.current.benchmark.aggregation.benchmarkCount.assetTurnover" class="cwi-info tiny" :title="ui.dictionary.overview.sample + \': \' + rawdata.current.benchmark.aggregation.benchmarkCount.assetTurnover"></i></div>',
        '                       <div v-if="(currentType !== \'currentCashBook\' && (!rawdata[currentType] || !rawdata[currentType].benchmark || !rawdata[currentType].benchmark.aggregation || !rawdata[currentType].benchmark.aggregation[\'assetTurnover\'])) || (currentType === \'currentCashBook\' && (!rawdata.current || !rawdata.current.benchmark || !rawdata.current.benchmark.aggregation || !rawdata.current.benchmark.aggregation[\'assetTurnover\']))" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                       <div class="label">{{ui.dictionary.kpis.average}}</div>',
        '                   </div>',
        '               </div>',
        '               <drilldown-card :kpi="getKpiObjectGeneral(\'assetTurnover\', true)" :currentType="currentType" :previousType="previousType"></drilldown-card>',
        '           </div>',

                    /**
                     * Inventory Turnover
                     */
        '           <div class="kpi-card" v-if="ui.breakdowns.activity">',

        '               <div class="icons">',
        '                   <i class="cwi-info" v-on:click="toggleTooltip(\'inventoryTurnover\')"></i>',
        '               </div>',


        '               <div class="heading">{{translateKpi(\'inventoryTurnover\')}} <div class="tooltip" :class="{ open : tooltips.inventoryTurnover }"><div class="equation"><math-formula :ignorePeriods="true" :numerator="[translateFormula(\'revenue\')]" :denominator="[translateFormula(\'inventory\')]" inDenom="true" autoShow="true"></math-formula></div>{{translateDefinition(\'inventoryTurnover\')}}</div></div>',

        '               <div class="pie-chart-area">',
        '                   <bar-chart :kpi="getKpiObjectGeneral(\'inventoryTurnover\')"',
        '                              orientation="vertical"></bar-chart>',
        '               </div>',

        '               <div class="value-container" :class="{ negative : negatives.current[\'inventoryTurnover\'] }">',
        '                   <div class="value" :style="{ borderColor : colors.current[\'inventoryTurnover\'] }">',
        '                       <div v-if="rawdata[currentType] && rawdata[currentType].self && rawdata[currentType].self.aggregation && rawdata[currentType].self.aggregation[\'inventoryTurnover\'] !== undefined" class="number">{{formatNumber(rawdata[currentType].self.aggregation[\'inventoryTurnover\'], \'x\')}}</div>',
        '                       <div v-if="!rawdata[currentType] || !rawdata[currentType].self || !rawdata[currentType].self.aggregation || rawdata[currentType].self.aggregation[\'inventoryTurnover\'] === undefined" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                       <div class="label">{{ui.dictionary.kpis.current}}</div>',
        '                   </div>',
        '               </div',
        '               ><div class="value-container" :class="{ negative : negatives.previous[\'inventoryTurnover\'] }">',
        '                   <div class="value" :title="getTitle" :style="{ borderColor : colors.previous[\'inventoryTurnover\'] }">',
        '                       <div v-if="rawdata[previousType] && rawdata[previousType].self && rawdata[previousType].self.aggregation && rawdata[previousType].self.aggregation[\'inventoryTurnover\']" class="number">{{formatNumber(rawdata[previousType].self.aggregation[\'inventoryTurnover\'], \'x\')}}</div>',
        '                       <div v-if="!rawdata[previousType] || !rawdata[previousType].self || !rawdata[previousType].self.aggregation || !rawdata[previousType].self.aggregation[\'inventoryTurnover\']" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                           <div class="label" v-show="isPrevious">{{ui.dictionary.kpis.previous}}</div>',
        '                           <div class="label" v-show="isLastYear">{{ui.dictionary.kpis.lastYear}}</div>',
        '                           <div class="label" v-show="budget">{{ui.dictionary.kpis.budget}}</div>',
        '                   </div>',
        '               </div',
        '               ><div class="value-container" :class="{ negative : negatives.average[\'inventoryTurnover\'] }">',
        '                   <div class="value" :style="{ borderColor : colors.average[\'inventoryTurnover\'] }">',
        '                       <div v-if="currentType !== \'currentCashBook\' && rawdata[currentType] && rawdata[currentType].benchmark && rawdata[currentType].benchmark.aggregation && rawdata[currentType].benchmark.aggregation[\'inventoryTurnover\']" class="number">{{formatNumber(rawdata[currentType].benchmark.aggregation[\'inventoryTurnover\'], \'x\')}} <i v-show="rawdata[currentType].benchmark.aggregation.benchmarkCount.inventoryTurnover" class="cwi-info tiny" :title="ui.dictionary.overview.sample + \': \' + rawdata[currentType].benchmark.aggregation.benchmarkCount.inventoryTurnover"></i></div>',
        '                       <div v-if="currentType === \'currentCashBook\' && rawdata.current && rawdata.current.benchmark && rawdata.current.benchmark.aggregation && rawdata.current.benchmark.aggregation[\'inventoryTurnover\']" class="number">{{formatNumber(rawdata.current.benchmark.aggregation[\'inventoryTurnover\'], \'%\')}} <i v-show="rawdata.current.benchmark.aggregation.benchmarkCount.inventoryTurnover" class="cwi-info tiny" :title="ui.dictionary.overview.sample + \': \' + rawdata.current.benchmark.aggregation.benchmarkCount.inventoryTurnover"></i></div>',
        '                       <div v-if="(currentType !== \'currentCashBook\' && (!rawdata[currentType] || !rawdata[currentType].benchmark || !rawdata[currentType].benchmark.aggregation || !rawdata[currentType].benchmark.aggregation[\'inventoryTurnover\'])) || (currentType === \'currentCashBook\' && (!rawdata.current || !rawdata.current.benchmark || !rawdata.current.benchmark.aggregation || !rawdata.current.benchmark.aggregation[\'inventoryTurnover\']))" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                       <div class="label">{{ui.dictionary.kpis.average}}</div>',
        '                   </div>',
        '               </div>',
        '               <drilldown-card :kpi="getKpiObjectGeneral(\'inventoryTurnover\', true)" :currentType="currentType" :previousType="previousType"></drilldown-card>',
        '           </div>',

        '           <div class="kpi-card title-card clickable" v-on:click="toggleBreakdown(\'activity\')">',
        '               <span v-show="!ui.breakdowns.activity"><i class="cwi-down clickable"></i></span><span v-show="ui.breakdowns.activity"><i class="cwi-up clickable"></i></span>',
        '           </div>',

        '       </div>',



                /**
                 * Column 4
                 */
                '<div class="kpi-grid"',
        '            v-if="dashId == \'_general\'">',


        '           <div class="title-card">',
        '               <h3>{{translateKpi(\'solvency\')}}</h3>',
        '           </div>',

                    /**
                     * Debt to Asset Ratio
                     */
        '           <div class="kpi-card" v-if="getKpiObjectGeneral(\'debtToAssetRatioTemp\', true)">',

        '               <div class="icons">',
        '                   <i class="cwi-info" v-on:click="toggleTooltip(\'debtToAssetRatioTemp\')"></i>',
        '               </div>',


        '               <div class="heading">{{translateKpi(\'debtToAssetRatioTemp\')}} <div class="tooltip" :class="{ open : tooltips.debtToAssetRatioTemp }"><div class="equation"><math-formula :ignorePeriods="true" :numerator="[translateFormula(\'totalLiabilities\')]" :denominator="[translateFormula(\'totalAssets\')]" inDenom="true" :isPercent="false" autoShow="true"></math-formula></div>{{translateDefinition(\'debtToAssetRatioTemp\')}}</div></div>',

        '               <div class="pie-chart-area">',
        '                   <bar-chart :kpi="getKpiObjectGeneral(\'debtToAssetRatioTemp\')"',
        '                              orientation="horizontal"',
        '                              :percent="true"></bar-chart>',
        '               </div>',

        '               <div class="value-container" :class="{ negative : negatives.current[\'debtToAssetRatioTemp\'] }">',
        '                   <div class="value" :style="{ borderColor : colors.current[\'debtToAssetRatioTemp\'] }">',
        '                       <div v-if="rawdata[currentType] && rawdata[currentType].self && rawdata[currentType].self.aggregation && rawdata[currentType].self.aggregation[\'debtToAssetRatioTemp\'] !== undefined" class="number">{{formatNumber(rawdata[currentType].self.aggregation[\'debtToAssetRatioTemp\'], \'%\')}}</div>',
        '                       <div v-if="!rawdata[currentType] || !rawdata[currentType].self || !rawdata[currentType].self.aggregation || rawdata[currentType].self.aggregation[\'debtToAssetRatioTemp\'] === undefined" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                       <div class="label">{{ui.dictionary.kpis.current}}</div>',
        '                   </div>',
        '               </div',
        '               ><div class="value-container" :class="{ negative : negatives.previous[\'debtToAssetRatioTemp\'] }">',
        '                   <div class="value" :title="getTitle" :style="{ borderColor : colors.previous[\'debtToAssetRatioTemp\'] }">',
        '                       <div v-if="rawdata[previousType] && rawdata[previousType].self && rawdata[previousType].self.aggregation && rawdata[previousType].self.aggregation[\'debtToAssetRatioTemp\']" class="number">{{formatNumber(rawdata[previousType].self.aggregation[\'debtToAssetRatioTemp\'], \'%\')}}</div>',
        '                       <div v-if="!rawdata[previousType] || !rawdata[previousType].self || !rawdata[previousType].self.aggregation || !rawdata[previousType].self.aggregation[\'debtToAssetRatioTemp\']" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                           <div class="label" v-show="isPrevious">{{ui.dictionary.kpis.previous}}</div>',
        '                           <div class="label" v-show="isLastYear">{{ui.dictionary.kpis.lastYear}}</div>',
        '                           <div class="label" v-show="budget">{{ui.dictionary.kpis.budget}}</div>',
        '                   </div>',
        '               </div',
        '               ><div class="value-container" :class="{ negative : negatives.average[\'debtToAssetRatioTemp\'] }">',
        '                   <div class="value" :style="{ borderColor : colors.average[\'debtToAssetRatioTemp\'] }">',
        '                       <div v-if="currentType !== \'currentCashBook\' && rawdata[currentType] && rawdata[currentType].benchmark && rawdata[currentType].benchmark.aggregation && rawdata[currentType].benchmark.aggregation[\'debtToAssetRatioTemp\']" class="number">{{formatNumber(rawdata[currentType].benchmark.aggregation[\'debtToAssetRatioTemp\'], \'%\')}} <i v-show="rawdata[currentType].benchmark.aggregation.benchmarkCount.debtToAssetRatioTemp" class="cwi-info tiny" :title="ui.dictionary.overview.sample + \': \' + rawdata[currentType].benchmark.aggregation.benchmarkCount.debtToAssetRatioTemp"></i></div>',
        '                       <div v-if="currentType === \'currentCashBook\' && rawdata.current && rawdata.current.benchmark && rawdata.current.benchmark.aggregation && rawdata.current.benchmark.aggregation[\'debtToAssetRatioTemp\']" class="number">{{formatNumber(rawdata.current.benchmark.aggregation[\'debtToAssetRatioTemp\'], \'%\')}} <i v-show="rawdata.current.benchmark.aggregation.benchmarkCount.debtToAssetRatioTemp" class="cwi-info tiny" :title="ui.dictionary.overview.sample + \': \' + rawdata.current.benchmark.aggregation.benchmarkCount.debtToAssetRatioTemp"></i></div>',
        '                       <div v-if="(currentType !== \'currentCashBook\' && (!rawdata[currentType] || !rawdata[currentType].benchmark || !rawdata[currentType].benchmark.aggregation || !rawdata[currentType].benchmark.aggregation[\'debtToAssetRatioTemp\'])) || (currentType === \'currentCashBook\' && (!rawdata.current || !rawdata.current.benchmark || !rawdata.current.benchmark.aggregation || !rawdata.current.benchmark.aggregation[\'debtToAssetRatioTemp\']))" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                       <div class="label">{{ui.dictionary.kpis.average}}</div>',
        '                   </div>',
        '               </div>',
        '               <drilldown-card :kpi="getKpiObjectGeneral(\'debtToAssetRatioTemp\', true)" :currentType="currentType" :previousType="previousType"></drilldown-card>',
        '           </div>',

                    /**
                     * Equity to Asset Ratio
                     */
        '           <div class="kpi-card" v-if="getKpiObjectGeneral(\'EquityToAssetRatio\', true)">',

        '               <div class="icons">',
        '                   <i class="cwi-info" v-on:click="toggleTooltip(\'EquityToAssetRatio\')"></i>',
        '               </div>',


        '               <div class="heading">{{translateKpi(\'EquityToAssetRatio\')}} <div class="tooltip" :class="{ open : tooltips.EquityToAssetRatio }"><div class="equation"><math-formula :ignorePeriods="true" :numerator="[translateFormula(\'totalLiabilities\')]" :denominator="[translateFormula(\'totalAssets\')]" inDenom="true" :isPercent="false" autoShow="true"></math-formula></div>{{translateDefinition(\'EquityToAssetRatio\')}}</div></div>',

        '               <div class="pie-chart-area">',
        '                   <bar-chart :kpi="getKpiObjectGeneral(\'EquityToAssetRatio\')"',
        '                              orientation="horizontal"',
        '                              :percent="true"></bar-chart>',
        '               </div>',

        '               <div class="value-container" :class="{ negative : negatives.current[\'EquityToAssetRatio\'] }">',
        '                   <div class="value" :style="{ borderColor : colors.current[\'EquityToAssetRatio\'] }">',
        '                       <div v-if="rawdata[currentType] && rawdata[currentType].self && rawdata[currentType].self.aggregation && rawdata[currentType].self.aggregation[\'EquityToAssetRatio\'] !== undefined" class="number">{{formatNumber(rawdata[currentType].self.aggregation[\'EquityToAssetRatio\'], \'%\')}}</div>',
        '                       <div v-if="!rawdata[currentType] || !rawdata[currentType].self || !rawdata[currentType].self.aggregation || rawdata[currentType].self.aggregation[\'EquityToAssetRatio\'] === undefined" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                       <div class="label">{{ui.dictionary.kpis.current}}</div>',
        '                   </div>',
        '               </div',
        '               ><div class="value-container" :class="{ negative : negatives.previous[\'EquityToAssetRatio\'] }">',
        '                   <div class="value" :title="getTitle" :style="{ borderColor : colors.previous[\'EquityToAssetRatio\'] }">',
        '                       <div v-if="rawdata[previousType] && rawdata[previousType].self && rawdata[previousType].self.aggregation && rawdata[previousType].self.aggregation[\'EquityToAssetRatio\']" class="number">{{formatNumber(rawdata[previousType].self.aggregation[\'EquityToAssetRatio\'], \'%\')}}</div>',
        '                       <div v-if="!rawdata[previousType] || !rawdata[previousType].self || !rawdata[previousType].self.aggregation || !rawdata[previousType].self.aggregation[\'EquityToAssetRatio\']" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                           <div class="label" v-show="isPrevious">{{ui.dictionary.kpis.previous}}</div>',
        '                           <div class="label" v-show="isLastYear">{{ui.dictionary.kpis.lastYear}}</div>',
        '                           <div class="label" v-show="budget">{{ui.dictionary.kpis.budget}}</div>',
        '                   </div>',
        '               </div',
        '               ><div class="value-container" :class="{ negative : negatives.average[\'EquityToAssetRatio\'] }">',
        '                   <div class="value" :style="{ borderColor : colors.average[\'EquityToAssetRatio\'] }">',
        '                       <div v-if="currentType !== \'currentCashBook\' && rawdata[currentType] && rawdata[currentType].benchmark && rawdata[currentType].benchmark.aggregation && rawdata[currentType].benchmark.aggregation[\'EquityToAssetRatio\']" class="number">{{formatNumber(rawdata[currentType].benchmark.aggregation[\'EquityToAssetRatio\'], \'%\')}} <i v-show="rawdata[currentType].benchmark.aggregation.benchmarkCount.EquityToAssetRatio" class="cwi-info tiny" :title="ui.dictionary.overview.sample + \': \' + rawdata[currentType].benchmark.aggregation.benchmarkCount.EquityToAssetRatio"></i></div>',
        '                       <div v-if="currentType === \'currentCashBook\' && rawdata.current && rawdata.current.benchmark && rawdata.current.benchmark.aggregation && rawdata.current.benchmark.aggregation[\'EquityToAssetRatio\']" class="number">{{formatNumber(rawdata.current.benchmark.aggregation[\'EquityToAssetRatio\'], \'%\')}} <i v-show="rawdata.current.benchmark.aggregation.benchmarkCount.EquityToAssetRatio" class="cwi-info tiny" :title="ui.dictionary.overview.sample + \': \' + rawdata.current.benchmark.aggregation.benchmarkCount.EquityToAssetRatio"></i></div>',
        '                       <div v-if="(currentType !== \'currentCashBook\' && (!rawdata[currentType] || !rawdata[currentType].benchmark || !rawdata[currentType].benchmark.aggregation || !rawdata[currentType].benchmark.aggregation[\'EquityToAssetRatio\'])) || (currentType === \'currentCashBook\' && (!rawdata.current || !rawdata.current.benchmark || !rawdata.current.benchmark.aggregation || !rawdata.current.benchmark.aggregation[\'EquityToAssetRatio\']))" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>',
        '                       <div class="label">{{ui.dictionary.kpis.average}}</div>',
        '                   </div>',
        '               </div>',
        '               <drilldown-card :kpi="getKpiObjectGeneral(\'EquityToAssetRatio\', true)" :currentType="currentType" :previousType="previousType"></drilldown-card>',
        '           </div>',

        '       </div>',


        '</article>'
    ].join('');


    /**
     * Data bindings
     */
    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                breakdowns : {
                    profit : false,
                    liquidity : false,
                    activity : false,
                    solvency : false
                },
                fixLabels : false
            },
            currentType : 'current',
            previousType : 'previous',
            colors : {
                current : {},
                previous : {},
                average : {}
            },
            negatives : {
                current : {},
                previous : {},
                average : {}
            },
            tooltips : {},
            sliders : {},
            originalKpiValues : {
                contributionMarginRatio : 0,
                overheadMargin : 0,
                exIncomeExpenseMargin : 0
            },
            calcKpis : {
                contributionMarginRatio : 0,
                overheadMargin : 0,
                exIncomeExpenseMargin : 0
            },
            tracker : '',
            limits : {
                contributionMarginRatio : {
                    min : -100,
                    max : 100
                },
                overheadMargin : {
                    min : 0,
                    max : 100
                },
                exIncomeExpenseMargin : {
                    min : -100,
                    max : 100
                }
            },
            fixLabels : false,
            boxBottom : 0,
            labelWidth : 0,
            labelHeight : 0
        };
    };


    /**
     * Methods
     */
    var methods = {
        init : function() {
            this.setDataType();
            this.setCalcKpis();
            this.calculateLabelProps();
            window.addEventListener('scroll', this.watchScroll);
        },

        calculateLabelProps : function() {
            if (!this.$refs.kpigrid.querySelector('#profit-box')) {
                return false;
            }
            var boxEl = this.$refs.kpigrid.querySelector('#profit-box').getBoundingClientRect();
            var labelEl = this.$refs.kpigrid.querySelector('#profit-labels').getBoundingClientRect();
            this.boxBottom = boxEl.bottom;
            this.labelWidth = boxEl.width - 8;
            this.labelHeight = labelEl.height + 20;
        },

        watchScroll : function() {
            if (!this.boxBottom) {
                this.calculateLabelProps();
            }

            var delta = this.boxBottom - window.pageYOffset;

            if (delta < this.labelHeight) {
                this.fixLabels = true;
            } else {
                this.fixLabels = false;
            }
        },

        setCalcKpis : function() {
            var formulas = this.kpiFormulas();

            Vue.set(this.calcKpis, 'contributionMarginRatio', formulas.contributionMarginRatio() * 100);
            Vue.set(this.calcKpis, 'overheadMargin', formulas.overheadMargin() * 100);
            Vue.set(this.calcKpis, 'exIncomeExpenseMargin', formulas.exIncomeExpenseMargin() * 100);

            this.originalKpiValues.contributionMarginRatio = this.calcKpis.contributionMarginRatio;
            this.originalKpiValues.overheadMargin = this.calcKpis.overheadMargin;
            this.originalKpiValues.exIncomeExpenseMargin = this.calcKpis.exIncomeExpenseMargin;

            this.setLimits();
        },

        setLimits : function() {
            var cmrLimit = (Math.ceil(Math.abs(this.calcKpis.contributionMarginRatio) / 100) * 100) || 100;
            var omLimit = (Math.ceil(Math.abs(this.calcKpis.overheadMargin) / 100) * 100) || 100;
            var eiemLimit = (Math.ceil(Math.abs(this.calcKpis.exIncomeExpenseMargin) / 100) * 100) || 100;

            this.limits.contributionMarginRatio.min = cmrLimit * -1;
            this.limits.contributionMarginRatio.max = cmrLimit;

            this.limits.overheadMargin.max = omLimit;

            this.limits.exIncomeExpenseMargin.min = eiemLimit * -1;
            this.limits.exIncomeExpenseMargin.max = eiemLimit;
        },

        resetContributionMarginRatio : function(value) {
            this.calcKpis.contributionMarginRatio = value;
            this.revCalcContributionMarginRatio(value);
        },

        resetOverheadMargin : function(value) {
            this.calcKpis.overheadMargin = value;
            this.revCalcOverheadMargin(value);
        },

        resetExIncomeExpenseMargin : function(value) {
            this.calcKpis.exIncomeExpenseMargin = value;
            this.revCalcExIncomeExpenseMargin(value);
        },

        /**
         * Sliders
         */
        toggleSliders : function(key) {
            if (this.sliders[key]) {
                Vue.set(this.sliders, key, false);
            } else {
                Vue.set(this.sliders, key, true);
            }
        },


        showValueBubble : function(event) {
            var controlThumbWidth = 20;
            var control = event.currentTarget,
                controlMin = control.getAttribute('min'),
                controlMax = control.getAttribute('max'),
                controlVal = control.value;

            var range = controlMax - controlMin;
            var position = ((controlVal - controlMin) / range) * 100;
            var positionOffset = Math.round(controlThumbWidth * position / 100) - (controlThumbWidth / 2);
            this.tracker = 'calc(' + position + '% - ' + positionOffset + 'px)';
        },


        revCalcContributionMarginRatio : function(value) {
            var result = parseFloat(value) / 100;
            var revenue = parseFloat(this.rawdata[this.currentType].self.aggregation.revenue);

            result *= revenue;
            result -= revenue;

            this.rawdata[this.currentType].self.aggregation.VariableCosts = -1 * result;
        },


        revCalcOverheadMargin : function(value) {
            var result = parseFloat(value) / 100;
            var revenue = parseFloat(this.rawdata[this.currentType].self.aggregation.revenue);

            result *= revenue;

            this.rawdata[this.currentType].self.aggregation.fixedCosts = result;
        },

        revCalcExIncomeExpenseMargin : function(value) {
            var result = parseFloat(value) / 100;
            var revenue = parseFloat(this.rawdata[this.currentType].self.aggregation.revenue);

            result *= revenue;
            //result -= revenue;

            this.rawdata[this.currentType].self.aggregation.exIncomeExpense = result;
        },


        kpiFormulas : function() {
            var scope = this;
            var revenue = parseFloat(scope.rawdata[scope.currentType].self.aggregation.revenue);
            var variableCosts = parseFloat(scope.rawdata[scope.currentType].self.aggregation.VariableCosts);
            var fixedCosts = parseFloat(scope.rawdata[scope.currentType].self.aggregation.fixedCosts) || 0.01;
            var exIncomeExpense = parseFloat(scope.rawdata[scope.currentType].self.aggregation.exIncomeExpense) || 0.1;

            return {
                profitMargin : function() {
                    if (revenue === 0) {
                        return 0;
                    }

                    var result = (revenue - variableCosts - fixedCosts + exIncomeExpense) / revenue;

                    return result;
                },

                contributionMarginRatio : function() {
                    if (revenue === 0) {
                        return 0;
                    }

                    var result = (revenue - variableCosts) / revenue;

                    return result;
                },

                overheadMargin : function() {
                    if (revenue === 0) {
                        return 0;
                    }

                    var result = fixedCosts / revenue;

                    return result;
                },

                exIncomeExpenseMargin : function() {
                    if (revenue === 0) {
                        return 0;
                    }

                    var result = exIncomeExpense / revenue;

                    return result;
                }
            };
        },

        hasDescription : function(key) {
            if (this.ui.dictionary.kpis.def[key]) {
                return true;
            }

            return false;
        },

        translateCustomDefinition : function(kpi) {
            if (kpi.description) {
                return kpi.description;
            }

            return this.translateDefinition(kpi.kpi.name);
        },

        toggleTooltip : function(index) {
            if (this.tooltips[index]) {
                Vue.set(this.tooltips, index, false);
            } else {
                Vue.set(this.tooltips, index, true);
            }
        },

        disableTooltip : function (index) {
            Vue.set(this.tooltips, index, false);
        },

        setDataType : function() {
            if (this.cashbook) {
                this.currentType = 'currentCashBook';
                this.previousType = this.budget ? 'budget' : 'previousCashBook';
            } else {
                this.currentType = 'current';
                this.previousType = this.budget ? 'budget' : 'previous';
            }
        },


        byOrder : function(arr) {
            //We use slice() to return a copy of the array
            //because sort mutates the original. This may
            //cause an infinite loop in Vue's template render.
            return arr.slice().sort(function(a, b) {
                return a.order - b.order;
            });
        },

        translateFormula : function(key) {
            if (this.easyview && this.ui.dictionary.formulaVariables.easyview[key]) {
                return this.ui.dictionary.formulaVariables.easyview[key];
            } else if (this.ui.dictionary.formulaVariables[key]) {
                return this.ui.dictionary.formulaVariables[key];
            }

            return key;
        },

        translateKpi : function(key) {
            this.easyview = this.setEasyView;
            if (this.easyview && this.ui.dictionary.kpis.easyview[key]) {
                return this.ui.dictionary.kpis.easyview[key];
            } else if (this.ui.dictionary.systemKpis[key]) {
                return this.ui.dictionary.systemKpis[key];
            } else if (this.ui.dictionary.kpis[key]) {
                return this.ui.dictionary.kpis[key];
            }

            return key;
        },


        translateDefinition : function(key) {
            if (this.easyview && this.ui.dictionary.kpis.def.easyview[key]) {
                return this.ui.dictionary.kpis.def.easyview[key];
            } else if (this.ui.dictionary.kpis.def[key]) {
                return this.ui.dictionary.kpis.def[key];
            }

            return key;
        },


        formatNumber : function(value, type) {
            if (type == '%' && this.dashId == '_general') {
                value = value * 100;
            }

            if (type == '$') {
                type = ErpModel.getErp().currency;
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

            return String(value).replace('.', this.ui.dictionary.meta.decimalSymbol) + ' ' + type;
        },


        getKpiObjectGeneral : function(name, raw) {
            var found = false;
            var counter = 0;
            var kpi = null;

            while (!found && counter < this.kpis.length) {
                if (this.kpis[counter].kpi.name == name) {
                    found = true;
                    kpi = this.kpis[counter];
                }

                counter++;
            }

            if (raw) {
                return kpi;
            }

            return this.getKpiObject(kpi.kpi);
        },


        getKpiObject : function(kpi) {
            if (!this.rawdata[this.currentType] || !this.rawdata[this.currentType].self || !this.rawdata[this.currentType].self.aggregation || this.rawdata[this.currentType].self.aggregation[kpi.name] === undefined) {
                return false;
            }

            var rawValue = this.getKpiValueBreakdown(kpi);
            var image = kpi.symbol || 'profit.png';
            var inverse = kpi.expectPositive !== undefined ? !kpi.expectPositive : false;
            var overhead = kpi.overheadType !== undefined ? kpi.overheadType : false; //Special type of flag for overhead margin pie chart displays
            var average = 0;
            var previous = 0;

            if (this.rawdata[this.currentType] && this.rawdata[this.currentType].benchmark && this.rawdata[this.currentType].benchmark.aggregation && this.rawdata[this.currentType].benchmark.aggregation[kpi.name]) {
                average = this.rawdata[this.currentType].benchmark.aggregation[kpi.name];
            } else if (this.rawdata?.current?.benchmark?.aggregation[kpi.name]) {
                average = this.rawdata.current.benchmark.aggregation[kpi.name];
            }

            if (this.rawdata[this.previousType] && this.rawdata[this.previousType].self && this.rawdata[this.previousType].self.aggregation && this.rawdata[this.previousType].self.aggregation[kpi.name]) {
                previous =  this.rawdata[this.previousType].self.aggregation[kpi.name];
            }

            return this.calcValues(kpi.name, rawValue, average, previous, inverse, image, overhead, kpi.unit);
        },


        createKpiObjectMock : function(name) {
            return this.getKpiValueBreakdown({ name : name });
        },

        getKpiValueBreakdown : function(kpi) {
            var formulas = this.kpiFormulas();

            if (!formulas[kpi.name]) {
                return this.rawdata[this.currentType].self.aggregation[kpi.name];
            }

            return formulas[kpi.name]();
        },


        calcValues : function(name, rawKpi, rawAverage, rawPrevious, inverse, image, overhead, unit) {
            var kpi = Math.round(rawKpi * 100);
            var average = Math.round(rawAverage * 100);
            var previous = Math.round(rawPrevious * 100);

            var dataObj = {
                rawValue : kpi || 0,
                rawKpi : (rawKpi * 100) || 0,
                rawAverage : (rawAverage * 100) || 0,
                rawPrevious : (rawPrevious * 100) || 0,
                benchmark : null,
                image : image,
                unit : unit,
                data: {
                    value : 0,
                    delta : 100,
                    negative : false,
                    forceRed : false
                },
                average : {
                    value : 0,
                    delta : 100,
                    negative : false,
                    forceRed : false
                },
                previous : {
                    value : 0,
                    delta : 100,
                    negative : false,
                    forceRed : false
                }
            };

            var benchmark = null;
            var avgIsBenchmark = false;
            var prevIsBenchmark = false;


            //Calculate average
            if (average !== 0) {
                benchmark = average;
                avgIsBenchmark = true;
                dataObj.average.value = 50;
                dataObj.average.delta = 50;

                if (average < 0) {
                    dataObj.average.negative = true;
                }


                //if (inverse && !overhead) {
                if (dataObj.average.negative && !overhead) {
                    dataObj.average.forceRed = !dataObj.average.forceRed;
                }


                //Colors
                this.colors.average[name] = '#333333';
                /**
                if (dataObj.average.negative) {
                    this.negatives.average[name] = true;
                }
                */

            }


            //Calculate last period
            if (previous !== 0) {
                if (benchmark === null) {
                    benchmark = previous;
                    prevIsBenchmark = true;
                    dataObj.previous.value = 50;
                    dataObj.previous.delta = 50;
                } else {
                    var p = Math.abs(previous / benchmark);
                    var v = 50 * p;
                    var d = 100 - v;

                    if (v > 100) {

                        dataObj.previous.value = 100;
                        dataObj.previous.delta = 0;

                    } else {

                        dataObj.previous.value = v;
                        dataObj.previous.delta = d;

                    }


                    if (previous < benchmark) {
                        dataObj.previous.forceRed = true;
                    }
                }

                if (previous < 0) {
                    dataObj.previous.negative = true;
                }

                if (inverse && !overhead && !prevIsBenchmark) {
                    dataObj.previous.forceRed = !dataObj.previous.forceRed;
                } else if (overhead && !prevIsBenchmark) {
                    dataObj.previous.forceRed = !dataObj.previous.forceRed;
                }


                //Colors
                this.colors.previous[name] = '#2fabff';
                /**
                if ((dataObj.previous.negative || dataObj.previous.forceRed) && !prevIsBenchmark) {
                    this.negatives.previous[name] = true;
                }
                */
            }


            //Calculate kpi value
            if (kpi !== 0) {
                if (benchmark === null) {
                    dataObj.data.value = 50;
                    dataObj.data.delta = 50;
                } else {

                    var p = Math.abs(kpi / benchmark);
                    var v = 50 * p;
                    var d = 100 - v;

                    if (v > 100) {

                        dataObj.data.value = 100;
                        dataObj.data.delta = 0;

                    } else {

                        dataObj.data.value = v;
                        dataObj.data.delta = d;

                    }


                    if (kpi < benchmark) {
                        dataObj.data.forceRed = true;
                    }
                }

                if (kpi < 0) {
                    dataObj.data.negative = true;
                }

                if (inverse && !overhead && benchmark !== null) {
                    dataObj.data.forceRed = !dataObj.data.forceRed;
                } else if (overhead && kpi != benchmark && benchmark !== null) {
                    dataObj.data.forceRed = !dataObj.data.forceRed;
                }


                //Colors
                this.colors.current[name] = '#ffa630';
                if (dataObj.data.negative || dataObj.data.forceRed) {
                    this.negatives.current[name] = true;
                } else {
                    this.negatives.current[name] = false;
                }
            }

            if (this.readyCallback) {
                this.readyCallback();
            }

            dataObj.benchmark = benchmark;

            return dataObj;
        },


        toggleBreakdown : function(name) {
            this.ui.breakdowns[name] = !this.ui.breakdowns[name];

            if (this.ui.breakdowns[name]) {
                var el = document.getElementById('scroll-marker');
                $('body,html').animate({scrollTop: el.offsetTop - 100}, 1500);
            }
        },

        addNewKpi : function() {
            this.$router.push('/account/dashboards?open='+this.dashId);
        },
    };

    const computed = {
        setEasyView() {
            return this.$store.getters.easyview;
        },
        isLastPeriod() {
            return this.$store.getters.previousType === 'period';
        },
        isPrevious() {
            return !this.budget && this.isLastPeriod;
        },
        isLastYear() {
            return !this.budget && !this.isLastPeriod;
        },
        getTitle() {
            if (this.isPrevious) {
                return this.ui.dictionary.kpis.previous;
            } else if (this.isLastYear) {
                return this.ui.dictionary.kpis.lastYear;
            } else {
                return this.ui.dictionary.kpis.budget;
            }
        }
    };


    export default Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        computed,
        props : ['rawdata', 'kpis', 'easyview', 'dashId', 'cashbook', 'readyCallback', 'budget', 'presentation'],
        components : {
            'pie-chart' : pieChart,
            'bar-chart' : barChart,
            'math-formula' : mathFormula,
            'kpi-card' : kpiCard,
            'drilldown-card' : drilldownCard
        },
        mounted : function() {
            this.init();
        },
        watch : {
            cashbook : function (cb) {
                this.setDataType();
            },
            budget : function (b) {
                this.setDataType();
            },
            rawdata : function(d) {
                this.colors = {
                    current : {},
                    previous : {},
                    average : {}
                };
                this.setCalcKpis();
                window.removeEventListener('scroll', this.watchScroll);
                window.addEventListener('scroll', this.watchScroll);
            }
        },
        beforeDestroy : function() {
            window.removeEventListener('scroll', this.watchScroll);
        }
    });
