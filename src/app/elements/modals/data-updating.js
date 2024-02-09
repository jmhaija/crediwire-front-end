define([
    'Vue',
    'moment',
    'elements/modals/modal',
    'models/DictionaryModel'
], function (Vue, moment, modal, DictionaryModel) {
    const template = `
        <modal :title="ui.dictionary.company.updating.title" :close="close">                                        
            <template v-slot:content>
                <p class="double-space justify">{{ui.dictionary.accounts.updatingData}}</p>
            </template>
                    
            <template v-slot:footer>
                <div class="alignment-buttons-footer">
                    <div class="center-text"><a class="button primary" v-on:click="close()">{{ui.dictionary.erp.economic.ok}}</a></div>
                </div>
            </template>                                  
        </modal>
    `;


    const data = function () {
        return {
            ui: {
                dictionary: DictionaryModel.getHash(),
            },
        };
    };

    const methods = {
        close() {
            this.$emit('close');
        },
    };

    return Vue.extend({
        name: 'economic-confirmation',
        template,
        data,
        methods,
        components: {
            modal
        },
        created: function () {},
        mounted: function() {},
    });
});
