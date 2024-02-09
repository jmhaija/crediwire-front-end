    import Vue from 'Vue'
    import DictionaryModel from 'models/DictionaryModel'
    import InviteTokenModel from 'models/InviteTokenModel'
    import languagePicker from 'components/languagePicker.vue'
    import Toast from 'services/Toast'

    const template = `
        <article class="lone-component">
            <div class="app-loader" v-show="ui.loading"></div>
            <div v-show="!ui.loading">
               <div class="float-right"><language-picker :callback="changeDictionary"></language-picker></div>
               <header class="main-heading">CrediWire</header>
        
               <p>{{getCompanyName(ui.dictionary.invitations.declineIntro)}}</p>
               <p><a href="" v-on:click.prevent="gotoRegister()">{{ui.dictionary.invitations.declineReconsider}}</a>, {{ui.dictionary.general.or}} {{toLowerCase(ui.dictionary.invitations.declineReason)}}:</p>
        
        
               <div class="line-spacer"></div>
        
               <div class="selector full-width">
                   <div class="label" v-on:click.stop="ui.presetReasonsOptions = true">
                       <span v-show="presetReason">{{getCompanyName(presetReason)}}</span> <span v-show="!presetReason">{{ui.dictionary.invitations.selectReason}}</span> <i class="cwi-down"></i>
                       <div class="options" v-bind:class="{ show : ui.presetReasonsOptions }">
                           <div class="option" v-for="(res, idx) in ui.dictionary.invitations.declinePresetReasons" v-bind:class="{ selected : presetReason == res }" v-on:click.stop="selectReason(res)" v-show="idx != 0">
                               {{getCompanyName(res)}}
                           </div>
                       </div>
                   </div>
               </div>
        
        
               <div class="line-spacer"></div>
               <div class="line-spacer"></div>
        
               <label>{{ui.dictionary.invitations.moreInfo}}</label>
               <textarea v-model="reason"></textarea>
        
               <div>
               <button class="full-width" v-on:click.prevent="submitDecline(reason)">{{ui.dictionary.invitations.declineSubmit}}</button>
               </div>
               <div class="center-text"> {{ui.dictionary.general.or}} </div>
               <div>
               <button class="full-width primary" v-on:click.prevent="gotoRegister()">{{ui.dictionary.invitations.declineAccept}}</button>
               </div>
        
            </div>
        </article>
    `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            loading : true,
            presetReasonsOptions : false
        },
        hasInviteToken : false,
        inviteInfo : null,
        reason: '',
        presetReason : ''
    });


    const methods = {
        init() {
            this.checkForInviteToken();

            if (InviteTokenModel.getInfo()) {
                this.hasInviteToken = true;
                this.inviteInfo = InviteTokenModel.getInfo();
            }
        },

        selectReason(reason) {
            this.presetReason = reason;
            this.ui.presetReasonsOptions = false;
        },

        toLowerCase(string) {
            return string.toLowerCase();
        },

        submitDecline(reason) {
            var scope = this;
            this.ui.loading = true;

            InviteTokenModel.decline(this.$route.query.token, reason, this.presetReason)
                .then(function() {
                    scope.$router.push('/login');
                    InviteTokenModel.forget();
                    Toast.show(scope.ui.dictionary.invitations.declineSubmitted, 'centered');
                });
        },

        getCompanyName(string) {
            if (this.inviteInfo && this.inviteInfo.company_name) {
                return string.replace(':company', this.inviteInfo.company_name);
            } else {
                return string;
            }
        },

        changeDictionary(hash) {
            this.ui.dictionary = hash;
        },

        checkForInviteToken() {
            var scope = this;

            if (this.$route.query && this.$route.query.token) {
                scope.ui.loading = true;

                InviteTokenModel.setToken(this.$route.query.token);

                InviteTokenModel.parse()
                    .then(function(res) {
                        if (!res.errors) {
                            InviteTokenModel.setInfo(res);
                            scope.inviteInfo = res;
                            scope.hasInviteToken = true;
                        }

                        scope.ui.loading = false;
                    });
            } else {
                this.$router.push('/login');
                //this.ui.loading = false;
            }
        },

        gotoRegister() {
            this.$router.push('/register?token=' + this.$route.query.token);
        }
    };


    export default Vue.extend({
        template,
        data,
        methods,
        components : {
            'language-picker' : languagePicker
        },
        mounted() {
            this.init();
        }
    });
