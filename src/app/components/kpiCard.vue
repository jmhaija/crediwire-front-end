<template>
    <article class="kpi-card with-drill-down">
       <div class="heading">{{translateKpi(kpi.kpi.name)}} <i class="cwi-info custom-kpi-description-icon" v-show="kpi.kpi.description || hasDescription(kpi.kpi.name)"  v-on:click="toggleTooltip()"></i> <div class="tooltip" :class="{ open : tooltip }">{{translateCustomDefinition(kpi)}}</div></div>

       <div class="pie-chart-area">
           <bar-chart :kpi="getKpiObject(kpi.kpi)" :easyview="easyview" :orientation="getOrientation(kpi.kpi.unit.label)" :percent="false"></bar-chart>
       </div>

       <kpi-labels :kpi="kpi" :current="rawdata[currentType]" :previous="rawdata[previousType]" :budget="budget" :colors="colors" :currentType="currentType" :previousType="previousType"></kpi-labels>

       <section class="drilldown" :class="{ show : ui.showDrilldown }">
           <div class="trigger" v-show="!ui.showDrilldown" v-on:click="getDrilldownData(kpi.kpi)">{{ui.dictionary.drilldown.show}}</div>
           <div class="trigger" v-show="ui.showDrilldown" v-on:click="ui.showDrilldown = false">{{ui.dictionary.drilldown.hide}}</div>
           <div class="drilldown-container">
               <div class="center-text" v-show="!drilldown.current">
                   <div class="working inline"></div>
               </div>

               <div v-if="drilldown.current && drilldown[currentType].self && drilldown[currentType].self.aggregation && drilldown[currentType].self.aggregation.mappings">
                   <div v-for="(dd, index) in drilldown[currentType].self.aggregation.mappings">
                       <div class="dd-name" :class="{ first : index == 0 }">{{translateKpi(dd.name)}}</div>
                           <drilldown-labels :current="drilldown[currentType].self.aggregation.mappings[index].value" :previous="drilldown[previousType].self.aggregation.mappings[index].value" :average="false" :label="kpi.kpi.unit.label"></drilldown-labels>
                       </div>
                   </div>

               <div class="center-text faded" v-if="drilldown.current && (!drilldown.current.self || !drilldown.current.self.aggregation || !drilldown.current.self.aggregation.mappings)">
                   <em>{{ui.dictionary.drilldown.noData}}</em>
               </div>

           </div>
       </section>
    </article>
</template>

<script>
    import DictionaryModel from 'models/DictionaryModel'
    import KpiModel from 'models/KpiModel'
    import ErpModel from 'models/ErpModel'
    import pieChart from 'components/pieChart.vue'
    import barChart from 'components/barChart.vue'
    import kpiLabels from 'components/kpiLabels.vue'
    import drilldownLabels from 'elements/drilldown-labels'
    import Config from 'services/Config'

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            showDrilldown : false
        },
        tooltip : false,
        colors : {
            current : {},
            previous : {},
            average : {}
        },
        drilldown : {}
    });


    const methods = {
        getOrientation(label) {
            if (label == '%') {
                return 'horizontal';
            }

            return 'vertical';
        },

        getIsPercent(label) {
            return label == '%';
        },

        getDrilldownData(kpi) {
            var scope = this;

            scope.ui.showDrilldown = true;

            if (this.drilldown.current) {
                return false;
            }

            var km = new KpiModel(kpi.id);
            km.getData()
                .then(function(res) {
                    if (res.contents) {
                        scope.drilldown = res.contents;
                    } else {
                        scope.drilldown = {
                            current : {}
                        };
                    }
                });
        },

        translateKpi(key) {
            if (this.easyview && this.ui.dictionary.kpis.easyview[key]) {
                return this.ui.dictionary.kpis.easyview[key];
            } else if (this.ui.dictionary.systemKpis[key]) {
                return this.ui.dictionary.systemKpis[key];
            } else if (this.ui.dictionary.kpis[key]) {
                return this.ui.dictionary.kpis[key];
            }

            return key;
        },

        translateDefinition(key) {
            if (this.easyview && this.ui.dictionary.kpis.def.easyview[key]) {
                return this.ui.dictionary.kpis.def.easyview[key];
            } else if (this.ui.dictionary.kpis.def[key]) {
                return this.ui.dictionary.kpis.def[key];
            }

            return key;
        },

        translateCustomDefinition(kpi) {
            if (kpi.kpi.description) {
                return kpi.kpi.description;
            }

            return this.translateDefinition(kpi.kpi.name);
        },

        hasDescription(key) {
            if (this.ui.dictionary.kpis.def[key]) {
                return true;
            }

            return false;
        },

        toggleTooltip() {
            if (this.tooltip) {
                this.tooltip = false;
            } else {
                this.tooltip = true;
            }
        },

        getKpiObject(kpi) {
            if (!this.rawdata[this.currentType] || !this.rawdata[this.currentType].self || !this.rawdata[this.currentType].self.aggregation || this.rawdata[this.currentType].self.aggregation[kpi.name] === undefined) {
                return false;
            }

            var rawValue = this.rawdata[this.currentType].self.aggregation[kpi.name];
            var image = kpi.symbol || 'profit.png';
            var inverse = kpi.expectPositive !== undefined ? !kpi.expectPositive : false;
            var overhead = kpi.overheadType !== undefined ? kpi.overheadType : false; //Special type of flag for overhead margin pie chart displays
            var average = 0;
            var previous = 0;


            if (this.rawdata[this.currentType] && this.rawdata[this.currentType].benchmark && this.rawdata[this.currentType].benchmark.aggregation && this.rawdata[this.currentType].benchmark.aggregation[kpi.name]) {
                average = this.rawdata[this.currentType].benchmark.aggregation[kpi.name];
            }

            if (this.rawdata[this.previousType] && this.rawdata[this.previousType].self && this.rawdata[this.previousType].self.aggregation && this.rawdata[this.previousType].self.aggregation[kpi.name]) {
                previous =  this.rawdata[this.previousType].self.aggregation[kpi.name];
            }

            return this.calcValues(kpi.name, rawValue, average, previous, inverse, image, overhead, kpi.unit);
        },

        calcValues(name, rawKpi, rawAverage, rawPrevious, inverse, image, overhead, unit) {
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
                    this.colors.average.negative = true;
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
                if (dataObj.previous.negative || dataObj.previous.forceRed) {
                    this.colors.previous.negative = true;
                }
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
                } else if (overhead && kpi > benchmark) {
                    dataObj.data.forceRed = !dataObj.data.forceRed;
                }


                //Colors
                this.colors.current[name] = '#ffa630';
                if (dataObj.data.negative || dataObj.data.forceRed) {
                    this.colors.current.negative = true;
                }
            }

            if (this.readyCallback) {
                this.readyCallback();
            }

            dataObj.benchmark = benchmark;

            return dataObj;
        }
    };

    export default {
        name: 'kpi-card',
        data,
        methods,
        props : ['kpi', 'rawdata', 'easyview', 'currentType', 'previousType', 'budget', 'readyCallback'],
        components : {
            'pie-chart' : pieChart,
            'bar-chart' : barChart,
            'kpi-labels' : kpiLabels,
            'drilldown-labels' : drilldownLabels
        },
        watch : {
            rawdata(value) {
                this.drilldown = {};
                this.ui.showDrilldown = false;
            }
        }
    };
</script>
