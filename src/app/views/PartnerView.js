import Vue from 'Vue'
import partners from 'config/partners'
import Config from 'services/Config'
import PartnerModel from 'models/PartnerModel'
import DictionaryModel from 'models/DictionaryModel'
import AssetModel from 'models/AssetModel'
import LoginView from 'views/LoginView'
import RegisterView from 'views/RegisterView'
import ForgotView from 'views/ForgotView'
import LanguageView from 'views/LanguageView'


const template =  `
    <article>
       <div class="embed">
           <div v-if="view === null"><div class="app-loader"></div></div>
           <div v-if="view == 'login'"><login-view :descriptionString="partner.description"></login-view></div>
           <div v-if="view == 'register'"><register-view></register-view></div>
           <div v-if="view == 'forgot'"><forgot-view></forgot-view></div>
           <div v-if="view == 'language'"><language-view></language-view></div>
       </div>
    </article>
`;

const data = () => ({
    view : null,
    viewList : ['login', 'register', 'forgot', 'language'],
    partner : null
})

const methods = {
    init() {
        var scope = this;

        /**
         * There is no partner, simply push to login page
         */
        if (!this.$route.meta.partner) {
            this.$router.push('/login');
            return false;
        }

        /**
         * Get partner information and set it to the partner model.
         */
        var partnerList = Config.get('partnerList');
        var partner = partners[partnerList][this.$route.meta.partner];
        this.partner = partner;
        PartnerModel.setPartner(partner);

        /**
         * Set dictionary if different from current.
         */
        if (partner.lang != DictionaryModel.getLanguage()) {
            DictionaryModel.setLanguage(partner.lang);
            DictionaryModel.fetchDictionary(true)
                .then(function(dictionary) {
                    DictionaryModel.setHash(dictionary);
                    scope.showView();
                });
        /**
         * Otherwise just redirect
         */
        } else {
            scope.showView();
        }
    },

    /**
     * Show the relevant view
     */
    showView() {
        if (this.$route.params.view && this.viewList.indexOf(this.$route.params.view) >= 0) {
            this.view = this.$route.params.view;
        } else if (this.$route.query.register !== undefined) {
            this.view = 'register';
        } else if (this.$route.query.forgot !== undefined || this.$route.query.recover !== undefined) {
            this.view = 'forgot';
        } else if (this.$route.query.language !== undefined) {
            this.view = 'language';
        } else {
            this.view = 'login';
        }
    },

    /**
     * Get logo asset for partner
     */
    getLogo(file) {
        return new AssetModel(file).path;
    },

    parseLinks(string) {
        string = string.replace('[link=', '<a href="');
        string = string.replace(']', '" target="_blank">');
        string = string.replace('[/link]', '</a>');

        return string;
    }
};

export default Vue.extend({
    template,
    data,
    methods,
    components : {
        'login-view' : LoginView,
        'register-view' : RegisterView,
        'forgot-view' : ForgotView,
        'language-view' : LanguageView
    },
    created() {
        this.init();
    },
    watch : {
        '$route' : function(val) {
            this.showView();
        }
    }
});
