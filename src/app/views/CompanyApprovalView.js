    import Vue from 'Vue'
    import DictionaryModel from 'models/DictionaryModel'
    import InviteTokenModel from 'models/InviteTokenModel'
    import AssetModel from 'models/AssetModel'

    const template = `
        <article  class="lone-component" style="width: 700px;">
        
           <div class="register-component">
        
           <div class="logo" style="margin: 0 auto;">
               <img :src="getImage()">
           </div>
        
           <section class="registration-form" style="width: 100%; margin-top: 2rem;">
        
               <div v-show="ui.step == 1">
    <!--    //'           <h1 class="page-title center-text">{{ui.dictionary.client.approveTitle}}</h1>',-->
                   <section class="form">
                       <form v-on:submit.prevent="acceptCompany(true)">
                           <section class="center-text">
                               <div class="working" v-show="ui.working"></div>
                               <button type="submit" v-show="!ui.working" class="accent" style="width: 100%;">{{ui.dictionary.client.acceptRequest}}</button>
                           </section>
                       </form>
                   </section>
        
                   <div class="center-text" style="font-size: 1rem; margin: 2rem 0;">
                       <p>{{parseCompanyName(ui.dictionary.client.approveDescription)}}</p>
                   </div>
        
                   <div class="center-text" style="font-size: 0.9rem; margin: 2rem 0;">
                       <p v-html="parseLinks(parseLinks(ui.dictionary.client.privacyLinks))"></p>
                   </div>
        
                   <div class="center-text">
                       <a href="" v-on:click.prevent="acceptCompany(false)">{{ui.dictionary.client.declineRequest}}</a>
                   </div>
               </div>
        
        
               <div v-show="ui.step == 2">
    <!--    //'           <h1 class="page-title center-text">{{ui.dictionary.client.ownerApproveTitle}}</h1>',-->
                   <section class="form">
                       <form v-on:submit.prevent="makeOwner(true)">
                           <section class="center-text">
                               <div class="working" v-show="ui.working"></div>
                               <button type="submit" v-show="!ui.working" class="accent" style="width: 100%;">{{ui.dictionary.client.acceptCreateUser}}</button>
                           </section>
                       </form>
                   </section>
        
                   <div class="center-text" style="font-size: 1rem; margin: 2rem 0;">
                       <p>{{parseCompanyName(ui.dictionary.client.ownerApproveDescription)}}</p>
                   </div>
        
                   <div class="center-text">
                       <a href="" v-on:click.prevent="makeOwner(false)">{{ui.dictionary.client.declineCreateUser}}</a>
                   </div>
               </div>
        
               <div v-show="ui.step == 3">
    <!--    //'           <h1 class="page-title center-text">{{ui.dictionary.client.declinedTitle}}</h1>',-->
                   <div class="center-text">{{ui.dictionary.client.declinedDescription}}</div>
               </div>
        
               <div v-show="ui.step == 4">
    <!--    //'           <h1 class="page-title center-text">{{ui.dictionary.client.declinedUserTitle}}</h1>',-->
                   <div class="center-text">{{ui.dictionary.client.declinedUserDescription}}</div>
               </div>
        
           </section>
           </div>
        </article>
    `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            working : false,
            step : 1
        },
        inviteInfo : InviteTokenModel.getInfo()
    })

    const methods = {
        parseCompanyName(string) {
            return string.replace(':init_company', this.inviteInfo.initiator_company.name).replace(':request_company', this.inviteInfo.company_name);
        },

        parseLinks(string) {
            string = string.replace('[link href=', '<a href="');
            string = string.replace(']', '" target="_blank">');
            string = string.replace('[/link]', '</a>');
            return string;
        },

        getImage() {
            return new AssetModel('/assets/img/logo/default.png').path;
        },

        acceptCompany(accept) {
            this.ui.working = true;

            InviteTokenModel.approveCompany(accept)
                .then(function(res) {
                    if (accept) {
                        this.ui.working = false;
                        this.ui.step = 2;
                    } else {
                        this.ui.step = 3;
                    }
                }.bind(this));
        },

        makeOwner(accept) {
            if (accept) {
                this.$router.push('/register?invite=company-user&approved=true&token='+ InviteTokenModel.getToken());
            } else {
                this.ui.step = 4;
            }
        }
    };


    export default Vue.extend({
        template,
        data,
        methods,
        mounted() {
            this.init();
        }
    });
