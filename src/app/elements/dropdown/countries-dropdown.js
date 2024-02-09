define([
  'Vue',
  'elements/dropdown/custom-dropdown',
  'elements/dropdown/option',
  'models/DictionaryModel',
], function(Vue, customDropdown, option, DictionaryModel) {
  'use strict';

  const template = `
        <custom-dropdown :options="options" :dropdownClass="'selector fade'" v-slot="optionsProps" @optionSelected="changeCountry" :defaultOption="defaultCountry" :label="dictionary.general.labels.country">
            <dropdown-option :option="option" v-for="option in optionsProps.options" :key="option.id" :selectOption="optionsProps.selectOption" :isOptionSelected="option.id === optionsProps.selectedOption.id">
              <span>{{dictionary.countries[option.reference]}}</span>
            </dropdown-option>
        </custom-dropdown>
    `;


  return Vue.extend({
    template,
    name: 'country-selector',
    data: function() {
      return {
        dictionary: DictionaryModel.getHash(),
      }
    },
    props: {
      defaultCountryReference: {
        type: String,
        required: false
      }
    },
    components: {
      'custom-dropdown': customDropdown,
      'dropdown-option': option
    },
    mounted() {
      this.$store.dispatch('fetchCountries');
    },
    methods: {
      changeCountry(country) {
        this.$emit('countryChanged', country)
        this.closeAllOptions();
      },
      sortCountries(countries) {
        const list = countries.slice()
        const sortedList = [
          'denmark',
          'sweden',
          'norway',
          'germany',
          'other'
        ]

        return list.sort(function (a, b) {
          const ai = sortedList.indexOf(a.reference)
          const bi = sortedList.indexOf(b.reference)
          return ai>bi? 1 : (ai<bi ? -1 : 0)
        })
      },
    },
    computed: {
      options() {
        return this.sortCountries(this.$store.getters.countries);
      },
      defaultCountry() {
        if (this.defaultCountryReference && this.options) {
          return this.options.find( option => option.reference ===  this.defaultCountryReference)
        }
      }
    }
  });
});
