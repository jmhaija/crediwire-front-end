    import Vue from 'Vue'
    import modal from 'elements/modals/modal'
    import DictionaryModel from 'models/DictionaryModel'
    import Validator from 'services/Validator'
    import InvitationEmailModel from 'models/InvitationEmailModel'
    import EventBus from 'services/EventBus'

    const template = `
        <modal :title="ui.dictionary.invitations.confirm" :close="close">                                        
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
                <div class="zero-padding"><button class="primary" v-show="!ui.saving" type="submit" @click.prevent="resendInvitation(true)" v-handle-enter-press="function() { resendInvitation(true); }">{{ui.dictionary.invitations.resend}}</button></div>
                <div class="float-right working inline" v-show="ui.saving"></div>
            </div>
            </template>                                                  
        </modal>
    `;


    const data = () => ({
        ui: {
            dictionary: DictionaryModel.getHash(),
            changeEmailsConfirm: false,
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

        resendInvitation(confirm, linkOnly) {
            if (!confirm) {
                this.fields.email.value = this.currentInvite.emails[0] ? this.currentInvite.emails[0].email : '';
                return false;
            }

            if (!this.validateEmail(true) || this.ui.saving) {
                return false;
            }

            let scope = this;
            scope.ui.saving = true;

            let em = new InvitationEmailModel(this.currentInvite.id);

            em.sendInvite(this.fields.email.value, false, false, linkOnly)
                .then(function(res) {
                    if (res.id) {
                        scope.currentInvite.emails.push(res);
                        scope.fields.email.value = '';
                        scope.fields.email.error = false;
                        scope.fields.reminders = false;
                        scope.close();
                        if (scope.currentInvite.emails[0] && res.email != scope.currentInvite.emails[0].email) {
                          //  scope.changeReminderEmails(res.email);
                            EventBus.$emit('resendEmail', res.email);
                        } else if (!scope.hasReminders()) {
                            var rm1 = new InvitationEmailModel(res.id);
                            rm1.sendInvite(res.email, 'P7D', 'invite-reminder-1');

                            var rm2 = new InvitationEmailModel(res.id);
                            rm2.sendInvite(res.email, 'P21D', 'invite-reminder-2');
                        }
                    } else {
                        scope.fields.email.error = true;
                    }

                    scope.ui.saving = false;
                    scope.fields.name.value = '';
                    scope.fields.vat.value = '';
                    scope.fields.email.value = '';
                    scope.fields.reminders = false;
                });
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
        name: 'resend-confirm',
        template,
        data,
        methods,
        components: {
            modal
        },
        props: ['fields', 'currentInvite', 'hasReminders']
    });
