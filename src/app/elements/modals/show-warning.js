    import Vue from 'Vue'
    import moment from 'moment'
    import modal from 'elements/modals/modal'
    import DictionaryModel from 'models/DictionaryModel'
    import warningSettings from 'components/warningSettings.vue'

    const template = `
        <modal :close="close" class="no-header">  
            <template v-slot:content>
                <warning-settings :warnings="currentWarnings" :connection="currentConnection"></warning-settings>
            </template>   
            <template v-slot:footer>
                <div class="close zero-padding single-footer-btn"><button class="primary" v-on:click="close()">{{ui.dictionary.general.ok}}</button></div>
            </template>                                                    
        </modal>
    `;

    const data = () => ({
        ui: {
            dictionary: DictionaryModel.getHash()
        }
    });

    const methods = {
        close() {
            this.$emit('close');
        },
    };

    export default Vue.extend({
        name: 'show-warning',
        template,
        data,
        methods,
        props: {
            currentWarnings: {},
            currentConnection: {}
        },
        components: {
            modal,
            'warning-settings' : warningSettings
        }
    });
