<template>
    <article ref="chartarea">
       <div v-show="!easyview && showChartData">
           <div id="pie-chart"></div>
       </div>
       <div v-show="easyview && showChartData">
           <div class="easyview-background" :style="'background-size: 100% ' + fillPercent + '%; background-image: url(' + getAsset(getFillerImage()) + ')'">
               <img :src="getAsset(getKpiImage())">
           </div>
       </div>
       <div v-show="!showChartData">
           <div class="no-data">
               {{ui.dictionary.overview.nodata}}
           </div>
       </div>
       <div v-show="ui.showDiagnostics">
           <table>
               <tr><td>Outer ring values</td><td>{{chartOptions.series[0].data}}</td></tr>
               <tr><td>Middle ring values</td><td>{{chartOptions.series[1].data}}</td></tr>
               <tr><td>Inner ring values</td><td>{{chartOptions.series[2].data}}</td></tr>
           </table>
       </div>
    </article>
</template>

<script>
    import Highcharts from 'Highcharts'
    import DictionaryModel from 'models/DictionaryModel'
    import AssetModel from 'models/AssetModel'
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
                spacing: [0, 0, 0, 0],
                height: 222
            },
            credits : {
                enabled : false
            },
            legend : {
                enabled : false
            },
            plotOptions : {
                pie : {
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
                    type: 'pie',
                    data : [0, 100],
                    colors : ['#52cd9f', '#cccccc'],
                    size: '100%',
                    innerSize : '94%'
                },

                {
                    type : 'pie',
                    data : [0, 100],
                    colors : ['#8eecca', '#cccccc'],
                    size: '85%',
                    innerSize : '93%'
                },

                {
                    type : 'pie',
                    data : [0, 100],
                    colors : ['#c0f4e1', '#cccccc'],
                    size: '65%',
                    innerSize : '92%'
                },
            ],
            title : null,
            tooltip : {
                enabled : false
            }
        },

        fillPercent : 80,
        fillPositive : true,
        kpiImage : 'activity.png',
        showChartData : true
    });

    const methods = {
        init() {
            var scope = this;

            if (!this.kpi) {
                this.showChartData = false;
                return false;
            }

            this.showChartData = true;
            this.setKpiValue();
            this.setAvgValue();
            this.setPrevValue();

            setTimeout(function() {
                scope.draw();
            }, 1);
        },


        setKpiValue() {
            this.chartOptions.series[0].data[0] = this.kpi.data.value;
            this.chartOptions.series[0].data[1] = this.kpi.data.delta;
            this.chartOptions.series[0].colors = ['#ffa630', '#cccccc'];
            this.fillPositive = true;

            this.kpiImage = this.kpi.image;
            this.fillPercent = this.kpi.data.value;
        },


        setPrevValue() {
            this.chartOptions.series[1].data[0] = this.kpi.previous.value;
            this.chartOptions.series[1].data[1] = this.kpi.previous.delta;
            this.chartOptions.series[1].colors = ['#2fabff', '#cccccc'];
        },


        setAvgValue() {
            this.chartOptions.series[2].data[0] = this.kpi.average.value;
            this.chartOptions.series[2].data[1] = this.kpi.average.delta;
            this.chartOptions.series[2].colors = ['#2fabff', '#cccccc'];
        },


        draw() {
            this.chartObject = Highcharts.chart(this.$refs.chartarea.querySelector('#pie-chart'), this.chartOptions);
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

    export default {
        data,
        methods,
        props : ['kpi', 'easyview'],
        mounted() {
            this.init();
        },
        watch : {
            easyview(ev) {
                if (!ev && window.dispatchEvent) {
                    window.dispatchEvent(new Event('resize'));
                }
            },

            kpi(k) {
                this.init();
            }
        }
    }
</script>
