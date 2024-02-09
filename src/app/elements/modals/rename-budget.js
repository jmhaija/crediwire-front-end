define([
  'Vue',
  'moment',
  'elements/modals/modal',
  'models/DictionaryModel',
], function (Vue, moment, modal, DictionaryModel) {
  const template = `
        <modal :title="dictionary.budget.rename" :close="close">                                        
            <template v-slot:content>
            <div class="input-field">
                <input type="text" v-model="newName">
            </div>                
            </template>  
            <template v-slot:footer>
                <section class="invitation-add">
                    <div class="float-right zero-padding">
                        <button class="primary" v-on:click="function() {renameBudgetVersion(newName); close();}">{{dictionary.budget.rename}}</button>
                    </div>
                </section>
            </template>                                                         
        </modal>
    `;


  const data = function () {
    return {
      dictionary: DictionaryModel.getHash(),
      newName: this.budget.name
    };
  };

  const methods = {
    close() {
      this.$emit('close');
    }
  };

  return Vue.extend({
    name: 'rename-budget',
    template,
    data,
    methods,
    props: ['budget', 'renameBudgetVersion'],
    components: {
      modal
    },
  });
});
