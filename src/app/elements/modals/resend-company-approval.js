define([
    'Vue',
    'elements/modals/modal',
    'models/CompanyUserInvitationModel',
    'models/DictionaryModel',
    'services/Validator'
], function (Vue, modal, CompanyUserInvitationModel, DictionaryModel, Validator) {
    const template = `
        <modal :title="ui.dictionary.connections.resendCompany" :close="close">
               <template v-slot:content>
                   <div class="input-field">
                       <input type="text" v-model="userInvitation.name" disabled>
                   </div>
                    <div class="input-field">
                       <input type="text" v-model="userInvitation.email.value" v-bind:class="{ invalid : !userInvitation.email.valid }" v-on:keyup="validateUserInviteEmail()" v-on:blur="validateUserInviteEmail(true)">
                       <label v-bind:class="{ filled: userInvitation.email.value.length > 0 }">{{ui.dictionary.company.userInvitation.email}}</label>
                       <div class="warning" v-bind:class="{ show : !userInvitation.email.valid }">{{ui.dictionary.general.validation.email}}</div>
                   </div>
               </template>                                         
               <template v-slot:footer>
                    <div class="buttons-container zero-padding-top zero-padding-bottom">
                    <div class="zero-padding"><a href="" v-on:click.prevent="close()">{{ui.dictionary.customKpis.cancel}}</a></div>
                        <div class="zero-padding"><button class="primary" v-on:click="resendCompanyApproval()">{{ui.dictionary.connections.resendCompany}}</button></div>
                   </div>
               </template>                                                                 
        </modal>
    `;

    const data = function () {
        return {
            ui: {
                dictionary: DictionaryModel.getHash()
            },
            userInvitation : {
                name: this.name,
                email : { value : '', valid : true },
                language : DictionaryModel.getHash().meta.code
            },
        };
    };

    const methods = {
        validateUserInviteEmail : function(force) {
            if (force || !this.userInvitation.email.valid) {
                this.userInvitation.email.valid = Validator.email(this.userInvitation.email.value);
            }

            return this.userInvitation.email.valid;
        },

        resendCompanyApproval : function () {
            if ( !this.validateUserInviteEmail(true)) {
                return false;
            }
            var scope = this;
            let cuim = new CompanyUserInvitationModel();
            cuim.inviteUser(this.userInvitation).then(function(res) {
                if (res.id) {
                    cuim.addEmail(res.id, scope.userInvitation.email.value)
                        .then(function(eres) {
                            if (eres.id) {
                                scope.userInvitation = {
                                    name : null,
                                    email : { value : '', valid : true },
                                    language : DictionaryModel.getHash().meta.code
                                };
                            } else {
                                scope.userInvitation.email.valid = false;
                            }
                        });
                    scope.close();
                } else {
                }
            });
        },

        close() {
            this.$emit('close');
        }
    };

    return Vue.extend({
        name: 'resend-company-approval',
        template,
        data,
        methods,
        props: {
            name: {
                type: String,
                required: true
            }
        },
        components: {
            modal
        },
        created: function () {},
        mounted: function() {},
    });
});
