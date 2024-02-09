    import Vue from 'Vue'
    import LanguageCollection from 'collections/LanguageCollection'
    import DictionaryModel from 'models/DictionaryModel'
    import PartnerModel from 'models/PartnerModel'

    const template = `
        <article class="lone-component">
           <header class="main-heading">CrediWire</header>
           <section class="message-bar">
               <div class="normal">{{ui.dictionary.language.prompt}}</div>
           </section>
           <section class="form">
               <form>
                   <div class="radio-field" v-for="language in ui.languages">
                       <label><input type="radio" v-model="ui.selectedLanguage" v-on:change="changeLanguage(ui.selectedLanguage)" v-bind:value="language.code"> <i></i> {{language.name}}</label>
                   </div>
                   <div class="toolbar full-width">
                       <div><a v-on:click.stop="goBack()">&larr; {{ui.dictionary.language.back}}</a></div>
                   </div>
               </form>
           </section>
        </article>
    `;

    const data = () => ({
        ui : {
            working: false,
            dictionary : DictionaryModel.getHash(),
            languages : LanguageCollection.getList(),
            selectedLanguage : DictionaryModel.getLanguage()
        },
        redirectList : [
            'login',
            'register',
            'unsupported',
            'new-tos',
            'forgot',
            'recover'
        ],
        partner : PartnerModel.getPartner()
    });

    const methods = {
        /**
         * Change the UI language
         */
        changeLanguage(language) {
            var scope = this;
            this.ui.working = true;

            DictionaryModel.setLanguage(language);
            DictionaryModel.fetchDictionary(true)
                .then(function(dictionary) {
                    DictionaryModel.setHash(dictionary);
                    scope.ui.dictionary = dictionary;
                    scope.ui.working = false;
                    //scope.goBack();
                });
        },
        /**
         * Go back to previous view
         */
        goBack() {
            var redirectIndex = this.$route.query.back ? this.redirectList.indexOf(this.$route.query.back) : 0;
            var redirectTo = this.redirectList[redirectIndex];

            if (this.partner) {
                this.$router.push('/' + this.partner.code + '/' + redirectTo);
                return true;
            }

            this.$router.push(redirectTo);
        }
    };


    export default Vue.extend({
        template,
        data,
        methods
    });
