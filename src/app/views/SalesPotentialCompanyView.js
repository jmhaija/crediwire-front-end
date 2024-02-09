define([

    'Vue',
    'moment',
    'Highcharts',
    'collections/SalesPotentialDataCollection',
    'models/DictionaryModel',
    'services/NumberFormatter',
    'elements/date-picker',
    'models/AssetModel',
    'elements/line-chart',
    'models/ErpModel',
    'models/DateRangeModel',
    'services/HexUtils',
    'models/CompanyModel'

],function(Vue, moment, Highcharts, SalesPotentialDataCollection, DictionaryModel, NumberFormatter, datePicker, AssetModel, lineChart, ErpModel, DateRangeModel, HexUtils, CompanyModel) {
    /**
     * View template
     */
    var template = [
    '<article ref="dynamictable">',
    '   <section v-show="ui.loading">',
    '       <div class="working"></div>',
    '   </section>',

    '   <section v-show="!ui.loading">',

    '       <div v-if="isFeedbackSplash()" class="splash">',
    '           <h1>{{ui.dictionary.overview.splash.noErpTitle}}</h1>',
    '           <p>{{ui.dictionary.overview.splash.failureErp}}</p>',
    '           <button class="primary" v-on:click="gotoCompanySettings()">{{ui.dictionary.overview.splash.connectErp}}</button>',
    '       </div>',

    '       <div class="graph-bar" v-if="ui.showDateRangeSelection && !isFeedbackSplash()">',
    '               <div class="right">',
    '                   <div class="pointer faded inline" v-on:click="changeSection(\'timeline\')" v-show="ui.section == \'table\'"><span class="primary-color">{{ui.dictionary.salesPotential.tableView}}</span> <img :src="getImage(\'/assets/img/elements/switch-left.png\')" class="switch"> {{ui.dictionary.salesPotential.timelineView}}</div>',
    '                   <div class="pointer faded inline" v-on:click="changeSection(\'table\')" v-show="ui.section == \'timeline\'">{{ui.dictionary.salesPotential.tableView}} <img :src="getImage(\'/assets/img/elements/switch-right.png\')" class="switch"> <span class="primary-color">{{ui.dictionary.salesPotential.timelineView}}</span></div>',
    '               </div>',
    '           <date-picker :onDateChange="getData"></date-picker>',
    '       </div>',



    /**
     * Mini graphs section
     */
    '           <section class="kpi-container" v-show="ui.section == \'table\' && !isFeedbackSplash()">',
    '               <div class="kpi-grid">',
    '                   <div class="kpi-card">',
    '                       <div class="icons">',
    '                           <i class="cwi-info" v-on:click="toggleTooltip(\'exposure\')"></i>',
    '                       </div>',
    '                       <div class="heading">{{ui.dictionary.salesPotential.exposureCompostion}} <div class="tooltip" :class="{ open : tooltips.exposure }">{{ui.dictionary.salesPotential.exposureCompostionDefinition}}</div></div>',
    '                       <div class="subheading">{{ui.dictionary.salesPotential.exposureCompostionTitle}}</div>',
    '                       <div class="pie-chart-area">',
    '                           <div id="exposure-chart"></div>',
    '                           <span class="sp-no-data" v-show="chartOptions.exposure.series[0].data.length == 0">{{ui.dictionary.salesPotential.noData}}</span>',
    '                       </div>',
    '                   </div>',
    '               </div',
    '               ><div class="kpi-grid">',
    '                   <div class="kpi-card">',
    '                       <div class="icons">',
    '                           <i class="cwi-info" v-on:click="toggleTooltip(\'walletComposition\')"></i>',
    '                       </div>',
    '                       <div class="heading">{{ui.dictionary.salesPotential.walletComposition}} <div class="tooltip" :class="{ open : tooltips.walletComposition }">{{ui.dictionary.salesPotential.walletCompositionDefinition}}</div></div>',
    '                       <div class="subheading">{{ui.dictionary.salesPotential.walletCompositionTitle}}</div>',
    '                       <div class="pie-chart-area">',
    '                           <div id="wallet-composition-chart"></div>',
    '                           <span class="sp-no-data" v-show="chartOptions.walletComposition.series[0].data.length == 0">{{ui.dictionary.salesPotential.noData}}</span>',
    '                       </div>',
    '                   </div>',
    '               </div',
    '               ><div class="kpi-grid">',
    '                   <div class="kpi-card" style="height: 408px;">',
    '                       <div class="icons">',
    '                           <i class="cwi-info" v-on:click="toggleTooltip(\'walletDistribution\')"></i>',
    '                       </div>',
    '                       <div class="heading">{{ui.dictionary.salesPotential.walletDistribution}} <div class="tooltip" :class="{ open : tooltips.walletDistribution }">{{ui.dictionary.salesPotential.walletDistributionDefinition}}</div></div>',
    '                       <div class="subheading">{{ui.dictionary.salesPotential.walletDistributionTitle}}</div>',
    '                       <div class="pie-chart-area">',
    '                           <div id="wallet-distribution-chart"></div>',
    '                           <span class="sp-no-data" v-show="chartOptions.walletDistribution.series[0].data.length == 0">{{ui.dictionary.salesPotential.noData}}</span>',
    '                       </div>',
    '                   </div>',
    '               </div',
    '               ><div class="kpi-grid">',
    '                   <div class="kpi-card">',
    '                       <div class="icons">',
    '                           <i class="cwi-info" v-on:click="toggleTooltip(\'productPenetration\')"></i>',
    '                       </div>',
    '                       <div class="heading">{{ui.dictionary.salesPotential.productPenetration}} <div class="tooltip" :class="{ open : tooltips.productPenetration }">{{ui.dictionary.salesPotential.productPenetrationDefinition}}</div></div>',
    '                       <div class="subheading">{{ui.dictionary.salesPotential.productPenetrationTitle}}</div>',
    '                       <div class="pie-chart-area">',
    '                           <div id="product-penetration-chart"></div>',
    '                           <span class="sp-no-data" v-show="chartOptions.productPenetration.series[0].data.length == 0">{{ui.dictionary.salesPotential.noData}}</span>',
    '                       </div>',
    '                   </div>',
    '               </div>',
    '           </section>',




    '       <div class="dynamic-table sales-potential-table" v-show="ui.section == \'table\' && !isFeedbackSplash()">',

    '           <div class="container with-margin">',

                    /**
                     * Table Header
                     */
    '               <div class="row head tabular-heading" :style="{ width : tableProps.tableWidth - 17 + \'px\' }">',
                        /**
                         * Firs col
                         */
    '                   <div class="first-col tabular-heading" :class="{ \'scrolled-right\': scrolledRight }" :style="{ width : tableProps.firstCellWidth + \'px\' }">',
    '                       <div class="cell" :style="{ width : tableProps.firstCellWidth + \'px\' }">',
    '                           <span class="cell-value">{{ui.dictionary.salesPotential.item}}</span>',
    '                      </div>',
    '                   </div',

                        /**
                         * Other cols
                         */

    '                   ><div class="main-cols">',
    '                       <div class="cell"',
    '                            :style="{ width : tableProps.cellWidth + \'px\' }"',
    '                            style="text-align: left;">',
    '                              <span class="timeline-checkmark">{{ui.dictionary.salesPotential.includeInTimeline}}</span>',
    '                       </div',
    '                       ><div class="cell"',
    '                            :style="{ width : tableProps.cellWidth + \'px\' }">',
    '                           <span class="cell-value">',
    '                              <span>{{ui.dictionary.salesPotential.total}}</span>',
    '                           </span>',
    '                       </div',
    '                       ><div class="cell"',
    '                            v-for="(period, i) in sortCols(dates)"',
    '                            :style="{ width : tableProps.cellWidth + \'px\' }">',
    '                           <span class="cell-value">',
    '                              <span>{{formatPeriod(period)}}</span>',
    '                           </span>',
    '                       </div>',
    '                   </div>',
    '               </div>',



                    /**
                     * Table body
                     */
    '               <div class="body">',
                        /**
                         * First col
                         */
    '                   <div class="first-col" :class="{ \'scrolled-right\': scrolledRight }" :style="{ width : tableProps.firstCellWidth + \'px\' }">',


    '                       <div class="first-col-container">',

    /**
     * Group
     */
    '                           <div v-for="(group, index) in getKeys(groups)">',
    '                               <div class="row separator tabular-row">',
    '                                   <div class="cell" :style="{ width : tableProps.firstCellWidth + \'px\'}">',
    '                                       <span class="cell-value" :title="group">',
    '                                           <span>{{group}}</span>',
    '                                       </span>',
    '                                   </div>',
    '                               </div>',




    /** Bal Heading **/
    '                              <div class="row separator smaller tabular-row" v-show="groups[group] && groups[group].bal && hasKeys(groups[group].bal)">',
    '                                <div class="cell" :style="{ width : tableProps.firstCellWidth + \'px\'}">',
    '                                  <span class="cell-value primary-color">',
    '                                    <span class="toggle-span" v-show="groups[group] && groups[group].state && groups[group].state.bal" v-on:click="groups[group].state.bal = false">&ndash; <span>{{ui.dictionary.salesPotential.exposureTotal}}</span></span>',
    '                                    <span class="toggle-span" v-show="groups[group] && groups[group].state && !groups[group].state.bal" v-on:click="groups[group].state.bal = true">+ <span>{{ui.dictionary.salesPotential.exposureTotal}}</span></span>',
    '                                  </span>',
    '                                </div>',
    '                              </div>',


    /** Bal Account Names **/
    '                               <div class="row" :class="{ \'tabular-altrow\' : index % 2 == 0, \'tabular-row\' : index % 2 != 0, highlightedRow : compareKeyword && compareKeyword == account}"',
    '                                    v-if="groups[group] && groups[group].bal && hasKeys(groups[group].bal)"',
    '                                    v-show="groups[group] && groups[group].state && groups[group].state.bal"',
    '                                    v-for="(account, index) in getKeys(groups[group].bal)">',
    '                                   <div class="cell" :style="{ width : tableProps.firstCellWidth + \'px\'}">',
    '                                       <span class="cell-value" :title="account">',

    '                                           <span class="toggle-pad">{{account}}</span>',

    '                                       </span>',
    '                                   </div>',
    '                               </div>',



    /** Pal Heading **/
    '                              <div class="row separator smaller tabular-row" v-show="groups[group] && groups[group].pal && hasKeys(groups[group].pal)">',
    '                                <div class="cell" :style="{ width : tableProps.firstCellWidth + \'px\'}">',
    '                                  <span class="cell-value primary-color">',
    '                                    <span class="toggle-span" v-show="groups[group] && groups[group].state && groups[group].state.pal" v-on:click="groups[group].state.pal = false">&ndash; <span>{{ui.dictionary.salesPotential.walletTotal}}</span></span>',
    '                                    <span class="toggle-span" v-show="groups[group] && groups[group].state && !groups[group].state.pal" v-on:click="groups[group].state.pal = true">+ <span>{{ui.dictionary.salesPotential.walletTotal}}</span></span>',
    '                                  </span>',
    '                                </div>',
    '                              </div>',


    /** Pal Account Names **/
    '                               <div class="row" :class="{ \'tabular-altrow\' : index % 2 == 0, \'tabular-row\' : index % 2 != 0, highlightedRow : compareKeyword && compareKeyword == account }"',
    '                                    v-if="groups[group] && groups[group].pal && hasKeys(groups[group].pal)"',
    '                                    v-show="groups[group] && groups[group].state && groups[group].state.pal"',
    '                                    v-for="(account, index) in getKeys(groups[group].pal)">',

    '                                   <div class="cell" :style="{ width : tableProps.firstCellWidth + \'px\'}">',
    '                                       <span class="cell-value" :title="account">',

    '                                           <span class="toggle-pad">{{account}}</span>',
    '                                       </span>',

    '                                   </div>',

    '                               </div>',




    '                          </div>',


    '                       </div>',

    '                   </div',

                        /**
                         * Other cols
                         */
    '                   ><div class="main-cols" v-on:scroll="handleScroll"',
    '                                       v-on:wheel="handleWheelScroll"',
    '                                       :style="{ width : tableProps.tableWidth + \'px\', marginLeft : (0 - tableProps.firstCellWidth)  + \'px\', paddingLeft : tableProps.firstCellWidth  + \'px\' }">',


    '                       <div class="main-cols-container">',
    '                           <div v-for="(group, index) in getKeys(groups)">',


    /** Group row filler **/
    '                               <div class="row separator tabular-row">',
    '                                   <div class="cell"',
    '                                       :style="{ width : tableProps.cellWidth + \'px\' }">',

    '                                       <span class="cell-value">',
    '                                           <span>&nbsp;</span>',
    '                                       </span>',
    '                                   </div>',
    '                                   <div class="cell"',
    '                                       v-for="date in dates"',
    '                                       :style="{ width : tableProps.cellWidth + \'px\' }">',

    '                                       <span class="cell-value">',
    '                                           <span>&nbsp;</span>',
    '                                       </span>',
    '                                   </div>',
    '                               </div>',





    /** Bal Heading Filler **/
    '                               <div class="row separator smaller tabular-row" v-show="groups[group] && groups[group].bal && hasKeys(groups[group].bal)">',
    '                                   <div class="cell"',
    '                                       :style="{ width : tableProps.cellWidth + \'px\' }">',

    '                                       <span class="cell-value">',
    '                                           <span>&nbsp;</span>',
    '                                       </span>',
    '                                   </div>',


    '                                   <div class="cell"',
    '                                       :style="{ width : tableProps.cellWidth + \'px\' }">',

    '                                       <span class="cell-value primary-color">',
    '                                           <span v-if="groups[group] && groups[group].bal && hasKeys(groups[group].bal)">{{formatNumber(entryTotal(groups[group].bal, true))}}</span>',
    '                                       </span>',
    '                                   </div>',


    '                                   <div class="cell"',
    '                                       v-for="(date, dateIndex) in dates"',
    '                                       :style="{ width : tableProps.cellWidth + \'px\' }">',

    '                                       <span class="cell-value primary-color">',
    '                                           <span style="padding-right: 0.25rem;" v-if="groups[group] && groups[group].bal && hasKeys(groups[group].bal)">{{formatNumber(columnTotal(groups[group].bal, dateIndex))}}</span>',
    '                                       </span>',
    '                                   </div>',
    '                               </div>',


    /** Bal **/
    '                               <div class="row"',
    '                                   v-if="groups[group] && groups[group].bal && hasKeys(groups[group].bal)"',
    '                                   v-show="groups[group] && groups[group].state && groups[group].state.bal"',
    '                                   v-for="(account, index) in getKeys(groups[group].bal)" :id="account">',


    '                                   <div class="cell" :class="{ \'tabular-altrow\' : index % 2 == 0, \'tabular-row\' : index % 2 != 0, highlightedRow : compareKeyword && compareKeyword == account }"',
    '                                       :style="{ width : tableProps.cellWidth + \'px\' }">',
    '                                       <span class="cell-value">',
    '                                           <span class="timeline-checkmark">',
    '                                               <div class="checkbox-field">',
    '                                                   <label><input type="checkbox" v-model="groups[group].bal[account].timeline"><i></i></label>',
    '                                               </div>',
    '                                           </span>',
    '                                       </span>',
    '                                   </div',


    '                                   ><div class="cell" :class="{ \'tabular-altrow\' : index % 2 == 0, \'tabular-row\' : index % 2 != 0, highlightedRow : compareKeyword && compareKeyword == account }"',
    '                                       :style="{ width : tableProps.cellWidth + \'px\' }">',
    '                                       <span class="cell-value">',
    '                                           <span>{{formatNumber(getAverage(groups[group].bal[account]))}}</span>',
    '                                       </span>',
    '                                   </div',


    '                                   ><div class="cell" :class="{ \'tabular-altrow\' : index % 2 == 0, \'tabular-row\' : index % 2 != 0, highlightedRow : compareKeyword && compareKeyword == account }"',
    '                                       v-for="(entry, key) in sortEntries(groups[group].bal[account].entries)"',
    '                                       :style="{ width : tableProps.cellWidth + \'px\' }">',

    '                                       <span class="cell-value">',
    '                                           <span>{{formatNumber(entry.amount)}}</span>',
    '                                       </span>',
    '                                   </div>',
    '                               </div>',



    /** Pal Heading Filler **/
    '                               <div class="row separator smaller tabular-row" v-show="groups[group] && groups[group].pal && hasKeys(groups[group].pal)">',
    '                                   <div class="cell"',
    '                                       :style="{ width : tableProps.cellWidth + \'px\' }">',

    '                                       <span class="cell-value">',
    '                                           <span>&nbsp;</span>',
    '                                       </span>',
    '                                   </div>',

    '                                   <div class="cell"',
    '                                       :style="{ width : tableProps.cellWidth + \'px\' }">',

    '                                       <span class="cell-value primary-color">',
    '                                           <span v-if="groups[group] && groups[group].pal && hasKeys(groups[group].pal)">{{formatNumber(entryTotal(groups[group].pal))}}</span>',
    '                                       </span>',
    '                                   </div>',

    '                                   <div class="cell"',
    '                                       v-for="(date, dateIndex) in dates"',
    '                                       :style="{ width : tableProps.cellWidth + \'px\' }">',

    '                                       <span class="cell-value primary-color">',
    '                                           <span style="padding-right: 0.25rem;" v-if="groups[group] && groups[group].pal && hasKeys(groups[group].pal)">{{formatNumber(columnTotal(groups[group].pal, dateIndex))}}</span>',
    '                                       </span>',
    '                                   </div>',
    '                               </div>',


    /** Pal **/
    '                               <div class="row"',
    '                                   v-if="groups[group] && groups[group].pal && hasKeys(groups[group].pal)"',
    '                                   v-show="groups[group] && groups[group].state && groups[group].state.pal"',
    '                                   v-for="(account, index) in getKeys(groups[group].pal)" :id="account">',


    '                                   <div class="cell" :class="{ \'tabular-altrow\' : index % 2 == 0, \'tabular-row\' : index % 2 != 0, highlightedRow : compareKeyword && compareKeyword == account }"',
    '                                       :style="{ width : tableProps.cellWidth + \'px\' }">',
    '                                       <span class="cell-value">',
    '                                           <span class="timeline-checkmark">',
    '                                               <div class="checkbox-field">',
    '                                                   <label><input type="checkbox" v-model="groups[group].pal[account].timeline"><i></i></label>',
    '                                               </div>',
    '                                           </span>',
    '                                       </span>',
    '                                   </div',


    '                                   ><div class="cell" :class="{ \'tabular-altrow\' : index % 2 == 0, \'tabular-row\' : index % 2 != 0, highlightedRow : compareKeyword && compareKeyword == account }"',
    '                                       :style="{ width : tableProps.cellWidth + \'px\' }">',
    '                                       <span class="cell-value">',
    '                                           <span>{{formatNumber(groups[group].pal[account].total)}}</span>',
    '                                       </span>',
    '                                   </div',


    '                                   ><div class="cell" :class="{ \'tabular-altrow\' : index % 2 == 0, \'tabular-row\' : index % 2 != 0, highlightedRow : compareKeyword && compareKeyword == account }"',
    '                                       v-for="(entry, key) in sortEntries(groups[group].pal[account].entries)"',
    '                                       :style="{ width : tableProps.cellWidth + \'px\' }">',

    '                                       <span class="cell-value">',
    '                                           <span>{{formatNumber(entry.amount)}}</span>',
    '                                       </span>',
    '                                   </div>',
    '                               </div>',



    '                           </div>',
    '                       </div>',

    '                   </div>', //Other cols

    '               </div>', //Table body



    '           </div>', //Container

    '       </div>', //Dynamic table


    '       <div v-show="ui.section == \'timeline\' && !ui.noTimeData">',
    '           <line-chart :percentMultiply="false" :chart="chart" :init="!ui.loading" :reinit="ui.section == \'timeline\'" :interval="ui.interval" :cashbook="false" :types="[\'DKK\']" type="DKK" :average="false" :previous="false" :budget="false" :floatingAverage="false"></line-chart>',
    '       </div>',

    '       <div class="splash" v-show="ui.section == \'timeline\' && ui.noTimeData">',
    '            <h1>{{ui.dictionary.salesPotential.selectAccountsTitle}}</h1>',
    '            <p>{{ui.dictionary.salesPotential.selectAccountsDescription}}</p>',
    '       </div>',

    '   </section>',

    '</article>'
    ].join('');

    const getEmptyGroups = (labels) => {
        let result = {};
        for (const label in labels) {
          result[labels[label]] = {}
        }

        return result;
    };

    /**
     * Bindings
     */
    const bindings = function () {
        const dictionary = DictionaryModel.getHash();
        return {
            ui : {
                loading : true,
                dictionary : dictionary,
                section : 'table',
                noTimeData : false,
                showDateRangeSelection : false
            },
            SPOneLabels: {
                Lending : 'Lending',
                "Cash management" : 'Cash management',
                Leasing : 'Leasing',
                Insurance : 'Insurance',
                Pension : 'Pension',
            },
            SPTwoLabels: {
                credit : dictionary.salesPotential.credit,
                cash_management: dictionary.salesPotential.cashManagement,
                pension_insurance: dictionary.salesPotential.pensionInsurance,
                leasing: dictionary.salesPotential.leasing,
                foreign_exchange: dictionary.salesPotential.foreignExchange,
                financial_instruments: dictionary.salesPotential.financialInstruments,
                other : dictionary.salesPotential.other,
            },
            entries : [],
            groups : {},
            dates : [],
            tableProps : {
                longestAccountName : 0,
                additionalPadding : 50,
                tableWidth : 0,
                maxCellWidth : 0,
                firstCellWidth : 600,
                cellWidth : 200,
                remainingCellWidth : 0
            },
            scrolledDown : false,
            scrolledRight : false,
            chart : {
                month : {
                    DKK : {
                        current : {
                            categories : [],
                            series : []
                        }
                    }
                }
            },
            chartOptions : {
                exposure : {
                    chart : {
                        type : 'columnrange',
                        inverted : true,
                        spacing: [0, 0, 0, 0],
                        height: 280
                    },
                    title : null,
                    xAxis : {
                        type : 'category',
                        categories : [],
                        title : {
                            text : null
                        },
                        reversed: true
                    },
                    yAxis : {
                        title : {
                            text : null
                        },
                        labels : {
                            style : {
                                color : '#aaaaaa'
                            }
                        },
                        gridLineDashStyle : 'Dash',
                        gridLineColor: '#dddddd',
                        floor : 0
                    },
                    credits : {
                        enabled : false
                    },
                    legend : {
                        enabled : false
                    },
                    series : [
                        {
                            data : [],
                            tooltip : {
                                pointFormat : '{point.high}'
                            },
                            maxPointWidth: 15,
                            minPointLength : 3,
                            borderRadius : 0,
                            dashStyle : 'Dot',
                            lineWidth: 0,
                            pointPadding : 0,
                            clip: false
                        }
                    ],
                    tooltip: {
                        formatter: function () {
                            return NumberFormatter.abbreviate(Math.abs(this.point.high - this.point.low), false);
                        }
                    }
                },
                walletComposition : {
                    chart : {
                        type : 'columnrange',
                        inverted : true,
                        spacing: [0, 0, 0, 0],
                        height: 280
                    },
                    title : null,
                    xAxis : {
                        type : 'category',
                        categories : [],
                        title : {
                            text : null
                        },
                        reversed: true
                    },
                    yAxis : {
                        title : {
                            text : null
                        },
                        labels : {
                            style : {
                                color : '#aaaaaa'
                            }
                        },
                        gridLineDashStyle : 'Dash',
                        gridLineColor: '#dddddd',
                        floor : 0
                    },
                    legend : {
                        enabled : false
                    },
                    credits : {
                        enabled : false
                    },
                    series : [{
                        data : [],
                        maxPointWidth: 15,
                        minPointLength : 3,
                        borderRadius : 0,
                        dashStyle : 'Dot',
                        lineWidth: 0,
                        pointPadding : 0,
                        clip: false
                    }],
                    tooltip: {
                        formatter: function () {
                            return NumberFormatter.abbreviate(Math.abs(this.point.high - this.point.low), false);
                        }
                    }
                },
                walletDistribution : {
                    chart : {
                        spacing: [0, 0, 0, 0],
                        height: 280
                    },
                    credits : {
                        enabled : false
                    },
                    legend : {
                        enabled : true
                    },
                    plotOptions : {
                        pie: {
                            allowPointSelect: false,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                                distance: -15,
                                format: '{y}%'
                            },
                            showInLegend: true
                        }
                    },
                    series : [
                        {
                            type : 'pie',
                            data : [],
                            innerSize : '70%',
                            tooltip : {
                                pointFormat : '{point.y}%'
                            }
                        }
                    ],
                    title : null
                },
                productPenetration : {
                    chart : {
                        spacing: [0, 0, 0, 0],
                        height: 280
                    },
                    credits : {
                        enabled : false
                    },
                    legend : {
                        enabled : false
                    },
                    plotOptions : {
                        bar : {
                            dataLabels : {
                                enabled : false
                            }
                        },
                        series : {
                            animation : true,
                            states : {
                                hover : {
                                    enabled : true
                                }
                            }
                        }
                    },
                    series : [
                        {
                            type : 'bar',
                            name : DictionaryModel.getHash().invoices.title,
                            data : [],
                            tooltip : {
                                pointFormat : '{point.y}'
                            },
                            maxPointWidth: 15,
                            minPointLength : 3,
                            borderRadius : 0,
                            threshold : 0
                        }
                    ],
                    title : null,
                        tooltip : {
                            enabled : true
                        },
                    xAxis : {
                        categories : [],
                        tickLength : 0,
                        title : {
                            text : null
                        },
                        labels : {
                            enabled : true
                        },
                        lineWidth: 0
                    },
                    yAxis : {
                        endOnTick : false,
                        allowDecimals : false,
                        title : {
                            text : null
                        },
                        labels : {
                            style : {
                                color : '#aaaaaa'
                            }
                        },
                        gridLineDashStyle : 'Dash',
                        gridLineColor: '#dddddd'
                    },
                    tooltip: {
                        formatter: function () {
                            return this.point.y;
                        }
                    }
                }
            },
            chartObjects : {
                exposure : null,
                walletComposition : null,
                walletDistribution : null,
                productPenetration : null
            },
            miniChartData : {},
            categoryFilter : ['Lending', 'Cash management', 'Leasing', 'Insurance', 'Pension'],
            tooltips : {
                exposure : false,
                walletComposition : false,
                walletDistribution : false,
                productPenetration : false
            },
            erp : ErpModel.getErp(),
            oldDates : {
                from : null,
                to : null
            },
            company : CompanyModel.getCompany(),
            compareKeyword : null
        };
    };
    /**
     * Methods
     */
    const methods = {
        init : function() {
            this.getData();
        },

        getGroups(entries, version) {
            const groupLabels = version === '1' ? this.SPOneLabels : this.SPTwoLabels;

            const groups = getEmptyGroups(groupLabels);

            entries.forEach(entry => {
                const { group_name: groupId } = entry;

                const groupName = groupLabels[groupId] || 'Other';

                if (groupName === 'Other') {
                    entry.group_name = 'Other'
                }

                if (!groups[groupName] || !groups[groupName].pal) {
                    groups[groupName] = {
                        pal : {},
                        bal : {},
                        state : {
                            pal : false,
                            bal : false
                        }
                    };
                }
            });

            return groups;
        },

        populateGroupsEntries(entries, groups, dates, version) {
            entries.forEach(entry => {
                const { group_name: groupId, key_word, amount, date } = entry;
                const groupLabels = version === '1' ? this.SPOneLabels : this.SPTwoLabels;

                const groupName = groupLabels[groupId] || 'Other';

                const type = entry.pal ? 'pal' : 'bal';

                if (!groups[groupName][type][key_word]) {
                    groups[groupName][type][key_word] = { total : 0, numberOfEntries : 0, average : 0, entries : [], values : [], combinedEntries : {},   };
                }

                entry.amount = Math.abs(amount);

                groups[groupName][type][key_word].total += entry.amount;
                groups[groupName][type][key_word].numberOfEntries++;
                groups[groupName][type][key_word].entries.push(entry);
                groups[groupName][type][key_word].values.push(entry.amount);

                if (dates.indexOf(date) < 0) {
                    dates.push(date);
                }
            });

            return groups;
        },

        entryTotal : function (accounts, useAverage) {
            var total = 0;

            for (var account in accounts) {
                if (useAverage) {
                    total += (accounts[account].total / accounts[account].numberOfEntries);
                } else {
                    total += accounts[account].total;
                }
            }

            return total;
        },

        columnTotal : function (accounts, index) {
            var total = 0;

            for (var account in accounts) {
                total += accounts[account].entries[index].amount;
            }

            return total;
        },

        getAverage : function (entry) {
            if (entry && entry.numberOfEntries && entry.numberOfEntries !== 0) {
                return entry.total / entry.numberOfEntries;
            }

            return entry.total;
        },

        toggleTooltip : function(index) {
            if (this.tooltips[index]) {
                Vue.set(this.tooltips, index, false);
            } else {
                Vue.set(this.tooltips, index, true);
            }
        },

        drawCharts : function () {
            setTimeout(function () {
                var dataObject = {};
                var accountCount = {};
                var balAccountCount = {};
                var palAccountCount = {};
                var numberOfExposureAccounts = 0;
                var accountsTotal = 0;
                var seriesDef = {};
                var currentPieColor = '#2fabff';
                var compareKeyword = this.company.salesPotentialAlias ? (this.company.salesPotentialAlias.charAt(0).toUpperCase() + this.company.salesPotentialAlias.slice(1)) : null;
                var compareExposureTotal = 0;
                var compareCompositionTotal = 0;
                var hasCompareInstance = false;

                this.compareKeyword = compareKeyword;

                for (var groupName in this.groups) {
                    dataObject[groupName] = {
                    };

                    for (var accountName in this.groups[groupName].bal) {
                        if (!dataObject[groupName].exposure) {
                            dataObject[groupName].exposure = 0;
                        }
                        if (this.groups[groupName].bal[accountName].total) {
                            dataObject[groupName].exposure += this.getAverage(this.groups[groupName].bal[accountName]);
                            numberOfExposureAccounts++;

                            if (compareKeyword && compareKeyword == accountName) {
                                compareExposureTotal += this.getAverage(this.groups[groupName].bal[accountName]);
                                hasCompareInstance = true;
                            }
                        }


                        if (accountCount[accountName] && this.categoryFilter.indexOf(groupName) >= 0) {
                            accountCount[accountName]++;
                            palAccountCount[accountName]++;
                        } else if (this.categoryFilter.indexOf(groupName) >= 0) {
                            accountCount[accountName] = 1;
                            palAccountCount[accountName] = 1;
                        }




                        if (!dataObject[groupName].walletDistribution) {
                            dataObject[groupName].walletDistribution = {};
                        }

                        if (!dataObject[groupName].walletDistribution[accountName]) {
                            dataObject[groupName].walletDistribution[accountName] = 0;
                        }

                        if (this.groups[groupName].bal[accountName].total) {
                            dataObject[groupName].walletDistribution[accountName] += this.groups[groupName].bal[accountName].total;
                            accountsTotal += this.groups[groupName].bal[accountName].total;
                        }
                    }


                    for (var accountName in this.groups[groupName].pal) {
                        if (!dataObject[groupName].walletComposition) {
                            dataObject[groupName].walletComposition = 0;
                        }
                        dataObject[groupName].walletComposition += this.groups[groupName].pal[accountName].total;

                        if (compareKeyword && compareKeyword == accountName) {
                            compareCompositionTotal += this.groups[groupName].pal[accountName].total;
                            hasCompareInstance = true;
                        }


                        if (accountCount[accountName] && !palAccountCount[accountName] && this.categoryFilter.indexOf(groupName) >= 0) {
                            accountCount[accountName]++;
                            balAccountCount[accountName]++;
                        } else if (!palAccountCount[accountName] && this.categoryFilter.indexOf(groupName) >= 0) {
                            accountCount[accountName] = 1;
                            balAccountCount[accountName] = 1;
                        }


                        if (this.categoryFilter.indexOf(groupName) >= 0) {
                            if (!dataObject[groupName].walletDistribution) {
                                dataObject[groupName].walletDistribution = {};
                            } else if (!dataObject[groupName].walletDistribution[accountName]) {
                                dataObject[groupName].walletDistribution[accountName] = 1;
                            } else {
                                dataObject[groupName].walletDistribution[accountName]++;
                            }
                        }
                    }
                }


                this.chartOptions.exposure.xAxis.categories = [];
                this.chartOptions.exposure.series[0].data = [];

                this.chartOptions.walletComposition.xAxis.categories = [];
                this.chartOptions.walletComposition.series[0].data = [];

                this.chartOptions.walletDistribution.series[0].data = [];

                this.chartOptions.productPenetration.xAxis.categories = [];
                this.chartOptions.productPenetration.series[0].data = [];



                var lastExposureValue = 0;
                var lastCompositionValue = 0;
                var exposureTotal = 0;
                var compositionTotal = 0;

                for (var groupName in dataObject) {

                    /** Exposure Composition */
                    this.chartOptions.exposure.xAxis.categories.push(groupName);
                    if (dataObject[groupName].exposure) {
                        this.chartOptions.exposure.series[0].data.push({
                            low : lastExposureValue,
                            high :  lastExposureValue + dataObject[groupName].exposure,
                            color : '#cccccc',
                            borderColor : '#cccccc'
                        });
                        lastExposureValue += dataObject[groupName].exposure;
                    } else {
                        this.chartOptions.exposure.series[0].data.push({
                            low : lastExposureValue,
                            high : lastExposureValue,
                            color : '#cccccc',
                            borderColor : '#cccccc'
                        });
                    }



                    /** Wallet Composition */
                    this.chartOptions.walletComposition.xAxis.categories.push(groupName);
                    if (dataObject[groupName].walletComposition) {
                        this.chartOptions.walletComposition.series[0].data.push({
                            low : lastCompositionValue,
                            high :  lastCompositionValue + dataObject[groupName].walletComposition,
                            color : '#cccccc',
                            borderColor : '#cccccc'
                        });
                        lastCompositionValue += dataObject[groupName].walletComposition;
                    } else {
                        this.chartOptions.walletComposition.series[0].data.push({
                            low : lastCompositionValue,
                            high : lastCompositionValue,
                            color : '#cccccc',
                            borderColor : '#cccccc'
                        });
                    }



                    /** Wallet Distribution **/
                    if (dataObject[groupName].walletDistribution) {
                        for (accountName in dataObject[groupName].walletDistribution) {
                            if (!seriesDef[accountName]) {
                                seriesDef[accountName] = {
                                    name : accountName,
                                    y : 0,
                                    color : '#2fabff'
                                };
                            }

                            seriesDef[accountName].y += dataObject[groupName].walletDistribution[accountName];
                        }
                    }

                }


                /**
                 * Product penetration
                 */
                for (accountName in accountCount) {
                    if (accountName != 'Unknown') {
                        this.chartOptions.productPenetration.xAxis.categories.push(accountName);
                        this.chartOptions.productPenetration.series[0].data.push({
                            y : accountCount[accountName],
                            color : compareKeyword && compareKeyword == accountName ? '#ffa630' : '#cccccc'
                        });
                    }
                }


                /**
                 * Wallet Distribution
                 */
                for (var def in seriesDef) {
                    var d = seriesDef[def];
                    var useColor = currentPieColor;

                    if (d.name == 'Unknown') {
                        useColor = '#cccccc';
                    } else if (compareKeyword && compareKeyword == d.name) {
                        useColor = '#ffa630';
                    }

                    this.chartOptions.walletDistribution.series[0].data.push({
                        name : d.name,
                        y : Math.round( (d.y / accountsTotal) * 100 ),
                        color : useColor
                    });

                    currentPieColor = HexUtils.adjustHue(currentPieColor, 15);
                }


                /**
                 * Totals
                 */
                this.chartOptions.exposure.xAxis.categories.push('Total');
                this.chartOptions.exposure.series[0].data.push(
                    {
                        low : 0,
                        high :  lastExposureValue,
                        color : '#2fabff',
                        borderColor : '#2fabff'
                    }
                );
                this.chartOptions.exposure.yAxis.ceiling = lastExposureValue;
                if (compareKeyword && hasCompareInstance) {
                    this.chartOptions.exposure.xAxis.categories.push(compareKeyword);
                    this.chartOptions.exposure.series[0].data.push({
                        low : 0,
                        high : compareExposureTotal,
                        color : '#ffa630',
                        borderColor : '#ffa630'
                    });
                }

                this.chartOptions.walletComposition.xAxis.categories.push('Total');
                this.chartOptions.walletComposition.series[0].data.push(
                    {
                        low : 0,
                        high :  lastCompositionValue,
                        color : '#2fabff',
                        borderColor : '#2fabff'
                    }
                );
                this.chartOptions.walletComposition.yAxis.ceiling = lastCompositionValue;
                if (compareKeyword && hasCompareInstance) {
                    this.chartOptions.walletComposition.xAxis.categories.push(compareKeyword);
                    this.chartOptions.walletComposition.series[0].data.push({
                        low : 0,
                        high : compareCompositionTotal,
                        color : '#ffa630',
                        borderColor : '#ffa630'
                    });
                }


                this.chartObjects.exposure = Highcharts.chart(this.$refs.dynamictable.querySelector('#exposure-chart'), this.chartOptions.exposure);
                this.chartObjects.walletDistribution = Highcharts.chart(this.$refs.dynamictable.querySelector('#wallet-distribution-chart'), this.chartOptions.walletDistribution);
                this.chartObjects.walletComposition = Highcharts.chart(this.$refs.dynamictable.querySelector('#wallet-composition-chart'), this.chartOptions.walletComposition);
                this.chartObjects.productPenetration = Highcharts.chart(this.$refs.dynamictable.querySelector('#product-penetration-chart'), this.chartOptions.productPenetration);
            }.bind(this), 500);

        },

        formatNumber : function(value) {
            return NumberFormatter.abbreviate(Math.abs(value), false);
        },

        changeSection : function (section) {
            if (section == 'timeline') {
                this.chart.month.DKK.current.categories = this.dates;
                this.chart.month.DKK.current.series = [];
                this.ui.noTimeData = false;

                for (var group in this.groups) {
                    for (var type in this.groups[group]) {
                        for (var category in this.groups[group][type]) {
                            if (this.groups[group][type][category].timeline) {
                                this.chart.month.DKK.current.series.push({
                                    name : category,
                                    data : this.groups[group][type][category].values
                                });
                            }
                        }
                    }
                }

                if (this.chart.month.DKK.current.series.length === 0) {
                    this.ui.noTimeData = true;
                }

                this.ui.section = section;
            } else {
                this.ui.section = section;
                this.calculateTableProperties();
            }
        },

        getImage : function(img) {
            return new AssetModel(img).path;
        },

        formatNumber : function(value) {
            return NumberFormatter.format(value);
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

        getKeys : function (obj) {
            if (obj) {
                return Object.keys(obj);
            }

            return [];
        },

        hasKeys : function (obj) {
            return Object.keys(obj).length > 0;
        },


        sortEntries : function (entries) {
            var list = entries.slice();

            return list.sort(function(a, b) {
                return a.date.toLocaleLowerCase()>b.date.toLocaleLowerCase()? 1 : (a.date.toLocaleLowerCase()<b.date.toLocaleLowerCase() ? -1 : 0);
            });
        },

        sortCols : function (cols) {
            var list = cols.slice();

            return list.sort(function(a, b) {
                return a.toLocaleLowerCase()>b.toLocaleLowerCase()? 1 : (a.toLocaleLowerCase()<b.toLocaleLowerCase() ? -1 : 0);
            });
        },

        formatPeriod : function (period) {
            return moment(period).format(this.ui.dictionary.locale.intervals.month);
        },

        calculateTableProperties : function() {
            //Reset table properties
            this.tableProps.maxCellWidth = 0;
            this.tableProps.firstCellWidth = 60;
            this.tableProps.cellWidth = 200;
            this.tableProps.remainingCellWidth = 0;

            setTimeout(function() {
                this.tableProps.tableWidth = this.$refs.dynamictable.querySelector('.container').offsetWidth;
                this.tableProps.maxCellWidth = Math.round(this.tableProps.tableWidth * 0.25);
                var firstCellWantedWidth = this.tableProps.maxCellWidth + this.tableProps.additionalPadding;

                this.tableProps.firstCellWidth = firstCellWantedWidth > this.tableProps.maxCellWidth ? this.tableProps.maxCellWidth : firstCellWantedWidth;

                this.tableProps.remainingCellWidth = this.tableProps.tableWidth - this.tableProps.firstCellWidth - 17;

                var cols = this.dates.length + 2;
                var wantedCellWidth = Math.round(this.tableProps.remainingCellWidth / cols) - 3;

                this.tableProps.cellWidth = wantedCellWidth < this.tableProps.cellWidth ? this.tableProps.cellWidth : wantedCellWidth;

                this.drawCharts();
            }.bind(this), 200);
        },

        zeroPadNumber : function (n) {
            return String("0" + n).slice(-2);
        },

        organizeByGroup : function (entries) {
            const groups = this.populateGroupsEntries(entries, this.getGroups(entries, this.version), this.dates, this.version);
            const getEmptyPalBalEntryValues = (entry, groupName, type) => {
                return {
                    Unknown : {
                        total : 0,
                        numberOfEntries : 0,
                        entries : this.fillWithZeroEntryValues(groupName, type === 'pal'),
                        values : this.fillWithZeroDateValues()
                    }
                }
            };

            for (let groupName in groups) {
                const groupEntry = groups[groupName];

                if (!groupEntry.pal || Object.keys(groupEntry.pal).length === 0) {
                    groupEntry.pal = getEmptyPalBalEntryValues(groupEntry, groupName, 'pal')
                }

                if (!groupEntry.bal || Object.keys(groupEntry.bal).length === 0) {
                    groupEntry.bal = getEmptyPalBalEntryValues(groupEntry, groupName, 'bal')
                }


                if (!groupEntry.state) {
                    groupEntry.state = {
                        pal : false,
                        bal : false
                    };
                }


                for (let account in groupEntry.pal) {
                    groupEntry.pal[account].entries = this.combineEntries(groupEntry.pal[account].entries);
                    groupEntry.pal[account].entries = this.padEntries(groupEntry.pal[account].entries, groupName, account, true);
                }

                for (let account in groups[groupName].bal) {
                    groupEntry.bal[account].entries = this.combineEntries(groupEntry.bal[account].entries);
                    groupEntry.bal[account].entries = this.padEntries(groupEntry.bal[account].entries, groupName, account, false);
                }
            }



            return groups;
        },


        padEntries : function (entries, groupName, account, isPal) {
            var list = entries.slice();

            list = list.sort(function(a, b) {
                return a.date.toLocaleLowerCase()>b.date.toLocaleLowerCase()? 1 : (a.date.toLocaleLowerCase()<b.date.toLocaleLowerCase() ? -1 : 0);
            });

            var sortedDates = this.sortCols(this.dates);

            for (var i = 0; i < sortedDates.length; i++) {
                if (!list[i] || sortedDates[i] != list[i].date) {
                    list.splice(i, 0, {
                        amount : 0,
                        created : null,
                        date : sortedDates[i],
                        group_name : groupName,
                        id : null,
                        key_word : account,
                        month : true,
                        pal : isPal,
                        year : false
                    });
                }
            }

            return list;
        },

        combineEntries : function (entries) {
            var newEntries = [];

            entries.forEach(function (entry) {
                var found = false;

                newEntries.forEach(function (newEntry) {
                    if (newEntry.keyword == entry.keyword && newEntry.date == entry.date) {
                        found = true;
                    }
                });

                if (!found) {
                    newEntries.push(entry);
                }
            });

            return newEntries;
        },


        fillWithZeroDateValues : function () {
            const arr = [];
            for (let i = 0; i < this.dates.length; i++) {
                arr.push(0);
            }
            return arr;
        },

        fillWithZeroEntryValues : function (groupName, isPal) {
            const arr = [];
            for (let i = 0; i < this.dates.length; i++) {
                arr.push({
                    amount : 0,
                    created : null,
                    date : this.dates[i],
                    group_name : groupName,
                    id : null,
                    key_word : 'Unknown',
                    month : true,
                    pal : isPal,
                    year : false
                });
            }
            return arr;
        },
        isFeedbackSplash : function() {
            return this.$route.path === '/account/sales-potential-2' && this.erp?.status === 'authentication_failure';
        },
        gotoCompanySettings : function() {
            this.$router.push('/account/company/erp');
        },
        getData : function () {
            this.ui.loading = true;

            // var date = new Date();
            // var finYears = this.erp.financialYears;
            // var lastFinYear = finYears[finYears.length - 1];
            // var finYearEndParts = lastFinYear.end.split('-');
            // var toYear = Number(finYearEndParts[0]);
            // var currentYear = date.getFullYear();
            // var toEndDay = '-12-31';

            const fromDate = DateRangeModel.getFromString();
            const toDate = DateRangeModel.getToString();

            // if (toYear >= currentYear) {
            //     toYear = currentYear;
            //     toEndDay = '-' + this.zeroPadNumber(date.getMonth() + 1) + '-' + this.zeroPadNumber(date.getDate());
            // }

            //var fromYear = toYear - 1;

            this.oldDates.from = fromDate;
            this.oldDates.to = toDate;
            // DateRangeModel.setFromString(fromYear + '-01-01');
            // DateRangeModel.setToString(toYear + toEndDay);
            this.ui.showDateRangeSelection = true;

            //Shitty hack to be sure that all entries that go from backend have the same "Unknown" value
            const checkUnknown = (entry) => {
                if (entry.key_word === 'UNKNOWN') {
                    entry.key_word = 'Unknown'
                }
                return entry;
            };

            //SalesPotentialDataCollection.getSalesPotentialCompany()
            SalesPotentialDataCollection.getSalesPotentialCompany(fromDate, toDate, this.version)
              .then(function (res) {
                  if (res._embedded && res._embedded.items) {
                      this.entries = res._embedded.items.map(checkUnknown);
                      this.groups = this.organizeByGroup(this.entries);
                      this.calculateTableProperties();
                  }

                  this.ui.loading = false;

              }.bind(this));
        },
    };

    return Vue.extend({
        template,
        data : bindings,
        methods,
        props : ['version'],
        components : {
            'date-picker' : datePicker,
            'line-chart' : lineChart
        },
        watch : {
            'version' : function () {
                this.init();
            }
        },
        mounted : function() {
            this.init();
        },
        beforeDestroy : function () {
            DateRangeModel.setFromString(this.oldDates.from);
            DateRangeModel.setToString(this.oldDates.to);
        }
    });
});
