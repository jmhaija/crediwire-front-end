   import Vue from 'Vue'
   import Logout from 'services/Logout'

   const template = `<div class="app-loader"></div>`;

   const methods = {

        logout() {
            Logout.clearAllData();

            this.$router.push( { path : '/login' });
        }
    };

    export default Vue.extend({
        template,
        methods,
        created() {
            this.logout();
        }
    });
