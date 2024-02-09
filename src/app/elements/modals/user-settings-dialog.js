define([
    'Vue',
    'elements/modals/modal',
    'elements/user-settings',
    'models/DictionaryModel',
], function (Vue, modal, userSettings, DictionaryModel) {
    const template = `
        <modal :title="dictionary.company.userSettings" :close="close">
               <template v-slot:content>
                  <user-settings :user="user" :callback="close"></user-settings>
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
            this.onClose();
        }
    };

    return Vue.extend({
        name: 'user-settings-dialog',
        template,
        data,
        methods,
        props: {
            user: {
                type: Object,
                required: true
            },
            onClose: {
                type: Function,
                default: () => {}
            }
        },
        components: {
            modal,
            'user-settings': userSettings
        },
        mounted: function() {},
    });
});
