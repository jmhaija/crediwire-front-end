    import Vue from 'Vue'
    import moment from 'moment'
    import Highcharts from 'Highcharts'
    import DictionaryModel from 'models/DictionaryModel'
    import CompanyModel from 'models/CompanyModel'
    import SalesPotentialDataCollection from 'collections/SalesPotentialDataCollection'
    import NumberFormatter from 'services/NumberFormatter'
    import datePicker from 'elements/date-picker'
    import EventBus from 'services/EventBus'
    import AssetModel from 'models/AssetModel'
    import lineChart from 'elements/line-chart'
    import pieChart from 'components/pieChart.vue'
    import barChart from 'components/barChart.vue'

    const template = [
    '<article ref="dynamictable">',
    '   <nav class="tabs">',
    '       <ul>',
    '           <router-link tag="li" to="/account/connections/all"><a>{{ui.dictionary.connections.all}}</a></router-link>',
    '           <router-link tag="li" to="/account/connections/portfolio"><a>{{ui.dictionary.connections.portfolio}}</a></router-link>',
    '           <router-link tag="li" to="/account/connections/shared" v-show="company && company.owned"><a>{{ui.dictionary.connections.shared}}</a></router-link>',
    '           <router-link tag="li" to="/account/sales-potential"><a>{{ui.dictionary.salesPotential.salesPotentialReport}}</a></router-link>',
    '           <router-link tag="li" class="right-float" to="/account/invitations"><a>{{ui.dictionary.invitations.title}}</a></router-link>',
    '           <router-link v-show="company && company.settings && company.settings.invitation_metric" tag="li" class="right-float" to="/account/invitation-metrics"><a>{{ui.dictionary.invitations.metrics}}</a></router-link>',
    '       </ul>',
    '   </nav>',
    '   <section class="tab-content">',

    '       <div class="line-spacer"></div>',

    '       <div v-show="ui.loading">',
    '           <div class="working"></div>',
    '       </div>',
    '       <div v-show="!ui.loading">',

    '           <div class="graph-bar">',
    '               <div class="right">',
    '                   <div class="pointer faded inline" v-on:click="changeSection(\'timeline\')" v-show="ui.section == \'table\'"><span class="primary-color">{{ui.dictionary.salesPotential.tableView}}</span> <img :src="getImage(\'/assets/img/elements/switch-left.png\')" class="switch"> {{ui.dictionary.salesPotential.timelineView}}</div>',
    '                   <div class="pointer faded inline" v-on:click="changeSection(\'table\')" v-show="ui.section == \'timeline\'">{{ui.dictionary.salesPotential.tableView}} <img :src="getImage(\'/assets/img/elements/switch-right.png\')" class="switch"> <span class="primary-color">{{ui.dictionary.salesPotential.timelineView}}</span></div>',
    '               </div>',
    '               <date-picker :onDateChange="getData"></date-picker>',
    '           </div>',

    '           <div class="dynamic-table" v-show="ui.section == \'table\'">',

    '               <div class="container with-margin">',

                        /**
                         * Table Header
                         */
    '                   <div class="row head tabular-heading" :style="{ width : tableProps.tableWidth - 17 + \'px\' }">',
                            /**
                             * Firs col
                             */
    '                       <div class="first-col tabular-heading" :class="{ \'scrolled-right\': scrolledRight }" :style="{ width : tableProps.firstCellWidth + \'px\' }">',
    '                           <div class="cell" :style="{ width : tableProps.firstCellWidth + \'px\' }">',
    '                               <span class="timeline-checkmark tooltip"><i class="cwi-graph icon"></i> <div class="message right">{{ui.dictionary.salesPotential.includeInTimeline}}</div></span>',
    '                               <span class="cell-value">{{ui.dictionary.salesPotential.item}}</span>',
    '                          </div>',
    '                       </div',

                            /**
                             * Other cols
                             */

    '                       ><div class="main-cols">',

    '                           <div class="cell"',
    '                                :style="{ width : tableProps.cellWidth + \'px\' }">',
    '                               <span class="cell-value">',
    '                                  <span>{{ui.dictionary.salesPotential.numOfCompanies}}</span>',
    '                               </span>',
    '                           </div',

    '                           ><div class="cell"',
    '                                :style="{ width : tableProps.cellWidth + \'px\' }">',
    '                               <span class="cell-value">',
    '                                  <span>{{ui.dictionary.salesPotential.total}}</span>',
    '                               </span>',
    '                           </div',
    '                           ><div class="cell"',
    '                                v-for="(period, i) in sortCols(dates)"',
    '                                :style="{ width : tableProps.cellWidth + \'px\' }">',
    '                               <span class="cell-value">',
    '                                  <span>{{formatPeriod(period)}}</span>',
    '                               </span>',
    '                           </div>',

    '                       </div>',
    '                   </div>',


                        /**
                        * Table body
                         */

    '                   <div class="body">',
                            /**
                             * First col
                             */
    '                        <div class="first-col" :class="{ \'scrolled-right\': scrolledRight }" :style="{ width : tableProps.firstCellWidth + \'px\' }">',


    '                           <div class="first-col-container">',

    /** Group **/
    '                               <div v-for="(group, index) in getKeys(getGroups())">',
    '                                   <div class="row separator tabular-row">',
    '                                       <div class="cell" :style="{ width : tableProps.firstCellWidth + \'px\'}">',
    '                                           <span class="cell-value" :title="group">',
    '                                               <span>{{group}}</span>',
    '                                           </span>',
    '                                       </div>',
    '                                   </div>',

    /** Pal Heading **/
    '                                   <div class="row separator smaller tabular-row" v-show="hasKeys(groups[group].pal)">',
    '                                       <div class="cell" :style="{ width : tableProps.firstCellWidth + \'px\'}">',
    '                                           <span class="cell-value">',
    '                                               <span>{{ui.dictionary.palbal.pal}}</span>',
    '                                           </span>',
    '                                       </div>',
    '                                   </div>',

    /** Pal Account Names **/
    '                                   <div class="row" :class="{ \'tabular-altrow\' : index % 2 == 0, \'tabular-row\' : index % 2 != 0 }"',
    '                                       v-if="hasKeys(groups[group].pal)"',
    '                                       v-for="(account, index) in getKeys(getGroups()[group].pal)">',
    '                                       <div class="cell" :style="{ width : tableProps.firstCellWidth + \'px\'}">',
    '                                           <span class="cell-value" :title="account">',
    '                                               <span class="timeline-checkmark">',
    '                                                   <div class="checkbox-field">',
    '                                                       <label><input type="checkbox" v-model="groups[group].pal[account].timeline"><i></i></label>',
    '                                                   </div>',
    '                                               </span>',
    '                                               <span>{{account}}</span>',
    '                                           </span>',
    '                                       </div>',
    '                                   </div>',


    /** Bal Heading **/
    '                                   <div class="row separator smaller tabular-row" v-show="hasKeys(groups[group].bal)">',
    '                                       <div class="cell" :style="{ width : tableProps.firstCellWidth + \'px\'}">',
    '                                           <span class="cell-value">',
    '                                               <span>{{ui.dictionary.palbal.bal}}</span>',
    '                                           </span>',
    '                                       </div>',
    '                                   </div>',

    /** Bal Account Names **/
    '                                   <div class="row" :class="{ \'tabular-altrow\' : index % 2 == 0, \'tabular-row\' : index % 2 != 0 }"',
    '                                       v-if="hasKeys(groups[group].bal)"',
    '                                       v-for="(account, index) in getKeys(getGroups()[group].bal)">',
    '                                       <div class="cell" :style="{ width : tableProps.firstCellWidth + \'px\'}">',
    '                                           <span class="cell-value" :title="account">',
    '                                               <span class="timeline-checkmark">',
    '                                                   <div class="checkbox-field">',
    '                                                       <label><input type="checkbox" v-model="groups[group].bal[account].timeline"><i></i></label>',
    '                                                   </div>',
    '                                               </span>',
    '                                               <span>{{account}}</span>',
    '                                           </span>',
    '                                       </div>',
    '                                   </div>',


    '                              </div>',
    '                           </div>',

    '                       </div',

                            /**
                             * Other cols
                             */
    '                       ><div class="main-cols" v-on:scroll="handleScroll"',
    '                           v-on:wheel="handleWheelScroll"',
    '                           :style="{ width : tableProps.tableWidth + \'px\', marginLeft : (0 - tableProps.firstCellWidth)  + \'px\', paddingLeft : tableProps.firstCellWidth  + \'px\' }">',


    '                           <div class="main-cols-container">',
    '                               <div v-for="(group, index) in getKeys(getGroups())">',

    /** Group row filler **/
    '                                   <div class="row separator tabular-row">',


    '                                       <div class="cell"',
    '                                           :style="{ width : tableProps.cellWidth + \'px\' }">',

    '                                           <span class="cell-value">',
    '                                               <span>&nbsp;</span>',
    '                                           </span>',
    '                                       </div',


    '                                       ><div class="cell"',
    '                                           v-for="date in dates"',
    '                                           :style="{ width : tableProps.cellWidth + \'px\' }">',

    '                                           <span class="cell-value">',
    '                                               <span>&nbsp;</span>',
    '                                           </span>',
    '                                       </div',
    '                                       ><div class="cell"',
    '                                           :style="{ width : tableProps.cellWidth + \'px\' }">',

    '                                           <span class="cell-value">',
    '                                               <span>&nbsp;</span>',
    '                                           </span>',
    '                                       </div>',
    '                                   </div>',

    /** Pal Heading Filler **/
    '                                   <div class="row separator smaller tabular-row" v-show="hasKeys(groups[group].pal)">',


    '                                       <div class="cell"',
    '                                           :style="{ width : tableProps.cellWidth + \'px\' }">',

    '                                           <span class="cell-value">',
    '                                               <span>&nbsp;</span>',
    '                                           </span>',
    '                                       </div',



    '                                       ><div class="cell"',
    '                                           v-for="date in dates"',
    '                                           :style="{ width : tableProps.cellWidth + \'px\' }">',

    '                                           <span class="cell-value">',
    '                                               <span>&nbsp;</span>',
    '                                           </span>',
    '                                       </div',
    '                                       ><div class="cell"',
    '                                           :style="{ width : tableProps.cellWidth + \'px\' }">',

    '                                           <span class="cell-value">',
    '                                               <span>&nbsp;</span>',
    '                                           </span>',
    '                                       </div>',
    '                                   </div>',


    /** Pal **/
    '                                   <div class="row"',
    '                                       v-if="hasKeys(groups[group].pal)"',
    '                                       v-for="(account, index) in getKeys(getGroups()[group].pal)" :id="account">',


    '                                       <div class="cell" :class="{ \'tabular-altrow\' : index % 2 == 0, \'tabular-row\' : index % 2 != 0 }"',
    '                                           :style="{ width : tableProps.cellWidth + \'px\' }">',
    '                                           <span class="cell-value">',
    '                                               <span>{{groups[group].pal[account].number_of_companies}}</span>',
    '                                           </span>',
    '                                       </div',



    '                                       ><div class="cell" :class="{ \'tabular-altrow\' : index % 2 == 0, \'tabular-row\' : index % 2 != 0 }"',
    '                                           :style="{ width : tableProps.cellWidth + \'px\' }">',
    '                                           <span class="cell-value">',
    '                                               <span>{{formatNumber(getGroups()[group].pal[account].total)}}</span>',
    '                                           </span>',
    '                                       </div',


    '                                       ><div class="cell" :class="{ \'tabular-altrow\' : index % 2 == 0, \'tabular-row\' : index % 2 != 0 }"',
    '                                           v-for="(value, key) in groups[group].pal[account].values"',
    '                                           :style="{ width : tableProps.cellWidth + \'px\' }">',

    '                                           <span class="cell-value">',
    '                                               <span>{{formatNumber(value)}}</span>',
    '                                           </span>',
    '                                       </div>',

    '                                   </div>',


    /** Bal Heading Filler **/
    '                                   <div class="row separator smaller tabular-row" v-show="hasKeys(groups[group].bal)">',


    '                                       <div class="cell"',
    '                                           :style="{ width : tableProps.cellWidth + \'px\' }">',

    '                                           <span class="cell-value">',
    '                                               <span>&nbsp;</span>',
    '                                           </span>',
    '                                       </div',


    '                                       ><div class="cell"',
    '                                           v-for="date in dates"',
    '                                           :style="{ width : tableProps.cellWidth + \'px\' }">',

    '                                           <span class="cell-value">',
    '                                               <span>&nbsp;</span>',
    '                                           </span>',
    '                                       </div',
    '                                       ><div class="cell"',
    '                                           :style="{ width : tableProps.cellWidth + \'px\' }">',

    '                                           <span class="cell-value">',
    '                                               <span>&nbsp;</span>',
    '                                           </span>',
    '                                       </div>',
    '                                   </div>',


    /** Bal **/
    '                                   <div class="row"',
    '                                       v-if="hasKeys(groups[group].bal)"',
    '                                       v-for="(account, index) in getKeys(getGroups()[group].bal)" :id="account">',


    '                                       <div class="cell" :class="{ \'tabular-altrow\' : index % 2 == 0, \'tabular-row\' : index % 2 != 0 }"',
    '                                           :style="{ width : tableProps.cellWidth + \'px\' }">',
    '                                           <span class="cell-value">',
    '                                               <span>{{groups[group].bal[account].number_of_companies}}</span>',
    '                                           </span>',
    '                                       </div',


    '                                       ><div class="cell" :class="{ \'tabular-altrow\' : index % 2 == 0, \'tabular-row\' : index % 2 != 0 }"',
    '                                           :style="{ width : tableProps.cellWidth + \'px\' }">',
    '                                           <span class="cell-value">',
    '                                               <span>{{formatNumber(getGroups()[group].bal[account].total)}}</span>',
    '                                           </span>',
    '                                       </div',


    '                                       ><div class="cell" :class="{ \'tabular-altrow\' : index % 2 == 0, \'tabular-row\' : index % 2 != 0 }"',
    '                                           v-for="(value, key) in groups[group].bal[account].values"',
    '                                           :style="{ width : tableProps.cellWidth + \'px\' }">',

    '                                           <span class="cell-value">',
    '                                               <span>{{formatNumber(value)}}</span>',
    '                                           </span>',
    '                                       </div>',

    '                                   </div>',



    '                              </div>',
    '                           </div>',


    '                       </div>', //Other cols
    '                   </div>', //Table body



    '               </div>', //Container
    '           </div>', //Dynamic table



    '           <div v-show="ui.section == \'timeline\' && !ui.noTimeData">',
    '               <line-chart :percentMultiply="false" :chart="chart" :init="!ui.loading" :reinit="ui.section == \'timeline\'" :interval="ui.interval" :cashbook="false" :types="[\'DKK\']" type="DKK" :average="false" :previous="false" :budget="false" :floatingAverage="false"></line-chart>',
    '           </div>',

    '           <div class="splash" v-show="ui.section == \'timeline\' && ui.noTimeData">',
    '                <h1>{{ui.dictionary.salesPotential.selectAccountsTitle}}</h1>',
    '                <p>{{ui.dictionary.salesPotential.selectAccountsDescription}}</p>',
    '           </div>',


    '       </div>',
    '   </section>',
    '</article>'
    ].join("\n");


    var bindings = function () {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                loading : true,
                section : 'table',
                noTimeData : false,
                reclassified : true
            },
            company : CompanyModel.getCompany(),
            entries : [],
            sums : [],
            groups : {},
            sumGroups : {},
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
            accountsToShow : [],
            chartOptions : {
                exposure : {
                    chart : {
                        animation: false
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
                            data : [{
                                y : 4,
                                color : '#cccccc'
                            }, {
                                y : 6,
                                color : '#cccccc'
                            }, {
                                y : 8,
                                color : '#cccccc'
                            }, {
                                y : 9,
                                color : '#cccccc'
                            }, {
                                y : 12,
                                color : '#2fabff'
                            }],
                            tooltip : {
                                pointFormat : '{point.y}'
                            },
                            maxPointWidth: 20,
                            borderRadius : 0,
                            threshold : 0
                        }
                    ],
                    title : null,
                        tooltip : {
                            enabled : true
                        },
                    xAxis : {
                        categories : ['Lending', 'Leasing', 'Credit Cards', 'Pension', 'Total'],
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
                            },
                            format : '{value}'
                        },
                        gridLineDashStyle : 'Dash',
                        gridLineColor: '#dddddd'
                    }
                },
                walletComposition : {
                    chart : {
                        animation: false
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
                            data : [{
                                y : 4,
                                color : '#cccccc'
                            }, {
                                y : 6,
                                color : '#cccccc'
                            }, {
                                y : 8,
                                color : '#cccccc'
                            }, {
                                y : 9,
                                color : '#cccccc'
                            }, {
                                y : 12,
                                color : '#2fabff'
                            }],
                            tooltip : {
                                pointFormat : '{point.y}'
                            },
                            maxPointWidth: 20,
                            borderRadius : 0,
                            threshold : 0
                        }
                    ],
                    title : null,
                        tooltip : {
                            enabled : true
                        },
                    xAxis : {
                        categories : ['Lending', 'Leasing', 'Credit Cards', 'Pension', 'Total'],
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
                            },
                            format : '{value}'
                        },
                        gridLineDashStyle : 'Dash',
                        gridLineColor: '#dddddd'
                    }
                },
                walletDistribution : {
                    chart : {
                        animation: false,
                        spacing: [0, 0, 0, 0],
                        width: (window.innerWidth > 1650 || window.innerWidth < 1200) ? 280 : (window.innerWidth > 1470 ? 240 : 180)
                    },
                    credits : {
                        enabled : false
                    },
                    legend : {
                        enabled : true
                    },
                    plotOptions : {
                        pie : {
                            dataLabels : {
                                enabled : false
                            }
                        },
                    },
                    series : [
                        {
                            type : 'pie',
                            name : DictionaryModel.getHash().invoices.title,
                            data : [{
                                name : 'Renteudgift, bank',
                                y : 24,
                                color : '#ffa630'
                            }, {
                                name : 'Unknown',
                                y : 30,
                                color : '#cccccc'
                            }, {
                                name : 'Låneomkostninger o/2 år',
                                y : 7,
                                color : '#2fabff'
                            }, {
                                name : 'Låneomkostninger u/2 år',
                                y : 19,
                                color : '#2fabff'
                            }, {
                                name : 'Renteindtægt, bank',
                                y : 20,
                                color : '#2fabff'
                            }],
                            innerSize : '75%',
                            tooltip : {
                                pointFormat : '{point.y}'
                            }
                        }
                    ],
                    title : null
                },
                productPenetration : {
                    chart : {
                        animation: false
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
                            data : [{
                                y : 10,
                                color : '#cccccc'
                            }, {
                                y : 8,
                                color : '#cccccc'
                            }, {
                                y : 7,
                                color : '#cccccc'
                            }, {
                                y : 5,
                                color : '#cccccc'
                            }],
                            tooltip : {
                                pointFormat : '{point.y}'
                            },
                            maxPointWidth: 20,
                            borderRadius : 0,
                            threshold : 0
                        }
                    ],
                    title : null,
                        tooltip : {
                            enabled : true
                        },
                    xAxis : {
                        categories : ['Renteudgift, bank', 'Renteindtægt, bank', 'Låneomkostninger o/2 år', 'Låneomkostninger u/2 år'],
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
                            },
                            format : '{value}'
                        },
                        gridLineDashStyle : 'Dash',
                        gridLineColor: '#dddddd'
                    }
                }
            },
            chartObjects : {
                exposure : null,
                walletComposition : null,
                walletDistribution : null,
                productPenetration : null
            }
        };
    };


    var methods = {
        init : function () {
            this.getData();
            this.getSumData();
            EventBus.$on('companyUserChanged', this.userChangedHandler);
        },

        drawCharts : function () {
            setTimeout(function () {
                this.chartObjects.exposure = Highcharts.chart(this.$refs.dynamictable.querySelector('#exposure-chart'), this.chartOptions.exposure);
                this.chartObjects.walletDistribution = Highcharts.chart(this.$refs.dynamictable.querySelector('#wallet-distribution-chart'), this.chartOptions.walletDistribution);
                this.chartObjects.walletComposition = Highcharts.chart(this.$refs.dynamictable.querySelector('#wallet-composition-chart'), this.chartOptions.walletComposition);
                this.chartObjects.productPenetration = Highcharts.chart(this.$refs.dynamictable.querySelector('#product-penetration-chart'), this.chartOptions.productPenetration);
            }.bind(this), 500);

        },

        getGroups : function (sum) {
            if (sum) {
                return this.sumGroups;
            }

            return this.groups;
        },

        userChangedHandler : function () {
            this.getData();
            this.getSumData();
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
            return Object.keys(obj);
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
                this.tableProps.cellWidth = 200;
                this.tableProps.tableWidth = this.$refs.dynamictable.querySelector('.container').offsetWidth;
                this.tableProps.maxCellWidth = Math.round(this.tableProps.tableWidth * 0.25);
                var firstCellWantedWidth = this.tableProps.maxCellWidth + this.tableProps.additionalPadding;

                this.tableProps.firstCellWidth = firstCellWantedWidth > this.tableProps.maxCellWidth ? this.tableProps.maxCellWidth : firstCellWantedWidth;

                this.tableProps.remainingCellWidth = this.tableProps.tableWidth - this.tableProps.firstCellWidth - 17;

                var cols = this.ui.section == this.dates.length + 1;
                var wantedCellWidth = Math.round(this.tableProps.remainingCellWidth / cols) - 3;

                this.tableProps.cellWidth = wantedCellWidth < this.tableProps.cellWidth ? this.tableProps.cellWidth : wantedCellWidth;

                //this.drawCharts();
            }.bind(this), 200);
        },

        getData : function () {
            this.ui.loading = true;

            SalesPotentialDataCollection.getSalesPotentialTotalOverTime()
                .then(function (res) {

                    if (res._embedded && res._embedded.items) {
                        this.entries = res._embedded.items;
                        this.groups = this.organizeByGroup(this.entries);
                        this.padData(this.groups);
                        this.calculateTableProperties();
                    }

                    this.ui.loading = false;

                }.bind(this));
        },

        getSumData : function () {
            this.ui.loading = true;

            SalesPotentialDataCollection.getSalesPotentialSumTotalOverTime()
                .then(function (res) {

                    if (res._embedded && res._embedded.items) {
                        this.sums = res._embedded.items;
                        //this.sumGroups = this.getNumberOfCompanies(this.sums)
                    }

                    this.ui.loading = false;

                }.bind(this));
        },

        organizeByGroup : function (entries) {
            var groups = {};
            var dates = [];

            entries.forEach(function (entry, index) {
                if (!groups[entry.group_name]) {
                    groups[entry.group_name] = {
                        pal : {},
                        bal : {}
                    };
                }

                var type = entry.pal ? 'pal' : 'bal';

                if (!groups[entry.group_name][type][entry.key_word]) {
                    groups[entry.group_name][type][entry.key_word] = { total : 0, number_of_companies : 0, entries : [] };
                }

                groups[entry.group_name][type][entry.key_word].total += entry.amount;

                groups[entry.group_name][type][entry.key_word].entries.push(entry);

                if (entry.date && dates.indexOf(entry.date) < 0) {
                    dates.push(entry.date);
                }
            }.bind(this));

            this.dates = this.sortCols(dates);
            return groups;
        },


        getNumberOfCompanies : function (entries) {
            entries.forEach(function (entry, index) {
                if (entry.number_of_companies) {
                    if (this.groups[entry.group_name] && this.groups[entry.group_name].pal[entry.key_word]) {
                        this.groups[entry.group_name].pal[entry.key_word].number_of_companies = entry.number_of_companies;
                    } else if (this.groups[entry.group_name] && this.groups[entry.group_name].bal[entry.key_word]) {
                        this.groups[entry.group_name].bal[entry.key_word].number_of_companies = entry.number_of_companies;
                    }
                }
            }.bind(this));
        },


        padData : function (groups) {
            for (var group in groups) {
                for (var type in groups[group]) {
                    for (var cat in groups[group][type]) {
                        var paddedEntries = [];
                        var entries = this.sortEntries(groups[group][type][cat].entries);

                        this.dates.forEach(function (date, dateIndex) {
                            if (entries[0] && entries[0].date == date) {
                                var entry = entries.shift();
                                paddedEntries.push(entry.amount);
                            } else {
                                paddedEntries.push(0);
                            }
                        }.bind(this));

                        groups[group][type][cat].values = paddedEntries;
                    }
                }
            }

            this.ui.loading = false;
        },
    };

    export default Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        components : {
            'date-picker' : datePicker,
            'line-chart' : lineChart,
            'pie-chart' : pieChart,
            'bar-chart' : barChart
        },
        mounted : function () {
            this.init();
        }
    });
