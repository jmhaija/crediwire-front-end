define([
    'Vue',
    'models/DictionaryModel',
    'models/AssetModel',
    'elements/modals/modal',
], function (Vue, DictionaryModel, AssetModel, modal) {
    const template = `
        <modal :close="close" :title="dictionary.vatApproval.areYouSure">
            <template v-slot:content>
                <div>{{dictionary.vatApproval.approveWarning}}</div>
            </template>
            <template v-slot:footer>
                <div class="alignment-buttons-footer" style="padding: 0 10px !important;">
                    <button
                        class="accent left"
                        v-on:click.prevent="close();
                        declineCallback();"
                    >{{dictionary.vatApproval.takeMeBack}}</button>
                    <button
                        data-test-id="confirmApproveVatInfoButton"
                        class="primary right"
                        v-on:click.prevent="close();
                        confirmCallback();"
                    >{{dictionary.vatApproval.approveInfo}}</button>
                </div>
            </template>
        </modal>
    `;

    const data = function () {
        return {
            dictionary: DictionaryModel.getHash(),
        };
    };

    const methods = {
        close() {
            this.$emit('close');
        },
    };

    return Vue.extend({
        name: 'economic-managed-account',
        data,
        template,
        methods,
        props: {
            confirmCallback: {
                type: Function,
                required: true
            },
            declineCallback: {
                type: Function,
                required: true
            }
        },
        components: {
            modal
        },
        mounted: function() {},
    });
});
