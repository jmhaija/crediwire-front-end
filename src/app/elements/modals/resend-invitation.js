define([
    'Vue',
    'elements/modals/modal',
    'models/DictionaryModel',
    'services/Validator'
], function (Vue, modal, DictionaryModel, Validator) {
    const template = `
        <modal :title="dictionary.company.resendInvite" :close="close">
               <template v-slot:content>
                   <div class="working" v-show="resendInviteObject.email === null"></div>
                   <div v-show="resendInviteObject.email !== null" class="input-field">
                       <input type="text" v-model="resendInviteObject.email" v-bind:class="{ invalid : !resendInviteObject.emailValid }" v-on:keyup="validateInviteEmail()" v-on:blur="validateInviteEmail(true)">
                       <label v-bind:class="{ filled: resendInviteObject.email && resendInviteObject.email.length > 0 }">{{dictionary.company.userInvitation.email}}</label>
                       <div class="warning" v-bind:class="{ show : !resendInviteObject.emailValid }">{{dictionary.general.validation.email}}</div>
                   </div>
               </template>                                         
               <template v-slot:footer>
                   <div style="display: flex; align-items: flex-end; flex: 1; justify-content: flex-end;">
                       <span class="working inline" v-show="resendingInvite"></span>
                       <button class="primary" v-on:click="resendInvitation(resendInviteObject); close();" v-show="!resendingInvite" v-handle-enter-press="function() { resendInvitation(resendInviteObject); }">{{dictionary.company.resendInvite}}</button>
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
        validateInviteEmail : function(force) {
            if (force || !this.resendInviteObject.emailValid) {
                this.resendInviteObject.emailValid = Validator.email(this.resendInviteObject.email);
            }

            return this.resendInviteObject.emailValid;
        },
        close() {
            this.$emit('close');
        }
    };

    return Vue.extend({
        name: 'resend-invitation',
        template,
        data,
        methods,
        props: {
            resendInvitation: {
                type: Function,
                required: true
            },
            resendInviteObject: {
                type: Object,
                required: true
            },
            resendingInvite: {
                type: Boolean,
                required: true
            }
        },
        components: {
            modal
        },
        mounted: function() {},
    });
});
