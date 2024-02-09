define([
    'Vue',
    'elements/dropdown/custom-dropdown',
    'elements/dropdown/option',
    'constants/ui/intervals',
    'store/dashboardMutationTypes',
    'models/DictionaryModel',
], function(Vue, customDropdown, option, intervalOptions, dashboardMutationTypes, DictionaryModel) {
    'use strict';

    const {
        DAY,
        WEEK,
        MONTH,
        QUARTER,
        HALF_YEAR,
        YEAR
    } = intervalOptions;

    const template = `
        <custom-dropdown :options="options" v-slot="dropdownProps" @optionSelected="changeInterval" :defaultOption="defaultOption" :label="dictionary.overview.interval">
            <dropdown-option v-slot="optionProps" :option="interval" v-for="interval in dropdownProps.options" :key="interval.id" :selectOption="dropdownProps.selectOption" :isOptionSelected="interval.id === dropdownProps.selectedOption.id">
                <span v-show="getLoader && getLoader(optionProps.title)"><i class="cwi-cog animate-spin no-float" style="margin-top: -4px;"></i></span><span>{{interval.title}}</span>
            </dropdown-option>
        </custom-dropdown>
    `;

    const generateOption = (key, intervalsTranslations) => {
        return {
            id: key,
            title: intervalsTranslations[key]
        }
    };

    return Vue.extend({
        template,
        name: 'intervals-selector',
        props: {
            getLoader: {
                type: Function
            },
            intervalOptions: {
                type: Array,
                default: () => []
            }
        },
        data: function() {
            const dictionary = DictionaryModel.getHash();

            return {
                dictionary,
                defaultOption: generateOption(this.$store.getters.interval, dictionary.overview.intervals)
            }
        },
        components: {
            'custom-dropdown': customDropdown,
            'dropdown-option': option
        },
        methods: {
            changeInterval(interval) {
                this.$store.dispatch('setInterval', interval.id);
                this.closeAllOptions();
            }
        },
        computed: {
            disabledIntervals() {
                return this.$store.getters.getDisabledIntervals;
            },

            options() {
                const options = this.intervalOptions.map((key) => generateOption(key, this.dictionary.overview.intervals));
                return options.filter(intervalOption => this.disabledIntervals.indexOf(intervalOption.id) < 0);
            }
        }
    });
});
