    import Vue from 'Vue'
    import partners from 'config/partners'
    import Config from 'services/Config'
    import PartnerModel from 'models/PartnerModel'
    import DictionaryModel from 'models/DictionaryModel'
    import AssetModel from 'models/AssetModel'

    const template = `
        <article class="lone-component">
           <div v-if="partner" class="partner-logo">
               <img :src="getLogo(partner.logo)">
           </div>
           <header class="main-heading center-text">CrediWire</header>
           <section class="message-bar center-text">
               <div class="normal">{{ui.dictionary.general.errors.timeout}}</div>
           </section>
           <section class="center-text">
               <button class="primary" v-on:click="gotoLogin()">{{ui.dictionary.login.prompt}}</button>
           </section>
        </article>
    `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            working : false
        },
        partner : PartnerModel.getPartner(),
        prevRoute : null
    });


    const methods = {
        init() {
            setTimeout(function() {
                if (!this.partner) {
                    this.gotoLogin();
                }
            }.bind(this), 5000);
        },

        gotoLogin() {
            if (this.partner && this.partner.code) {
                this.$router.push('/'+this.partner.code+'?p='+this.getRedirectParam());
            } else {
                this.$router.push('/login?p='+this.getRedirectParam());
            }
        },

        getRedirectParam() {
            return this.prevRoute;
        },

        /**
         * Get logo asset for partner
         */
        getLogo(file) {
            return new AssetModel(file).path;
        }
    };


    export default Vue.extend({
        template,
        data,
        methods,
        mounted() {
            this.init();
        },
        beforeRouteEnter(to, from, next) {
            next(function(vm) {
                vm.$data.prevRoute = from.path;
            });
        }
    });
