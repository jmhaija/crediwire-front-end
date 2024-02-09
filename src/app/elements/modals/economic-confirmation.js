define([
    'Vue',
    'moment',
    'elements/modals/modal',
    'models/DictionaryModel',
    'mixins/companyErpMixin'
], function (Vue, moment, modal, DictionaryModel, companyErpMixin) {
    const template = `
        <modal :title="ui.dictionary.erp.title" :close="close">
            <template v-slot:content>
                <p class="double-space justify">{{ui.dictionary.erp.economic.confirm}} <a class="underlined" :href="ui.dictionary.meta.tosUrl" target="_blank">{{ui.dictionary.erp.economic.terms}}</a></p>
            </template>
            <template v-slot:footer>
                <div class="alignment-buttons-footer">
                    <div class="center-text"><a href="" v-on:click.prevent="close();">{{ui.dictionary.erp.economic.cancel}}</a></div>
                    <div class="center-text"><a
                        data-test-id="connectConfirmButton"
                        class="button primary"
                        v-on:click="close();attachSessionListener(erpUrl); return false;"
                    >{{ui.dictionary.erp.economic.ok}}</a></div>
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
        props: ['erpUrl', 'getErpCheckStatus', 'completedCallback', 'noredirect'],
        methods,
        mixins: [companyErpMixin],
        components: {
            modal
        },
        created: function () {},
        mounted: function() {},
    });
});
