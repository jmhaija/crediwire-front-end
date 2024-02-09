    import Vue from 'Vue'
    import DictionaryModel from 'models/DictionaryModel'
    import CompanyModel from 'models/CompanyModel'
    import ErpModel from 'models/ErpModel'

    const template = `
        <article>
           <div v-show="ui.loading">
               <div class="app-loader"></div>
           </div>
           <div v-show="!ui.loading" class="lone-component">
               <section class="message-bar">
                   <div class="warning" v-show="ui.companyError">{{ui.dictionary.erp.companyError}}</div>
                   <div class="warning" v-show="ui.erpError">{{ui.dictionary.erp.erpError}}</div>
               </section>
           </div>
        </article>
    `;

    const data = () => ({
        ui : {
            dictionary : DictionaryModel.getHash(),
            loading : true,
            companyError : false,
            erpError : false
        },
        company : null,
        country : null,
        token : null,
        provider : null
    });

    const methods = {

        init() {

            //Set company ID and language
            this.company = this.$route.params.company || JSON.parse(localStorage.getItem('company')).id;
            this.provider = this.$route.params.provider;

            //Set country if provided
            if (this.$route.params.country) {
                this.country = this.$route.params.country;
            } else if (this.$route.query.country) {
                this.country = this.$route.query.country;
            }

            //Set token
            if (this.$route.query.token) {
                this.token = this.$route.query.token;
            } else if (this.$route.query.code) {
                this.token = this.$route.query.code;
            }

            this.getCompany();
        },

        /**
         * Get company information
         */
        getCompany() {
            CompanyModel.fromID(this.company)
                .then((res) => {
                    if (!res.errors) {
                        CompanyModel.setCompany(res, this.$store);
                        this.saveErp();
                    } else {
                        this.ui.loading = false;
                        this.ui.companyError = true;
                    }
                });
        },

        /**
         * Save ERP
         */
        saveErp() {
            ErpModel.createConnection(this.provider, this.token, this.country)
                .then((res) => {
                    if (!res.errors) {
                        ErpModel.setErp(res);
                        this.redirect(res);
                    } else {
                        this.ui.loading = false;
                        this.ui.erpError = true;
                    }
                });
        },

        /**
         * Redirect to the next view
         */
        redirect(erp) {
            var url = localStorage.getItem('client') ? '/client?step=mapping' : '/account/updating';
            if (window.name == 'externalErpFlow') {
                if (window.opener) {
                    window.opener.completeConnection(url, erp);
                }
                window.close();
                //return false;
            } else if (window.name == 'externalErpFlowSession') {
                localStorage.setItem('erp', JSON.stringify(erp));
                return false;
            }

            this.$router.push(url);
        }
    };


    export default Vue.extend({
        template,
        data,
        methods,
        created() {
            this.init();
        }
    });
