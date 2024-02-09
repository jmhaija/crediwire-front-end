    import Vue from 'Vue'
    import DictionaryModel from 'models/DictionaryModel'
    import ContextModel from 'models/ContextModel'
    import CompanyModel from 'models/CompanyModel'
    import UserModel from 'models/UserModel'
    import tutorialSlide from 'elements/tutorial-slide'
    import EventBus from 'services/EventBus'
    import Tutorial from 'services/Tutorial'
    import ErpModel from 'models/ErpModel'

    const template = `
        <article>
           <nav class="tabs">
               <ul>
                   <router-link tag="li" to="/account/company/settings"><a>{{ui.dictionary.company.settings}}</a></router-link>
                   <router-link tag="li" to="/account/company/erp"><a>{{ui.dictionary.erp.title}}</a></router-link>
                   <router-link v-if="isMapping" tag="li" to="/account/company/mapping"><a>{{ui.dictionary.company.mapping}}</a></router-link>

                   <v-popover :open="showCompanyUsersTutorial()" placement="bottom">
                       <router-link tag="li" to="/account/company/users" v-show="!context && permissions && (permissions.owner || permissions.permissionType == 'full')"><a>{{ui.dictionary.company.users}}</a></router-link>
                       <template slot="popover"><tutorial-slide :tutorial="tutorial"></tutorial-slide></template>
                   </v-popover>
                   <router-link tag="li" to="/account/company/logo"><a>Company Logo</a></router-link>
                   <router-link tag="li" to="/account/company/leave-company" v-show="!context && company && !company.owned"><a>{{ui.dictionary.company.leave}}</a></router-link>
                   <router-link tag="li" to="/account/company/delete-company" v-show="!context && company && company.owned"><a>{{ui.dictionary.company.deleteCompany}}</a></router-link>
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
        },
        context : ContextModel.getContext(),
        company : CompanyModel.getCompany(),
        permissions : ContextModel.getContext() || UserModel.getCompanyUserInfo(),
        tutorial : Tutorial,
        isMapping: true
    });


    const methods = {

        init() {
            if (this.$route.path === '/account/company') {
                this.$router.push('/account/company/settings');
            }
            this.getCurrentErp();
            EventBus.$on('companyUserChanged', this.companyUserChanged);
        },

        companyUserChanged() {
            this.permissions = ContextModel.getContext() || UserModel.getCompanyUserInfo();
        },

        showCompanyUsersTutorial() {
             return this.tutorial.current && this.tutorial.current.name === 'companyUsers' && !this.tutorial.state.loading && !this.tutorial.state.finished;
        },

        getCurrentErp() {
            setTimeout(() => {
                let erp = ErpModel.getErp();
                if(erp === 'loading' || erp === false) {
                    this.isMapping = false;
                    this.getCurrentErp();
                    return false;
                }

                this.isMapping = !!erp?.erp;
            }, 0);

        }
    };


    export default Vue.extend({
        template,
        data,
        methods,
        components : {
            'tutorial-slide' : tutorialSlide
        },
        created() {
            this.init();
        },
        mounted() {
            EventBus.$on('selectCompany', (select) => {
                select ? this.getCurrentErp() : '';
            });
        },
        beforeDestroy() {
            EventBus.$off('selectCompany');
        }
    });
