    import Vue from 'Vue'
    import UserModel from 'models/UserModel'

    const template = `<div class="app-loader"></div>`;

    const methods = {
        routeByUserState() {
            if (this.$route.query.path && this.$router.matcher.match(this.$route.query.path).path != '/') {
                this.$router.push(this.$route.query.path)
            } else if (!UserModel.authenticated()) {
                if (this.$route.query.register !== undefined || !localStorage.getItem('recognizedUser')) {
                    this.$router.push('/register')
                    return false
                } else if (this.$route.query.recover !== undefined) {
                    this.$router.push('/forgot')
                    return false
                } else {
                    this.$router.push( { path : '/login' })
                }
            } else {
                this.$router.push( { path : '/account/overview' })
            }
        }
    }

    export default Vue.extend({
        template,
        methods,
        created() {
            this.routeByUserState();
        }
    });
