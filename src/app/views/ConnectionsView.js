    import Vue from 'Vue'
    import DictionaryModel from 'models/DictionaryModel'
    import UserModel from 'models/UserModel'
    import CompanyModel from 'models/CompanyModel'
    import ContextModel from 'models/ContextModel'
    import EventBus from 'services/EventBus'

    const template = `
        <article>
           <nav class="tabs">
               <ul>
                   <router-link tag="li" to="/account/connections/all"><a style="width: 100%">{{ui.dictionary.connections.all}}</a></router-link>
                   <router-link tag="li" to="/account/connections/portfolio"><a>{{ui.dictionary.connections.portfolio}}</a></router-link>
                   <router-link tag="li" to="/account/connections/shared" v-show="company && company.owned"><a>{{ui.dictionary.connections.shared}}</a></router-link>
                   <router-link tag="li" v-show="profile.roles && profile.roles.indexOf('sales_potential_role') >= 0 && profile.roles.indexOf('sales_potential_total_role') >= 0" to="/account/sales-potential"><a>{{ui.dictionary.salesPotential.salesPotentialReport}}</a></router-link>
                   <router-link tag="li" data-test-id="goToInvitations" class="right-float" to="/account/invitations"><a>{{ui.dictionary.invitations.title}}</a></router-link>
                   <router-link v-show="company && company.settings && company.settings.invitation_metric" tag="li" class="right-float" to="/account/invitation-metrics"><a>{{ui.dictionary.invitations.metrics}}</a></router-link>
               </ul>
           </nav>
           <section class="tab-content">
               <router-view :key="$route.path"></router-view>
           </section>
        </article>
`;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash()
        },
        permissions : UserModel.getCompanyUserInfo(),
        company : CompanyModel.getCompany(),
        profile : UserModel.profile()
    });

    const methods = {

        init() {
            EventBus.$on('companyUserChanged', this.updatePermissions);
            document.addEventListener('contextChange', this.updatePermissions);

            if (this.$route.path === '/account/connections') {
                this.$router.push( { path : '/account/connections/all', query : this.$route.query } );
            }
        },

        trackEvent(eventName) {
            Track.am.log(eventName);
        },

        updatePermissions() {
            this.permissions = UserModel.getCompanyUserInfo();
            this.company = CompanyModel.getCompany();
        },

        checkPath(e) {
            if (this.$route.query.r) {
                //This is just a redirect from another page,
                //do not load anything yet; just clean up URL
                this.$route.query.r = false;

                if (e == 'init') {
                    //this.$router.push( { path : '/account/connections/all', query : this.$route.query } );
                }

                return false;
            }

            var scope = this;
            var path = this.$route.path;
            if (this.$route.path === '/account/connections') {
                path = '/account/connections/all';
            } else if (this.$route.path === '/account/connections/portfolio') {
                path = '/account/connections/portfolio'
            }

            //this.$router.push( { path : '/account/connections', query : this.$route.query } );

            setTimeout(function() {
                scope.$router.push( { path : path, query : scope.$route.query } );
            }, 1);
        }
    };


    export default Vue.extend({
        name: 'connections-view',
        template,
        data,
        methods,
        created() {
            this.init();
        }
    });
