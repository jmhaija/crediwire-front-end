    import Vue from 'Vue'
    import modal from 'elements/modals/modal'
    import DictionaryModel from 'models/DictionaryModel'
    import EventBus from 'services/EventBus'

    const template = `
        <modal :title="ui.dictionary.invitations.confirm" :close="close">                                        
            <template v-slot:content>
                <p>{{ui.dictionary.invitations.confirmChangeEmails}}</p>
            </template>        
            
            <template v-slot:footer>
                <div class="alignment-buttons-footer">
                    <div><a href="" v-on:click.prevent="close();">{{ui.dictionary.invitations.noChange}}</a></div>
                    <button class="primary" v-on:click="changeReminderEmails(newEmail, true)" v-show="!ui.saving" v-handle-enter-press="function() { changeReminderEmails(newEmail, true); }">{{ui.dictionary.invitations.yesChange}}</button>
                    <div class="float-right working inline" v-show="ui.saving"></div>
                </div>
            </template>                                            
        </modal>
    `;


    const data = () => ({
        ui: {
            dictionary: DictionaryModel.getHash(),
            saving: false
        }
    });

    const methods = {
        changeReminderEmails(newEmail, params) {
            this.ui.saving = true;
            EventBus.$emit('changeEmailConfirm', {email:newEmail, params: params});
            this.ui.saving = false;
            this.close();
        },

        close() {
            this.$emit('close');
        }
    };

    export default Vue.extend({
        name: 'resend-confirm',
        template,
        data,
        methods,
        components: {
            modal
        },
        props: ['newEmail']
    });
