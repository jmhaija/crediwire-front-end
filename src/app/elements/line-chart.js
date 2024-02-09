define([

    'Vue',
    'Highcharts',
    'moment',
    'models/DictionaryModel',
    'elements/tutorial-slide',
    'services/NumberFormatter',
    'services/EventBus',
    'services/Tutorial',
    'models/ValidLedgerModel',
    'services/HexUtils',
    'constants/ui/cashbook'

], function(Vue, Highcharts, moment, DictionaryModel, tutorialSlide, NumberFormatter, EventBus, Tutorial, ValidLedgerModel, HexUtils, cashbookStates) {
    /**
     * Element template
     */
    var template = [
        '<article ref="chartarea" class="line-chart-area">',
        '   <div id="line-chart"></div>',

        '   <v-popover :open="showLabelsTutorial()" placement="top">',
        '       <div class="chart-legend flex-row" v-show="!static">',
        '           <div class="drilldown-name" v-show="drilldownName" v-on:click="closeDrilldown()"><i class="cwi-left"></i> {{drilldownName}} {{ui.dictionary.drilldown.title}} : </div>',
        '           <div data-test-id="optionSeries" v-for="(s, i) in options.series"',
        '            v-show="s.showInLegend"',
        '            class="legend-item"',
        '            :class="{ options : ui.showOptions == s.name }"',
        '            :style="{ backgroundColor : getSeriesColor(s, i), borderColor: getSeriesColor(s, i), color : \'#ffffff\' }"',
        '            v-on:click.stop="triggerVisibility(i, s)">',

        '               <span v-show="drillDownCallback && showDrilldownOption(s)" class="more" v-on:click.stop="openMoreOptions(s.name)"><i class="cwi-gear" :class="{ \'animate-spin\' : s.loading && ui.loading }"></i></span>',
        '               <span v-show="allowInversion" class="more" v-on:click.stop="reverseSeriesData(s)"><i class="cwi-minus-circle" v-show="!s.reversed"></i><i class="cwi-plus-circle" v-show="s.reversed"></i></span>',
        '               <span>{{translateSeriesCategory(s.name)}}</span>',

        '               <div class="options-menu" :style="{ color : getSeriesColor(s, i), borderColor: getSeriesColor(s, i) }">',
        '                   <div class="menu-item" v-on:click.stop="drilldownSeries(s, i)">{{ui.dictionary.drilldown.showSeries}}</div>',
        '               </div>',
        '           </div>',
        '           <div class="tooltip" v-show="!static"><i class="cwi-info"></i> <div class="message right">{{ui.dictionary.overview.toggleSeries}}</div></div>',
        '       </div>',

        '       <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>',
        '   </v-popover>',
        '</article>'
    ].join("\n");

    /**
     * Data bindings
     */
    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                showOptions : null,
                loading : false,
                showTutorial : false
            },
            chartObject : {},
            options : {
                chart : {
                    animation : false,
                    height: 550
                },
                colors: ['#2fabff', '#ffa630', '#ff3131', '#81b734', '#ff31a5', '#7c4c25', '#e4d354', '#5a5a5a', '#f45b5b', '#91e8e1', '#4572A7', '#AA4643', '#89A54E', '#80699B', '#3D96AE', '#DB843D', '#92A8CD', '#B5CA92'],
                credits : {
                    enabled : false
                },
                legend : {
                    margin : 25,
                    enabled : this.static ? true : false
                },
                plotOptions : {
                    line : {
                        animation : true,
                        allowPointSelect : true,
                        enableMouseTracking : true,
                        marker : {
                            radius : 1
                        },
                        visible: true
                    },
                    series : {
                        states : {
                            hover : {
                                enabled : true
                            }
                        }
                    }
                },
                title : null,
                series: [],
                tooltip : {
                    shared : true,
                    valueDecimals : 1,
                    valueSuffix : ''
                },
                xAxis : {
                    categories: [],
                    tickInterval : null,
                    plotLines : [{
                        color : '#cccccc',
                        width : 1,
                        dashStyle : 'Dash',
                        value : -1,
                        label : {
                            text : '',
                            style: {
                                color: '#cccccc'
                            }
                        }
                    }]
                },
                yAxis : {
                    gridLineWidth : 0,
                    plotLines : [{
                        color : '#dddddd',
                        width : 1,
                        value : 0
                    }],
                    labels : {
                        /**
                        formatter : function() {
                            return this.formatNumber(this.value);
                        }
                        */
                    },
                    title : {
                        text : '$'
                    }
                }
            },
            settings : {
                interval : 'month',
                type : '',
                showAverage : false,
                showPrevious : false,
                showCashbook : false,
                showCashbookOnly : false,
                showBudget : false,
                lineStyles : {
                    'current' : {
                        dashStyle : 'Solid',
                        lineWidth : 2,
                        showInLegend : true
                    },
                    'average' : {
                        dashStyle : 'Dash',
                        lineWidth : 2,
                        showInLegend : false
                    },
                    'previous' : {
                        dashStyle : 'Dot',
                        lineWidth : 2,
                        showInLegend : false
                    },
                    'cbCurrent' : {
                        dashStyle : 'ShortDot',
                        lineWidth : 2,
                        showInLegend : false
                    },
                    'cbPrevious' : {
                        dashStyle : 'ShortDot',
                        lineWidth : 4,
                        showInLegend : false
                    },
                    'budget' : {
                        dashStyle : 'LongDashDotDot',
                        lineWidth: 2,
                        showInLegend : false
                    }
                },
                showFA : false,
                showFADropdown : false,
                showPODropdown : false,
                faSpread : 3,
                rendered : false,
                previousType : 'period',
                firstChecked : null,
                predefinedColors : [
                    {name : 'revenue', color : '#2fabff'},
                    {name : 'fixedCosts', color : '#ff3131'},
                    {name : 'contributionMargin', color : '#ffa630'},
                    {name : 'profit', color : '#81b734'},
                    {name : 'exIncomeExpense', color : '#5a5a5a'}
                ]
            },
            hideSeriesList : [],
            intervalFormats : {
                'day': 'YYYY-MM-DD',
                'week': 'YYYY [w]W',
                'month': 'YYYY-MM',
                'quarter': 'YYYY [q]Q',
                'half-year-1': 'YYYY [1st]',
                'half-year-2': 'YYYY [2nd]',
                'year': 'YYYY'
            },
            drilldowns : ['fixedCosts', 'exIncomeExpense'],
            tutorial : Tutorial
        };
    };


    /**
     * Methods
     */
    var methods = {
        showLabelsTutorial : function() {
            if (!this.closeDrilldownCallback && this.tutorial.current && (this.tutorial.current.name == 'customerFinancialPerformance' || this.tutorial.current.name == 'financialPerformance') && !this.tutorial.state.loading && !this.tutorial.state.finished) {
                this.settings.showAverage = true;
                return true;
            }

            return false;
        },

        generalInit : function() {
            document.addEventListener('clickAppBody', this.hideMoreOptions);
            EventBus.$on('validLedgerDateChanged', this.plotValidLedgerLine);
            EventBus.$on('uiLanguageChanged', this.init());
            /**
             * Workaround for Array.prototype.flat():
             * https://github.com/highcharts/highcharts/issues/8477
             */
            Highcharts.wrap(Highcharts.Axis.prototype, 'getPlotLinePath', function(proceed) {
                var path = proceed.apply(this, Array.prototype.slice.call(arguments, 1));
                if (path) {
                    path.flat = false;
                }
                return path;
            });

        },

        initFormatters : function() {
            var scope = this;
            this.options.tooltip.pointFormatter = function() {
                if (this.series.userOptions.samples && this.series.userOptions.samples[this.index]) {
                    return '<span style="color:'+this.series.color+'">\u25CF</span> ' + scope.translateSeriesCategory(this.series.name) + ': <b>' + scope.formatNumber(this.y) + ' ' + scope.translateCurrency(scope.settings.type) + '</b> (' + this.series.userOptions.samples[this.index] + ')<br/>';
                } else {
                    return '<span style="color:'+this.series.color+'">\u25CF</span> ' + scope.translateSeriesCategory(this.series.name) + ': <b>' + scope.formatNumber(this.y) + ' ' + scope.translateCurrency(scope.settings.type) + '</b><br/>';
                }
            };

            this.options.yAxis.labels.formatter = function() {
                /**
                 if (scope.settings.type == '%') {
                    return Number(scope.formatNumber(this.value)).toFixed(1);
                }
                */

                return scope.formatNumber(this.value);
            };
        },

        showDrilldownOption : function(series) {
            // if (this.isUnderEditPresentation) {
            //     return false;
            // }

            if (!this.dashID || this.dashID != '_general') {
                return false;
            }

            var scope = this;
            var found = false;

            this.drilldowns.forEach(function(kpi) {
                if (scope.ui.dictionary.kpis[kpi] && scope.ui.dictionary.kpis[kpi] == series.name) {
                    found = true;
                }
            });

            return found;
        },

        hideMoreOptions : function() {
            this.ui.showOptions = null;
        },

        openMoreOptions : function(name) {
            if (!this.ui.loading) {
                this.ui.showOptions = name;
            }
        },

        reverseSeriesData : function (series) {
            series.data.forEach(function (point, index) {
                series.data[index] = point * -1;
            });

            if (series.reversed) {
                series.reversed = false;
            } else {
                series.reversed = true;
            }

            this.render();
        },

        refresh : function() {
            var scope = this;

            scope.options.plotOptions.line.animation = false;
                //Timeout is necessary so the click event doesn't try
                //to reference a non-existing chart (if render() is fired off immediately)
                setTimeout(function() {
                    scope.render();
                    scope.options.plotOptions.line.animation = true;
                }, 1);
        },



        initialize : function() {
            this.settings.firstChecked = this.drillDownCallback ? (JSON.parse(sessionStorage.getItem('firsts'+this.dashID)) || []) : [];
            //this.settings.firstChecked = [];
            this.hideSeriesList = this.drillDownCallback ? (JSON.parse(sessionStorage.getItem('series'+this.dashID)) || []) : [];

            this.settings.interval = this.interval || 'month';
            this.settings.type = this.type || '';
            this.settings.showAverage = this.average || false;
            this.settings.showPrevious = this.previous || false;
            this.settings.showCashbook = this.cashbook || false;
            this.settings.showFA = this.floatingAverage || false;
            this.settings.previousType = this.previousType;

            var scope = this;

            for (var interval in scope.chart) {
                var intervalValue = scope.chart[interval];

                for (var type in intervalValue) {
                    //Set a callback for every click of the series legend (only for current series)
                    if (scope.chart[interval][type].current) {
                        for (var s = 0; s < scope.chart[interval][type].current.series.length; s++) {
                            scope.chart[interval][type].current.series[s].events = {
                                legendItemClick : scope.static ? function () { return false; } : scope.refresh,
                                show : function() {
                                    scope.removeHideSeries(this.name);
                                },
                                hide : function() {
                                    scope.addHideSeries(this.name);
                                }
                            };
                        }
                    }
                }
            }
        },


        render : function(skipLoadSeries) {
            var scope = this;

            this.settings.showFADropdown = false;

            if (!skipLoadSeries) {
                this.loadSeries();
            }

            if (!this.$refs.chartarea) {
                return false;
            }


            this.chartObject = Highcharts.chart(this.$refs.chartarea.querySelector('#line-chart'), this.options);
            this.settings.rendered = true;
            this.$emit('chartRendered');
            // this.chartObject.series.sort(this.dynamicSort("name"));
            //this.options.plotOptions.line.animation = false;

            setTimeout(function() {
                scope.options.plotOptions.line.animation = false;
            }, 1000);

        },

        dynamicSort : function (property) {
            return function (a,b) {
                return (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            }
        },

        getSeriesColor : function(series, index) {
            if (this.chartObject.series) {
                for (let i = 0; i < this.chartObject.series.length; i++) {
                    if (this.chartObject.series[i].name === series.name && this.chartObject.series[i].visible) {
                        return this.chartObject.series[i].color;
                    } else {
                        if (this.chartObject.series[i].name === series.name) {
                            return '#aaaaaa';
                        }
                    }
                }
            }
        },


        triggerVisibility : function(index, series) {
            const isSerieVisible = series.visible;

            var checked = false;

            if (this.graphType == 'column') {
                this.showOnlySeries(series, series._symbolIndex);
                return false;
            }
            this.chartObject.series.forEach((item) => {
                if (item.name === series.name && isSerieVisible && !checked) {
                    item.hide();
                    checked = true;
                } else {
                    if (item.name === series.name && !isSerieVisible && !checked) {
                        item.show();
                        checked = true;
                    }
                }
            });
            this.refresh();
        },


        showOnlySeries : function(series, index) {
            var scope = this;
            this.ui.showOptions = null;

            this.options.series.forEach(function(s, i) {
                if (s.showInLegend) {
                    scope.options.series[i].visible = false;
                    if (!scope.inHideSeries(s.name)) {
                        scope.addHideSeries(s.name);
                    }
                }
            });
            this.chartObject.series.forEach((item) => {
                item.name === series.name ? item.show() : '';
            });
            this.render();
        },

        drilldownSeries : function(series, index) {
            var scope = this;

            this.ui.showOptions = null;
            this.showOnlySeries(series, index);
            series.loading = true;
            this.ui.loading = true;

            this.drillDownCallback(series)
                .then(function(res) {
                    series.loading = false;
                    scope.ui.loading = false;
                }, function(error) {
                    console.error(error);
                    series.loading = false;
                    scope.ui.loading = false;
                });
        },

        closeDrilldown : function() {
            this.closeDrilldownCallback();
        },


        formatNumber : function(value) {
            if (this.settings.type == '%' && this.percentMultiply) {
                value = value * 100;
            }

            return NumberFormatter.abbreviate(value, false, this.settings.type == '%');
        },


        checkSpread : function(e) {
            if (isNaN(this.settings.faSpread)) {
                this.settings.faSpread = 50;
            } else if (this.settings.faSpread < 1) {
                this.settings.faSpread = 1;
            } else if (this.settings.faSpread > 50) {
                this.settings.faSpread = 50;
            } else if (e.keyCode == 13) {
                this.render();
            }
        },


        calcValues : function(series) {
            var scope = this;

            if (!this.settings.showFA) {
                series.forEach(function(serie, index) {
                    if (serie.originalData) {
                        series[index].data = serie.originalData;
                    }
                });

                return series;
            }


            series.forEach(function(serie, index) {
                if (!serie.originalData) {
                    series[index].originalData = serie.data;
                }

                series[index].data = scope.calcFA(serie.originalData);
            });

            return series;
        },



        calcFA : function(values) {
            var faValues = [];

            for (var i = 0; i < values.length; i++) {

                var from = i - (this.settings.faSpread - 1 || 1);
                var to = i; //+ (this.settings.faSpread || 1);
                var total = 0;
                var count = 0;
                var average = 0;

                for (var j = from; j <= to; j++) {

                    if (values[j] !== undefined) { //&& values[j] !== 0) {
                        total += values[j];
                        count++;
                    } else if (j >= 0) {
                        total += 0;
                        count++;
                    }

                    //count++;
                }

                average = total / count;
                faValues.push(average);
            }

            return faValues;
        },


        checkVisibility : function(series, style) {
            var addToHideList = false;
            for (var s = 0; s < series.length; s++) {
                series[s].visible = true;

                if (!series[s].events) {
                    var scope = this;

                    series[s].events =  {
                        legendItemClick : scope.static ? function () { return false; } : scope.refresh,
                        show : function() {
                            scope.removeHideSeries(this.name);
                        },
                        hide : function() {
                            scope.addHideSeries(this.name);
                        }
                    };
                }

                //Show in legend
                if (style == 'cbCurrent' && this.settings.showCashbookOnly) {
                    series[s].showInLegend = true;
                } else if (this.static && style == 'current' && this.staticSeries && this.staticSeries.indexOf(series[s].name) >= 0) {
                    series[s].showInLegend = true;
                } else if (this.static && style == 'current' && !this.staticSeries) {
                    series[s].showInLegend = true;
                } else if (this.static && style == 'current') {
                    series[s].showInLegend = false;
                }


                //Show static series
                if (this.static && this.staticSeries && style == 'current') {
                    if (this.staticSeries.indexOf(series[s].name) >= 0) {
                        series[s].visible = true;
                    } else {
                        series[s].visible = false;
                    }
                } else if (this.static && !this.staticSeries && style == 'current') {
                    series[s].visible = true;


                    //Show dynamic series
                } else if ((this.tutorial.state.started && !this.tutorial.state.finished) || ( (style == 'current' || (style == 'cbCurrent' && this.settings.showCashbookOnly)) && this.settings.firstChecked && this.settings.firstChecked.indexOf(this.settings.type) < 0) ) {
                    if (s === 0) {
                        series[s].visible = true;
                    } else {
                        series[s].visible = false;
                        this.addHideSeries(series[s].name);
                    }

                    addToHideList = true;

                //} else if (style == 'current' && this.settings.showCashbook && this.settings.showCashbookOnly) {
                //    series[s].visible = false;
                } else if ((style == 'current' || (style == 'cbCurrent' && this.settings.showCashbookOnly)) && this.inHideSeries(series[s].name)) {
                    series[s].visible = false;

                } else if (style != 'current' || (style != 'cbCurrent' && this.settings.showCashbookOnly) ) {
                    series[s].visible = this.options.series[s] ? this.options.series[s].visible : false;
                }
            }


            if (addToHideList) {

                if (!this.settings.firstChecked) {
                    this.settings.firstChecked = [];
                }

                this.settings.firstChecked.push(this.settings.type);
                sessionStorage.setItem('firsts'+this.dashID, JSON.stringify(this.settings.firstChecked));
            }

            return series;
        },


        setPredefinedColor : function(name) {
            var color = false;

            for (var p = 0; p < this.settings.predefinedColors.length; p++) {

                if (this.ui.dictionary.kpis[this.settings.predefinedColors[p].name] == name) {
                    color = this.settings.predefinedColors[p].color;
                }
            }

            return color;
        },


        translateSeriesCategory : function(category) {
            if (category == 'previous' && this.settings.previousType == 'year') {
                return this.ui.dictionary.kpis.lastYear;
            } else if (this.ui.dictionary.kpiCategories[category]) {
                return this.ui.dictionary.kpiCategories[category];
            } else if (this.ui.dictionary.kpis[category]) {
                return this.ui.dictionary.kpis[category];
            } else if (this.ui.dictionary.systemKpis[category]) {
                return this.ui.dictionary.systemKpis[category];
            } else if (category === 'Unspecified'){
                return this.ui.dictionary.drilldown.unspecified;
            } else {
                return category;
            }
        },

        setStyles : function(series, style) {
            var scope = this;

            for (var s = 0; s < series.length; s++) {
                series[s].color = this.setPredefinedColor(series[s].name) || this.options.colors[s];
                series[s].dashStyle = this.settings.lineStyles[style].dashStyle;
                series[s].lineWidth = this.settings.lineStyles[style].lineWidth;
                series[s].showInLegend = this.settings.lineStyles[style].showInLegend;

                if (style == 'current' && this.graphType == 'column') {
                    series[s].type = 'column';
                    series[s].color = HexUtils.adjustHue(series[s].color, 30);
                } else if (style != 'current' && this.graphType == 'column') {
                    series[s].type = 'line';
                    series[s].color = HexUtils.adjustHue(series[s].color, -30);
                } else {
                    series[s].type = 'line';
                }

                if (style != 'current') {
                    series[s].tooltip = {
                        pointFormatter : function() {
                            if (this.series.userOptions && this.series.userOptions.samples && this.series.userOptions.samples[this.index]) {
                                return '<span style="color:'+this.series.color+'">\u25CF</span> '+ scope.translateSeriesCategory(this.series.name)+' (' + scope.translateSeriesCategory(style) + '): <b>' + scope.formatNumber(this.y) + ' ' + scope.translateCurrency(scope.settings.type) + '</b> (' + scope.ui.dictionary.overview.sample + ': ' + this.series.userOptions.samples[this.index] +')<br/>';
                            } else {
                                // scope.translateSeriesCategory(this.series.name) - first part
                                // (' + scope.translateSeriesCategory(style) + ') - second part
                                return '<span style="color:'+this.series.color+'">\u25CF</span> '+ scope.translateSeriesCategory(this.series.name)+' (' + scope.translateSeriesCategory(style) + '): <b>' + scope.formatNumber(this.y) + ' ' + scope.translateCurrency(scope.settings.type) + '</b><br/>';
                            }

                        }
                    };
                }
            }

            return this.checkVisibility(series, style);
        },


        loadSeries : function() {
            var scope = this;

            if (scope.chart === undefined || scope.chart[scope.settings.interval] === undefined || scope.chart[scope.settings.interval][scope.settings.type] === undefined) {
                return false;
            }

            if (!scope.settings.type) {
                scope.settings.type = scope.types[0];
            }

            //Set the y-axis label
            scope.options.yAxis.title.text = scope.translateCurrency(scope.settings.type);
            scope.options.tooltip.valueSuffix = ' ' + scope.translateCurrency(scope.settings.type);

            //Set the axis dates
            scope.options.xAxis.categories = scope.formatCategories( scope.chart[scope.settings.interval][scope.settings.type].current.categories, scope.settings.interval );

            //Set bookkeeping valid line
            scope.plotValidLedgerLine(true);


            //Set the number of ticks
            if (scope.options.xAxis.categories.length > 20) {
                scope.options.xAxis.tickInterval = Math.round(scope.options.xAxis.categories.length / 10);
            } else {
                scope.options.xAxis.tickInterval = null; //null let's Highchart decide the tickInterval
            }

            //Set the current data
            if (scope.settings.showCashbook && scope.settings.showCashbookOnly) {
                scope.options.series = scope.setStyles( scope.calcValues(scope.chart[scope.settings.interval][scope.settings.type].cbCurrent.series) , 'cbCurrent');
            } else {
                scope.options.series = scope.setStyles( scope.calcValues(scope.chart[scope.settings.interval][scope.settings.type].current.series) , 'current');
            }

            if (!scope.settings.showCashbook && scope.settings.showCashbookOnly) {
                scope.options.series = scope.setStyles( scope.calcValues(scope.chart[scope.settings.interval][scope.settings.type].cbCurrent.series) , 'cbCurrent');
            }

            //Set the average series
            if (scope.settings.showAverage) {
                scope.options.series = scope.options.series.concat(scope.setStyles( scope.calcValues(scope.chart[scope.settings.interval][scope.settings.type].average.series) , 'average'));
            }

            //Set the previous series
            if (scope.settings.showPrevious) {
                scope.options.series = scope.options.series.concat(scope.setStyles( scope.calcValues(scope.chart[scope.settings.interval][scope.settings.type].previous.series) , 'previous'));
            }

            //Set the previous series
            if (scope.settings.showBudget) {
                scope.options.series = scope.options.series.concat(scope.setStyles( scope.calcValues(scope.chart[scope.settings.interval][scope.settings.type].budget.series) , 'budget'));
            }

            //Set the cashbook series
            if (scope.settings.showCashbook && !scope.settings.showCashbookOnly) {
                scope.options.series = scope.options.series.concat(scope.setStyles( scope.calcValues(scope.chart[scope.settings.interval][scope.settings.type].cbCurrent.series) , 'cbCurrent'));
            }

            //Set the cashbook previous series
            if (scope.settings.showCashbook && scope.settings.showPrevious) {
                scope.options.series = scope.options.series.concat(scope.setStyles( scope.calcValues(scope.chart[scope.settings.interval][scope.settings.type].cbPrevious.series) , 'cbPrevious'));
            }

            if (this.static) {
                var scope = this;
                this.options.legend.labelFormatter = function () {
                    if (scope.ui.dictionary.kpiCategories[this.name]) {
                        return scope.ui.dictionary.kpiCategories[this.name];
                    } else if (scope.ui.dictionary.systemKpis[this.name]) {
                        return scope.ui.dictionary.systemKpis[this.name];
                    }

                    return this.name;
                };
            }


            if (this.triggerDrilldown) {
                if (this.triggerDrilldown == '_fixedCostsSub') {
                    var series = this.options.series[2];
                    var sIndex = 2;
                } else {
                    var series = this.options.series[3];
                    var sIndex = 3;
                }
            }
        },


        plotValidLedgerLine : function (skipRender) {
            if (ValidLedgerModel.getValidDate()) {
                this.options.xAxis.plotLines[0].value = this.options.xAxis.categories.indexOf( this.formatDateCategory(ValidLedgerModel.getValidDate(), this.settings.interval) );
                this.options.xAxis.plotLines[0].label.text = this.ui.dictionary.overview.validLedger;
            } else {
                this.options.xAxis.plotLines[0].value = -1;
                this.options.xAxis.plotLines[0].label.text = '';
            }

            if (!skipRender) {
                setTimeout(function () {
                    this.render(true);
                }.bind(this), 500);
            }
        },


        formatDateCategory : function (label, interval) {
            var date = new moment(label);

            if (interval == 'half-year') {
                var tempDate = date.format('Q');

                if (tempDate > 2) {
                    return date.format(this.ui.dictionary.locale.intervals['half-year-2']);
                } else {
                    return date.format(this.ui.dictionary.locale.intervals['half-year-1']);
                }
            } else {
                return date.format(this.ui.dictionary.locale.intervals[interval]);
            }
        },

        formatCategories : function(categories, interval) {
            var formattedLabels = [];

            categories.forEach(function(label) {
                var date;
                var half = 0;

                if (interval == 'half-year' && label.indexOf('1st') > 0) {
                    date = new moment(label, this.intervalFormats['half-year-1']);
                    half = 1;
                } else if (interval == 'half-year' && label.indexOf('2nd') > 0) {
                    date = new moment(label, this.intervalFormats['half-year-2']);
                    half = 2;
                } else {
                    date = new moment(label, this.intervalFormats[interval]);
                }

                var formattedLabel = '';

                if (interval == 'half-year') {
                    if (half == 1) {
                        formattedLabel = date.format(this.ui.dictionary.locale.intervals['half-year-1']);
                    } else if (half == 2) {
                        formattedLabel = date.format(this.ui.dictionary.locale.intervals['half-year-2']);
                    }
                } else {
                    formattedLabel = date.format(this.ui.dictionary.locale.intervals[interval]);
                }

                formattedLabels.push(formattedLabel);
            }, this);


            return formattedLabels;
        },



        translateCurrency : function(string) {
            if (this.presetStaticType) {
                var staticString = this.presetStaticType;
                return staticString.replace('$', this.ui.dictionary.meta.symbol);
            }

            return string !== undefined ? string.replace('$', this.ui.dictionary.meta.symbol) : string;
        },


        inHideSeries : function(series) {
            var index = this.hideSeriesList.indexOf(series);

            if (index < 0) {
                return false;
            }

            return true;
        },


        addHideSeries : function(series) {
            this.hideSeriesList.push(series);
            if (this.drillDownCallback) {
                sessionStorage.setItem('series'+this.dashID, JSON.stringify(this.hideSeriesList));
            }

        },


        removeHideSeries : function(series) {
            var index = this.hideSeriesList.indexOf(series);
            if (index >= 0) {
                this.hideSeriesList.splice(index, 1);
                if (this.drillDownCallback) {
                    sessionStorage.setItem('series'+this.dashID, JSON.stringify(this.hideSeriesList));
                }
            }
        },


        triggerSingleSeriesActive : function () {
            // heck this part
            var index = 0;
            var series = null;
            this.options.series.forEach(function(s, i) {
                if (s.showInLegend && this.options.series[i].visible && !series) {
                    index = i;
                    series = this.options.series[i];
                }
            }.bind(this));

            if (!series) {
                index = 0;
                series = this.options.series[0];
            }

            this.showOnlySeries(series, index);
        },

        getUniqValues(items) {
           const output = [];
           const outputHasNot = item => output.findIndex(i => i.name === item.name) === -1;

            items.map(item => {
               if (outputHasNot(item)) {
                   output.push(item);
               }
           });
           return output;
        },

        translateSeries: function () {
            this.options.series.forEach((item) => {
                if (this.ui.dictionary.meta.code === 'en-US') {
                    if (item.name === 'Omsætning') {
                        item.name = 'Revenue';
                    } else if (item.name === 'Dækningsbidrag') {
                        item.name = 'Contribution Margin';
                    } else if (item.name === 'Faste omkostninger') {
                        item.name = 'Fixed Costs';
                    } else if (item.name === 'Andre') {
                        item.name = 'Other';
                    } else if (item.name === 'Profit') {
                        item.name = 'Profit';
                    } else {
                    }
                } else {
                        if (item.name === 'Revenue') {
                            item.name = 'Omsætning';
                        } else if (item.name === 'Contribution Margin') {
                            item.name = 'Dækningsbidrag';
                        } else if (item.name === 'Fixed Costs') {
                            item.name = 'Faste omkostninger';
                        } else if (item.name === 'Other') {
                            item.name = 'Andre';
                        } else if (item.name === 'Profit') {
                            item.name = 'Profit';
                        } else {
                        }
                }
            })
        }
    };

    const computed = {
        isUnderEditPresentation() {
            return this.$store.getters.presentationEditMode;
        },

    };

    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        components : {
            'tutorial-slide' : tutorialSlide
        },
        props : ['chart', 'static', 'staticSeries', 'types', 'interval', 'cashbook', 'init', 'reinit', 'type', 'average', 'previous', 'previousType', 'budget', 'floatingAverage', 'pointSpread', 'doRefresh', 'percentMultiply', 'dashID', 'drillDownCallback', 'drilldownName', 'isDrilldown', 'closeDrilldownCallback', 'cashbookOnly', 'graphType', 'allowInversion', 'chartInfoFlag', 'processChartInfo', 'presetStaticType', 'triggerDrilldown'],
        beforeUpdate  : function() {
            if (this.chartObject.series.length > 0) {
                this.chartObject.series.sort(this.dynamicSort("name"));
            }
            if (this.isUnderEditPresentation && this.options.series.length) {
                this.translateSeries();
            }
        },
        computed,
        watch : {
            previousType(val) {
                this.settings.previousType = val;
            },
            chartInfoFlag : function (val, oldVal) {
                this.processChartInfo({
                    series : [...this.options.series],
                    hidden : this.hideSeriesList,
                    type : this.type === 'DKK' || this.type === '$' ? null : this.type
                }, this.isDrilldown);
            },
            graphType : function (gt) {
                if (gt == 'column') {
                    this.triggerSingleSeriesActive();
                }
                this.render();
            },

            types : function(types) {
                if (types.length !== 0) {
                    this.settings.type = types[0];
                }

                this.ui.loading = false;
            },

            type : function(type) {
                if (type) {
                    this.settings.type = type;
                    this.render();
                }

                this.ui.loading = false;

                if (this.tutorial.state.started && !this.closeDrilldownCallback) {
                    setTimeout(function() {
                        this.ui.showTutorial = true;
                    }.bind(this), 100);
                }
            },

            interval : function(interval) {
                if (interval !== undefined) {
                    this.settings.interval = interval;
                    this.render();
                }
            },

            cashbook : function(cashbook) {
                if (cashbook !== undefined) {
                    this.settings.showCashbook = cashbook;
                    this.render();
                }
            },

            cashbookOnly : function(cashbookOnly) {
                if (cashbookOnly !== undefined) {
                    this.settings.showCashbookOnly = cashbookOnly;
                    this.settings.showCashbookOnly ? this.settings.showCashbook = false : '';
                    this.render();
                }
            },

            init : function(init) {
                var scope = this;
                this.ui.dictionary = DictionaryModel.getHash();

                if (init) {
                    setTimeout(function() {
                        scope.initialize();
                        scope.render();
                    }, 100);

                }
            },

            reinit : function(init) {
                var scope = this;

                if (init) {
                    setTimeout(function() {
                        //scope.initialize();
                        scope.render();
                    }, 100);
                }
            },

            average : function(avg) {
                if (avg !== undefined) {
                    this.settings.showAverage = avg;
                    this.render();
                }
            },

            previous : function(prev) {
                if (prev !== undefined) {
                    this.settings.showPrevious = prev;
                    this.render();
                }
            },

            budget : function(budg) {
                if (budg !== undefined) {
                    this.settings.showBudget = budg;
                    this.render();
                }
            },

            floatingAverage : function(fa) {
                if (fa !== undefined) {
                    this.settings.showFA = fa;
                    this.render();
                }
            },

            pointSpread : function(ps) {
                if (ps !== undefined) {
                    this.settings.faSpread = ps;
                    this.render();
                }
            },

            doRefresh : function() {
                this.refresh();
            },
            'ui.loading' : function(loading) {
                if (!this.chartObject.series) {
                    return false;
                }

                if (loading) {
                    this.chartObject.showLoading(this.ui.dictionary.drilldown.loading);
                } else {
                    this.chartObject.hideLoading();
                }
            }
        },

        mounted : function () {
            this.initFormatters();
            this.initialize();
            this.render();
        },

        created : function() {
            this.generalInit();
        }
    });
});
