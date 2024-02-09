define([
    'Vue',
    'elements/kpi-editor',
    'elements/modals/modal',
    'services/EventBus'
], function (Vue, kpiEditor, modal, EventBus) {
    const template = `
        <modal :close="close" class="no-header">                                    
            <template v-slot:content>
                <div  v-on:click="close()" class="close" style="position: absolute; right: 25px; top: 10px;"><i class="cwi-close"></i></div>
                <kpi-editor :callback="addKpi"></kpi-editor>         
            </template>                                                       
        </modal>
    `;

    const methods = {
        close() {
            this.$emit('close');
        }
    };

    return Vue.extend({
        name: 'add-new-kpi',
        template,
        methods,
        props: {
            addKpi: {
                type: Function,
                required: true
            }
        },
        components: {
            modal,
            'kpi-editor': kpiEditor
        },
        mounted: function() {
            EventBus.$on('closeKPI', (kpi) => {
                kpi ? this.close() : '';
            });
        },
    });
});
