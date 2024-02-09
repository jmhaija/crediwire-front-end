    import Vue from 'Vue'
    import DictionaryModel from 'models/DictionaryModel'
    import UserModel from 'models/UserModel'
    import AssetModel from 'models/AssetModel'

    const template = `
        <article class="lone-component">
           <div class="float-right"><router-link to="/language?back=new-tos">{{ui.dictionary.meta.lang}}</router-link></div>
           <header class="main-heading">CrediWire</header>
           <section class="message-bar">
               <div class="normal">{{ui.dictionary.tos.changed}}</div>
           </section>
           <iframe :src="getTermsUrl()" class="tos"></iframe>
           <section class="form">
               <form v-on:submit.prevent="setNewTos(tos)">
                   <div class="checkbox-field message-bar">
                       <label><input type="checkbox" v-model="tos.value" v-on:change="verifyTos()"> <i></i> {{ui.dictionary.tos.agree}}</label>
                       <div class="warning small-text" v-show="!tos.valid">{{ui.dictionary.tos.error}}</div>
                   </div>
                   <section class="toolbar">
                      <div class="float-right"><div class="working" v-show="ui.working"></div><button type="submit" v-show="!ui.working">{{ui.dictionary.tos.action}}</button></div>
                       <div class="left-text"><router-link to="/logout">{{ui.dictionary.tos.decline}}</router-link></div>
                   </section>
               </form>
           </section>
        </article>
    `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            working : false
        },
        tos : { value : false, valid : true},
        profile : UserModel.profile()
    });

    const methods = {
        /**
         * Generate URL for the terms and conditions HTML document
         */
        getTermsUrl() {
            return new AssetModel('/assets/terms/' + this.profile['specific-tos-key'] + '.html').path;
        },
        /**
         * Verify that the terms of service have been checked.
         */
        verifyTos() {
            this.tos.valid = this.tos.value;

            return this.tos.valid;
        },
        /**
         * Set the new TOS status for the user
         */
        setNewTos(tos) {
            if ( !this.verifyTos() ) {
                return false;
            }

            var scope = this;
            scope.ui.working = true;

            var profile = UserModel.profile();
            profile['specific-tos-accepted'] = true;

            UserModel.construct(profile);
            UserModel.agreeSpecTos()
                .then(function(res) {
                    scope.$router.push('/account/overview');
                });

        }
    };

    export default Vue.extend({
        template,
        data,
        methods
    });
