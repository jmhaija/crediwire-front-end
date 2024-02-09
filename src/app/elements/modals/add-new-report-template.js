define([
  'Vue',
  'elements/modals/modal',
  'services/Validator',
  'models/DictionaryModel'
], function (Vue, modal, Validator, DictionaryModel) {
  const template = `
        <modal :close="close" :title="dictionary.presentations.saveAsTemplate">                                    
            <template v-slot:content>
                <section class="input-field">
                    <input type="text" v-model="name.value" v-bind:class="{ invalid : !name.valid || name.error }">                   
                    <label v-bind:class="{ filled: name.value }">{{dictionary.presentations.reportName}}</label>
                    <div class="warning" v-bind:class="{ show : !name.valid }">{{dictionary.general.validation.generic}}</div>
                </section>   
            </template>
            
            <template v-slot:footer>
                <div class="buttons-container zero-padding-top zero-padding-bottom">
                    <div class="zero-padding"><a href="" v-on:click.prevent="close">{{dictionary.warnings.cancel}}</a></div>
                    <div class="zero-padding"><button class="primary" @click="addTemplate(report); close()" v-handle-enter-press="function() {addTemplate(); close();}">{{dictionary.presentations.saveAsTemplate}}</button></div>
                </div>
            </template>                                                       
        </modal>
    `;

  const data = function() {
    return {
      name: {
        value: '',
        error: false,
        valid: true,
      },
      dictionary: DictionaryModel.getHash()
    }
  };

  const methods = {
    addTemplate(report) {
      this.addReportTemplate(Object.assign({}, report, {name: this.name.value}));
      this.close();
    },
    close() {
      this.$emit('close');
    }
  };

  return Vue.extend({
    name: 'save-as-report-template',
    data,
    template,
    methods,
    props: {
      addReportTemplate: {
        type: Function,
        required: true
      },
      report: {
        type: Object,
        required: true
      }
    },
    components: {
      modal,
    },
    created: function () {
      // console.log('created');
    },
    mounted: function() {

    },
    watch: {
      'name.value': function(val) {
        this.name.valid = Validator.minLength(val, 2);
      }
    }
  });
});
