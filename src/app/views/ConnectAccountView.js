    import Vue from 'Vue'
    import UserModel from 'models/UserModel'
    import EconomicSelf from 'services/EconomicSelf'

    const template = `
        <article>
           <div class="app-loader"></div>
        </article>
    `;

    const methods = {
        init() {
            var token = this.$route.query.token;

            if (!token) {
                this.$router.push('/register');
                return false;
            }

            EconomicSelf.makeApiCall(token)
                .then(function(resp) {
                    if (resp.content) {
                        EconomicSelf.setInfo(resp.content);
                        this.checkUserExistence(resp.content.user.email);
                    } else {
                        this.$router.push('/register');
                    }
                }.bind(this));
        },

        checkUserExistence(email) {
            var scope = this;

            UserModel.checkRegister(email)
                .then(function(res) {
                    if (res.success) {
                        scope.$router.push('/login');
                    } else {
                        scope.$router.push('/register');
                    }
                });
        },
    };

    export default Vue.extend({
        template,
        methods,
        created() {
            this.init();
        }
    });
