define([
    'Vue',
    'views/LedgerView',
    'elements/modals/modal',
], function (Vue, LedgerView, modal) {
    const template = `
        <modal :close="close" class="no-header">                                        
            <template v-slot:content>
                    <span class="beta-tag" style="float : left;">beta</span>
                    <ledger-view :account="ledgerAccount"></ledger-view>            
                    <div  v-on:click="close" class="close" style="position: absolute; right: 25px; top: 10px;"><i class="cwi-close"></i></div>
            </template>                                                       
        </modal>
    `;

    const methods = {
        close() {
            this.$emit('close');
        }
    };

    return Vue.extend({
        name: 'ledger-modal',
        template,
        methods,
        props: ['ledgerAccount'],
        components: {
            modal,
            'ledger-view': LedgerView
        }
    });
});
