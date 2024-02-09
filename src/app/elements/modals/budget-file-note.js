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
                <input type="text" v-model="label">
            </div>                
            </template>  
            <template v-slot:footer>
                <section class="invitation-add">
                    <div class="float-right zero-padding">
                        <button class="primary" v-on:click="function() {addBudgetFileNote(label); closeModal();}">{{dictionary.budget.rename}}</button>
                    </div>
                </section>
            </template>                                                         
        </modal>
    `;


    const data = function () {
        return {
            dictionary: DictionaryModel.getHash(),
            label: this.budget.note
        };
    };

    const methods = {
        close() {
            this.$emit('close');
        },

        closeModal() {
            if(this.label) {
                this.close();
            }
        }
    };

    return Vue.extend({
        name: 'budget-file-note',
        template,
        data,
        methods,
        props: ['budget', 'addBudgetFileNote'],
        components: {
            modal
        },
    });
});
