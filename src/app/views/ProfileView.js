   import Vue from 'Vue'
   import DictionaryModel from 'models/DictionaryModel'
   import EventBus from 'services/EventBus'

   const template = `
        <article>
           <nav class="tabs">
               <ul>
                   <router-link tag="li" to="/account/profile/info"><a>{{ui.dictionary.profile.title}}</a></router-link>
                   <router-link tag="li" to="/account/profile/password"><a>{{ui.dictionary.profile.password}}</a></router-link>
               </ul>
           </nav>
           <section class="tab-content">
               <router-view></router-view>
           </section>
        </article>
`;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash()
        }
    });

    const methods = {

        init() {
            if (this.$route.path === '/account/profile') {
                this.$router.push('/account/profile/info');
            }

            EventBus.$on('uiLanguageChanged', this.refreshDictionary);
        },

        refreshDictionary() {
            this.ui.dictionary = DictionaryModel.getHash();
        }
    };


    export default Vue.extend({
        template,
        data,
        methods,
        created() {
            this.init();
        },
        beforeDestroy() {
            EventBus.$off('uiLanguageChanged', this.refreshDictionary);
        }
    });
