define([
    'Vue',
    'elements/modals/modal',
    'models/DictionaryModel',
    'models/InviteTokenModel',
    'services/Toast'
], function (Vue, modal, DictionaryModel, InviteTokenModel, Toast) {
    const template = `
        <modal :title="ui.dictionary.invitations.declineReason" :close="close">
           <template v-slot:content>
              <div class="line-spacer"></div>
              
              <div class="selector full-width">
                 <div class="label" v-on:click.stop="ui.presetReasonsOptions = true">
                    <span v-show="presetReason">{{getCompanyName(presetReason)}}</span> <span v-show="!presetReason">{{ui.dictionary.invitations.selectReason}}</span> <i class="cwi-down"></i>
                    <div class="options" v-bind:class="{ show : ui.presetReasonsOptions }">
                        <div class="option" v-for="(res, idx) in ui.dictionary.invitations.declinePresetReasons" v-bind:class="{ selected : presetReason == res }" v-on:click.stop="selectReason(res)" v-show="idx != currentIndex">
                            {{getCompanyName(res)}}
                        </div>
                    </div>
                 </div>
             </div>
             
             <div class="line-spacer"></div>
             <div class="line-spacer"></div>
             
             <label>{{ui.dictionary.invitations.moreInfo}}</label>
             <textarea v-model="reason"></textarea>
           </template>                   
                                 
           <template v-slot:footer>
                <div class="buttons-container zero-padding-top zero-padding-bottom">
                    <button class="primary full-width" v-on:click="declineInvitationModal()">{{ui.dictionary.invitations.declineSubmit}}</button>
               </div>
           </template>                                                                 
        </modal>
    `;

    const data = function () {
        return {
            ui: {
                dictionary: DictionaryModel.getHash(),
                presetReasonsOptions: false
            },
            chosenDepartment : null,
            presetReason: false,
            reason: ''
        };
    };

    const methods = {
        selectReason : function(reason) {
            this.presetReason = reason;
            this.ui.presetReasonsOptions = false;
        },

        declineInvitationModal : function () {
            var scope = this;
            let token = InviteTokenModel.getToken();
            InviteTokenModel.decline(token, this.reason, this.presetReason)
                .then(function() {
                    InviteTokenModel.forget();
                    Toast.show(scope.ui.dictionary.invitations.declineSubmitted);
                    scope.close();
                });

            this.$router.push('/account/overview');
        },

        close() {
            this.$emit('close');
        }

    };

    return Vue.extend({
        name: 'show-decline-dialogue',
        template,
        data,
        methods,
        props: {
            getCompanyName: {
                type: Function,
                required: true
            },
            currentIndex: {}
        },
        components: {
            modal
        },
        created: function () {},
        mounted: function() {}
    });
});
