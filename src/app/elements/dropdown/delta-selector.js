define([
  'Vue',
  'elements/dropdown/custom-dropdown',
  'elements/dropdown/option',
  'store/dashboardMutationTypes',
  'models/DictionaryModel',
], function(Vue, customDropdown, option, dashboardMutationTypes, DictionaryModel) {
  'use strict';

  const template = `
        <custom-dropdown :options="deltaOptions" v-slot="optionsProps" @optionSelected="changeDelta" :defaultOption="defaultOption" :label="'Delta'">
            <dropdown-option v-slot="{title}" :option="deltaOption" v-for="deltaOption in optionsProps.options" :key="deltaOption.id" :selectOption="optionsProps.selectOption" :isOptionSelected="deltaOption.id === optionsProps.selectedOption.id">
              <span>{{deltaOption.title}}</span>
            </dropdown-option>
        </custom-dropdown>
    `;


  return Vue.extend({
    template,
    name: 'delta-selector',
    data: function() {
      const dictionary = DictionaryModel.getHash();

      return {
        dictionary,
        deltaOptions: [
          {
            title: dictionary.meta.nominal,
            id: 'nominal'
          },
          {
            title: '%',
            id: '%'
          },
          {
            title: 'x',
            id: 'x'
          },
        ]
      }
    },
    components: {
      'custom-dropdown': customDropdown,

      'dropdown-option': option
    },
    methods: {
      changeDelta(delta) {
        this.$emit('deltaChanged', delta.id)
        this.closeAllOptions();
      }
    },
    computed: {
      defaultOption() {
        return {
          title: this.dictionary.meta.nominal,
          key: 'nominal'
        }
      },
    }
  });
});
