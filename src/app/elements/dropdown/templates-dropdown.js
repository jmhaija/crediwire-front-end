define([
  'Vue',
  'elements/dropdown/custom-dropdown',
  'elements/dropdown/option',
  'store/dashboardMutationTypes',
  'models/DictionaryModel',
], function(Vue, customDropdown, option, dashboardMutationTypes, DictionaryModel) {
  'use strict';

  const template = `
        <custom-dropdown class="full-width templates-dropdown" :options="filteredTemplates" v-slot="optionsProps" :defaultOption="defaultOption" @optionSelected="selectTemplate" :label="dictionary.presentations.selectATemplate" :dropdownClass="'selector'">
            <div :class="{ 'over-scroll' :  isCreateReport }">
                <div class="search input-field no-margins no-padding">
                    <label v-bind:class="{ filled: filterString.length > 0 }">{{dictionary.presentations.reportName}}</label>
                    <input id="search-field" type="text" v-model="filterString" @click.stop.prevent="function() {}">
                </div>
                <div>
                    <dropdown-option :option="templateOption" v-for="templateOption in optionsProps.options" :key="templateOption.id" :selectOption="optionsProps.selectOption" :isOptionSelected="templateOption.id === optionsProps.selectedOption.id">
                        <span>{{templateOption.name}}</span>
                    </dropdown-option>                    
                </div>              
            </div>
        </custom-dropdown>
    `;

  return Vue.extend({
    template,
    name: 'templates-selector',
    props: ['templates', 'defaultOption'],
    data: function() {
      const dictionary = DictionaryModel.getHash();
      return {
        dictionary,
        filterString: ''
      }
    },
    computed: {
      filteredTemplates() {
        if (this.filterString.length > 1) {
          return this.templates.filter(template => template.name.toLowerCase().indexOf(this.filterString.toLowerCase()) >= 0)
        }

        return this.templates;
      },

      isCreateReport() {
        return this.$route.fullPath === '/account/overview/makeclientreport';
      }
    },
    components: {
      'custom-dropdown': customDropdown,
      'dropdown-option': option
    },
    methods: {
      selectTemplate(template) {
        this.$emit('templateSelected', template);
        this.closeAllOptions();
      }
    },
  });
});
