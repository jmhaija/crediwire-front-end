    import Vue from 'Vue'
    import DictionaryModel from 'models/DictionaryModel'
    import UserModel from 'models/UserModel'
    import AssetModel from 'models/AssetModel'
    import CompanyModel from 'models/CompanyModel'
    import Config from 'services/Config'

    const template = `
        <article class="lone-component">
           <div class="float-right"><router-link to="/language?back=new-tos">{{ui.dictionary.meta.lang}}</router-link></div>
           <header class="main-heading">CrediWire</header>
           <section class="message-bar">
               <div class="normal">{{ui.dictionary.tos.changed}}</div>
           </section>
           <section class="form">
               <form v-on:submit.prevent="setNewTos()">
                    <div class="checkbox-field">
                       <div v-if="isDefaultWidget" class="widget-legal-monster" id="legalmonster-signup-ZiVQWW1FRcBk66e4AHfuVHM7"></div>
                       <div v-if="isSwedishWidget" class="widget-legal-monster" id="legalmonster-signup-kbaiYfjcX5AkrQCZCEkhSgQM"></div>
                       <div v-if="isNorwayWidget" class="widget-legal-monster" id="legalmonster-signup-efQ2wwsWZEYXXRneqzs8SYFY"></div>
                       <div v-if="isOtherWidget" class="widget-legal-monster" id="legalmonster-signup-NfUserfugtvm9btbNonf8DpB"></div>
                       
                       <div v-if="isDkTestNormalWidget" class="widget-legal-monster" id="legalmonster-signup-ANaBjLxSgaCu15nxbuNPyXV6"></div>
                       <div v-if="isSwedTestNormalWidget" class="widget-legal-monster" id="legalmonster-signup-ZgAJVzW5mpdwUHSbYReUcgbN"></div>
                       <div v-if="isNorwTestNormalWidget" class="widget-legal-monster" id="legalmonster-signup-F2Ruu3e31WF21YicSRZaeuq5"></div>
                       <div v-if="isOtherTestNormalWidget" class="widget-legal-monster" id="legalmonster-signup-F2Ruu3e31WF21YicSRZaeuq5"></div>
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
        company: CompanyModel.getCompany(),
        companyCountry: null,
        isNorwayWidget: false,
        isSwedishWidget: false,
        isDefaultWidget: false,
        isOtherWidget: false,
        isDkTestNormalWidget: false,
        isSwedTestNormalWidget: false,
        isNorwTestNormalWidget: false,
        isOtherTestNormalWidget: false,
        widgetLocale: '',
        env: Config.get('environment'),
        legalMonsterCurrentKeyId: null,
        profile: UserModel.profile()
    });

    const methods = {
        init() {
            let country = Config.get('countries');
            if (this.company?.country) {
                for (let key in country) {
                    if (country[key] === this.company.country) {
                        this.companyCountry = key;
                    }
                }
            } else {
                this.companyCountry = 'denmark'
            }

            this.showWidgets();
        },

        setNewTos() {
            this.ui.working = true;
            this.profile['agreed-to-latest-terms-of-service'] = true;
            UserModel.construct(this.profile);
            this.updateUserInfoFromWidget(this.profile?.id, this.profile?.email, this.profile?.name);
            UserModel.agreeTos().then(() => { this.$router.push('/account/overview'); });
        },

        showWidgets() {
            this.isNorwayWidget = false;
            this.isSwedishWidget = false;
            this.isDefaultWidget = false;
            this.isOtherWidget = false;

            this.isDkTestNormalWidget = false;
            this.isSwedTestNormalWidget = false;
            this.isNorwTestNormalWidget = false;
            this.isOtherTestNormalWidget = false;

            let lang = this.ui.dictionary.meta.code;
            this.widgetLocale = lang.toLowerCase() || "da-dk";

            if (this.env === "test" || this.env === "staging") {
                if (this.companyCountry === "denmark" || !this.companyCountry) {
                    this.isDkTestNormalWidget = true;
                    this.legalMonsterCurrentKeyId = Config.get('legalMonster').denmark.newTermsView;
                } else if (this.companyCountry === "norway") {
                    this.isNorwTestNormalWidget = true;
                    this.legalMonsterCurrentKeyId = Config.get('legalMonster').norway.newTermsView;
                } else if (this.companyCountry === "sweden") {
                    this.isSwedTestNormalWidget = true;
                    this.legalMonsterCurrentKeyId = Config.get('legalMonster').sweden.newTermsView;
                } else {
                    this.isOtherTestNormalWidget = true;
                    this.legalMonsterCurrentKeyId = Config.get('legalMonster').other.newTermsView;
                }
            } else if (this.env === "production") {
                if (this.companyCountry === "denmark" || !this.companyCountry) {
                    this.isDefaultWidget = true;
                    this.legalMonsterCurrentKeyId = Config.get('legalMonster').denmark.newTermsView;
                } else if (this.companyCountry === "norway") {
                    this.isNorwayWidget = true;
                    this.legalMonsterCurrentKeyId = Config.get('legalMonster').norway.newTermsView;
                } else if (code === "sweden") {
                    this.isSwedishWidget = true;
                    this.legalMonsterCurrentKeyId = Config.get('legalMonster').sweden.newTermsView;
                } else {
                    this.isOtherWidget = true;
                    this.legalMonsterCurrentKeyId = Config.get('legalMonster').other.newTermsView;
                }
            }

            legal.widget({
                type: "signup",
                widgetPublicKey: this.legalMonsterCurrentKeyId,
                targetElementSelector: `#legalmonster-signup-${this.legalMonsterCurrentKeyId}`,
                markRequiredFields: true,
                identifier: this.profile?.id,
                locale: this.widgetLocale
            });

            this.$store.dispatch('setWidgetPublicKey', this.legalMonsterCurrentKeyId);
        },

        updateUserInfoFromWidget(id, email, name) {
            legal.widget({
                type: "signup",
                widgetPublicKey: this.legalMonsterCurrentKeyId,
                identifier: id
            });
            legal.user({
                email,
                name
            });

            this.$store.dispatch('setWidgetPublicKey', this.legalMonsterCurrentKeyId);
        }

    };

    !function(){var i,e,t,s=window.legal=window.legal||[];if(s.SNIPPET_VERSION="3.0.0",i="https://widgets.legalmonster.com/v1/legal.js",!s.__VERSION__)if(s.invoked)window.console&&console.info&&console.info("legal.js: The initialisation snippet is included more than once on this page, and does not need to be.");else{for(s.invoked=!0,s.methods=["cookieConsent","document","ensureConsent","handleWidget","signup","user"],s.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);return e.unshift(t),s.push(e),s}},e=0;e<s.methods.length;e++)t=s.methods[e],s[t]=s.factory(t);s.load=function(e,t){var n,o=document.createElement("script");o.setAttribute("data-legalmonster","sven"),o.type="text/javascript",o.async=!0,o.src=i,(n=document.getElementsByTagName("script")[0]).parentNode.insertBefore(o,n),s.__project=e,s.__loadOptions=t||{}},s.widget=function(e){s.__project||s.load(e.widgetPublicKey),s.handleWidget(e)}}}();

    export default Vue.extend({
        template,
        data,
        methods,
        mounted() {
            this.init();
        }
    });
