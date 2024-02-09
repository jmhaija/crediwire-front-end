<template>
    <article class="kpi-labels">
        <div class="value-container" :class="{ negative : colors.current.negative }">
           <div class="value" :style="{ borderColor : colors.current[kpi.kpi.name] }">
               <div v-if="current && current.self && current.self.aggregation && current.self.aggregation[kpi.kpi.name] !== undefined" class="number">{{formatNumber(current.self.aggregation[kpi.kpi.name], kpi.kpi.unit.label)}}</div>
               <div v-if="!current || !current.self || !current.self.aggregation || current.self.aggregation[kpi.kpi.name] === undefined" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>
               <div class="label">{{ui.dictionary.kpis.current}}</div>
           </div>
        </div>
        <div class="value-container" :class="{ negative : colors.previous.negative }">
           <div class="value" :style="{ borderColor : colors.previous[kpi.kpi.name] }">
               <div v-if="previous && previous.self && previous.self.aggregation && previous.self.aggregation[kpi.kpi.name]" class="number">{{formatNumber(previous.self.aggregation[kpi.kpi.name], kpi.kpi.unit.label)}}</div>
               <div v-if="!previous || !previous.self || !previous.self.aggregation || !previous.self.aggregation[kpi.kpi.name]" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>
               <div class="label">{{previousLabel}}</div>
           </div>
        </div>
        <div class="value-container" :class="{ negative : colors.average.negative }">
           <div class="value" :style="{ borderColor : colors.average[kpi.kpi.name] }">
               <div v-if="current && current.benchmark && current.benchmark.aggregation && current.benchmark.aggregation[kpi.kpi.name]" class="number">{{formatNumber(current.benchmark.aggregation[kpi.kpi.name], kpi.kpi.unit.label)}} <i v-show="current.benchmark.aggregation.benchmarkCount[kpi.kpi.name]" class="cwi-info tiny" :title="ui.dictionary.overview.sample + ': ' + current.benchmark.aggregation.benchmarkCount[kpi.kpi.name]"></i></div>
               <div v-if="!current || !current.benchmark || !current.benchmark.aggregation || !current.benchmark.aggregation[kpi.kpi.name]" class="number">-- <i class="cwi-info tiny" :title="ui.dictionary.overview.noKpi"></i></div>
               <div class="label">{{ui.dictionary.kpis.average}}</div>
           </div>
        </div>
    </article>
</template>

<script>
    import DictionaryModel from 'models/DictionaryModel'
    import ErpModel from 'models/ErpModel'

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash()
        }
    });

    const methods = {
        formatNumber(value, type) {
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
        }
    }

    const computed = {
        isLastPeriod() {
            return this.$store.getters.previousType === 'period';
        },
        previousLabel() {
            const {dictionary} = this.ui;
            if (this.budget) {
                return dictionary.kpis.budget;
            } else {
                return this.isLastPeriod ? dictionary.kpis.previous : dictionary.kpis.lastYear;
            }
        }
    };

    export default {
        data,
        methods,
        computed,
        props : ['kpi', 'rawdata', 'colors', 'current', 'previous', 'budget']
    }
</script>
