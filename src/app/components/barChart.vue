<template>
    <article ref="chartarea">
       <div v-show="!easyview && showChartData">
            <div id="bar-chart"></div>
       </div>
       <div v-show="easyview && showChartData">
           <easy-view :icon="kpiImage" :kpi="kpi" :percent="percent"></easy-view>
       </div>
       <div v-show="!showChartData">
           <div class="no-data">
               {{ui.dictionary.overview.nodata}}
           </div>
       </div>
    </article>
</template>

<script>
    import Highcharts from 'Highcharts'
    import DictionaryModel from 'models/DictionaryModel'
    import AssetModel from 'models/AssetModel'
    import easyView from 'components/easyView.vue'
    import Config from 'services/Config'

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            showDiagnostics : false
        },
        chartObject : {},
        chartOptions : {
            chart : {
                animation: false,
                height: 222,
                type: 'bar'
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
                    animation : false,
                    states : {
                        hover : {
                            enabled : false
                        }
                    }
                }
            },
            series : [
                {
                    data : [{
                        name : 'first',
                        y : 0,
                        color : '#ffa630'
                    },{
                        name : 'second',
                        y : 0,
                        color: '#2fabff'
                    },{
                        name : 'third',
                        y : 0,
                        color : '#333333'
                    }],
                    maxPointWidth: 10,
                    borderRadius : 0,
                    threshold : 0
                }
            ],
            title : null,
            tooltip : {
                enabled : false
            },
            xAxis : {
                tickLength : 0,
                title : {
                    text : null
                },
                labels : {
                    enabled : false
                },
                lineWidth: 0
            },
            yAxis : {
                endOnTick : true,
                tickPositions: [0],
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

        fillPercent : 80,
        fillPositive : true,
        kpiImage : 'activity.png',
        showChartData : true,
        tickIntervals : [10000000, 1000000, 100000, 10000, 1000, 100, 50, 20, 10, 5, 1]
    });


    const methods = {
        init() {
            var scope = this;

            if (!this.kpi) {
                this.showChartData = false;
                return false;
            }

            if (this.orientation && this.orientation == 'vertical') {
                this.chartOptions.chart.type = 'column';
            }

            if (this.percent) {
                this.kpi.rawKpi = Math.round(this.kpi.rawKpi * 10) / 10;
                this.kpi.rawPrevious = Math.round(this.kpi.rawPrevious * 10) / 10;
                this.kpi.rawAverage = Math.round(this.kpi.rawAverage * 10) / 10;
            } else {
                this.kpi.rawKpi = Math.round((this.kpi.rawKpi / 100) * 10) / 10;
                this.kpi.rawPrevious = Math.round((this.kpi.rawPrevious / 100) * 10) / 10;
                this.kpi.rawAverage = Math.round((this.kpi.rawAverage / 100) * 10) / 10;
            }

            this.chartOptions.yAxis.labels.format = '{value}' + this.kpi.unit.label;
            this.setAxisRange(this.kpi.rawKpi, this.kpi.rawPrevious, this.kpi.rawAverage);

            this.showChartData = true;
            this.setKpiValue();
            this.setAvgValue();
            this.setPrevValue();

            setTimeout(function() {
                scope.draw();
            }, 1);
        },


        setAxisRange(v1, v2, v3) {
            var axisTicks = [];
            var min = Math.min(v1, v2, v3);
            var max = Math.max(v1, v2, v3);
            var int = this.getIntervals(Math.abs(min), Math.abs(max));
            var floor = Math.floor(min / int) * int;
            var ciel = Math.ceil(max / int) * int;

            for (var i = floor; i <= ciel; i+= int) {
                axisTicks.push(i);
            }

            if (axisTicks.length === 0) {
                axisTicks.push(0);
            }

            this.chartOptions.yAxis.tickPositions = axisTicks;
        },

        getIntervals(min, max) {
            var num = Math.round(Math.max(min, max));
            var interval = null;

            this.tickIntervals.forEach(function (val) {
                if (num > (val - 1) && !interval) {
                    interval = val;
                }
            });

            return interval;
        },

        setKpiValue() {
            this.chartOptions.series[0].data[0].y = this.kpi.rawKpi;

            this.fillPositive = true;
            this.kpiImage = this.kpi.image;
            this.fillPercent = this.kpi.data.value;
        },


        setPrevValue() {
            this.chartOptions.series[0].data[1].y = this.kpi.rawPrevious;
        },


        setAvgValue() {
            this.chartOptions.series[0].data[2].y = this.kpi.rawAverage;
        },


        draw() {
            this.chartObject = Highcharts.chart(this.$refs.chartarea.querySelector('#bar-chart'), this.chartOptions);
        },

        getAsset(file) {
            return new AssetModel(file).path;
        },

        getFillerImage() {
            if (this.fillPositive) {
                return '/assets/img/easyview/filler-blue.png';
            }

            return '/assets/img/easyview/filler-red.png';
        },

        getKpiImage() {
            return '/assets/img/easyview/' + this.kpiImage;
        }
    };

    const computed = {
        easyview() {
            return this.$store.getters.easyview;
        }
    };

    export default {
        name: 'bar-chart',
        data,
        methods,
        props : ['kpi', 'orientation', 'percent'],
        computed,
        components : {
            'easy-view' : easyView
        },
        mounted() {
            this.init();
        },
        watch : {
            kpi(k) {
                this.init();
            }
        }
    };
</script>
