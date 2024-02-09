    import Vue from 'Vue'
    import modal from 'elements/modals/modal'
    import DictionaryModel from 'models/DictionaryModel'
    import Validator from 'services/Validator'
    import InvitationEmailModel from 'models/InvitationEmailModel'

    const template = `
        <modal :title="ui.dictionary.invitations.remindersConfirm" :close="close">                                        
            <template v-slot:content>
                <div class="input-field">
                    <input type="text" v-model="fields.email.value" v-bind:class="{ invalid : !fields.email.valid || fields.email.error }" v-on:keyup="validateEmail();" v-on:blur="validateEmail(true)">
                    <label v-bind:class="{ filled: fields.email.value }">{{ui.dictionary.invitations.email}}</label>
                    <div class="warning" v-bind:class="{ show : !fields.email.valid }">{{ui.dictionary.general.validation.email}}</div>
                    <div class="warning" v-bind:class="{ show : fields.email.error }">{{ui.dictionary.invitations.exists}}</div>
                </div>
            </template>        
            
            <template v-slot:footer>
            <div class="alignment-buttons-footer">
                <div><a href="" v-on:click.prevent="declineResend()">{{ui.dictionary.invitations.decline}}</a></div>
                <button class="primary" v-show="!ui.saving" type="submit" @click.prevent="resendReminders(true)" v-handle-enter-press="function() { resendReminders(true); }">{{ui.dictionary.invitations.reminder}}</button>
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

        validateEmail(force) {
            if (force || !this.fields.email.valid) {
                this.fields.email.valid = Validator.email(this.fields.email.value);
            }

            return this.fields.email.valid;
        },

        resendReminders(confirm) {
            if (!confirm) {
                this.fields.email.value = this.currentInvite.emails[0] ? this.currentInvite.emails[0].email : '';
                return false;
            }


            if (!this.validateEmail(true) || this.ui.saving) {
                return false;
            }

            let scope = this;
            //scope.ui.saving = true;

            let rm1 = new InvitationEmailModel(this.currentInvite.id);
            rm1.sendInvite(scope.fields.email.value, 'P7D', 'invite-reminder-1')
                .then(function(res) {
                    scope.currentInvite.emails.push(res);
                });

            let rm2 = new InvitationEmailModel(this.currentInvite.id);
            rm2.sendInvite(scope.fields.email.value, 'P21D', 'invite-reminder-2')
                .then(function(res) {
                    scope.currentInvite.emails.push(res);
                });

            scope.close();
            //scope.ui.saving = false;
            scope.fields.email.value = '';
        },

        declineResend() {
            this.fields.email.value = '';
            this.fields.email.error = false;
            this.fields.reminders = false;
            this.close();
        },
        close() {
            this.$emit('close');
        }
    };

    export default Vue.extend({
        name: 'resend-reminders',
        template,
        data,
        methods,
        components: {
            modal
        },
        props: ['fields', 'currentInvite']
    });
