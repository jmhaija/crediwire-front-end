define([

    'Vue',
    'models/DictionaryModel',
    'models/CompanyModel',
    'services/Dinero'
], function(Vue, DictionaryModel, CompanyModel, Dinero) {

    var template = [
    '<article>',
    '   <div v-show="ui.loading">',
    '       <div class="app-loader"></div>',
    '   </div>',
    '   <div v-show="!ui.loading" class="lone-component">',
    '       <section class="message-bar">',
    '           <div class="warning" v-show="ui.companyError">{{ui.dictionary.erp.companyError}}</div>',
    '           <div class="warning" v-show="ui.erpError">{{ui.dictionary.erp.erpError}}</div>',

    '           <div v-show="ui.showEntities">',
    '               <p>{{ui.dictionary.erp.xena.instruction}}</p>',

    '               <p>{{ui.dictionary.erp.dineroProAccount}}</p>',

    '               <div class="half-list">',
    '                   <h4>{{ui.dictionary.erp.dineroPro}}</h4>',
    '                   <div class="radio-field" v-for="entity in entities" v-show="isProAccount(entity)">',
    '                       <label><input type="radio" v-model="chosenEntity" v-bind:value="entity"> <i></i> {{entity.name}}</label>',
    '                   </div>',
    '               </div',
    '               ><div class="half-list">',
    '                   <h4>{{ui.dictionary.erp.dineroNonPro}}</h4>',
    '                   <div class="radio-field" v-for="entity in entities" v-show="!isProAccount(entity)">',
    '                       <label>{{entity.name}}</label>',
    '                   </div>',
    '               </div>',

    '               <div v-show="chosenEntity && isProAccount(chosenEntity)">',
    '                   <button class="primary" v-on:click="selectEntity(chosenEntity)">{{ui.dictionary.erp.xena.select}}</button>',
    '               </div>',
    '               <div v-show="chosenEntity && !isProAccount(chosenEntity)">',
    '                   <span v-html="parseLink(ui.dictionary.erp.dineroProAccount)"></span>',
    '               </div>',
    '           </div>',

    '           <div class="line-spacer"></div>',
    '           <div class="center-text" v-show="ui.showEntities">',
    '               <router-link to="/account/company/erp">{{ui.dictionary.company.settings}}</router-link>',
    '           </div>',
    '       </section>',
    '       ',
    '   </div>',
    '</article>'
    ].join('');


    var bindings = function () {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                loading : true,
                showEntities : false,
                erpError : false
            },
            code : null,
            entities : [],
            chosenEntity : null,
            company : JSON.parse(sessionStorage.getItem('targetCompany')) || CompanyModel.getCompany(),
            encryptedToken : null,
            stateID : null
        };
    };


    var methods = {
        init : function () {
            this.code = this.$route.query.code
            this.returnedState = this.$route.query.state
            this.stateID = JSON.parse(localStorage.getItem('stateID'))

            if (this.returnedState !== this.stateID) {
                this.ui.erpError = true
                return false
            }

            this.parseToken()
        },

        isProAccount : function(entity) {
            if (!entity.hasOwnProperty('is_pro')) {
                return true;
            }

            return entity.is_pro;
        },

        parseLink : function(string) {
            string = string.replace('[/link]', '</a>');
            string = string.replace('[link=', '<a href="');
            string = string.replace(']', '" target="_blank">');
            return string;
        },

        parseToken : function() {
            Dinero.parseToken(this.code)
                .then(function(res) {
                    if (res && res.organizations && res.organizations.length > 0) {
                        this.entities = res.organizations;

                        this.encryptedToken = res.encrypted_token;

                        if (res.organizations.length === 1) {

                            if (this.isProAccount(this.entities[0])) {
                                this.selectEntity(this.entities[0]);
                            } else {
                                this.ui.showEntities = true;
                            }
                        } else {
                            this.ui.showEntities = true;
                        }
                    } else {
                        this.ui.erpError = true;
                    }

                    this.ui.loading = false;
                }.bind(this));
        },


        selectEntity : function(entity) {
            this.ui.loading = true;
            this.ui.showEntities = false;
            CompanyModel.setCompany(this.company, this.$store);

            Dinero.saveErp(this.company.id, this.encryptedToken, entity.id, 'DKK')
                .then(function(res) {
                    if (res.errors) {
                        this.ui.erpError = true;
                        this.ui.loading = false;
                    } else {
                        this.redirect();
                    }
                }.bind(this));
        },


        redirect : function () {
            sessionStorage.removeItem('targetCompany');
            if (window.opener) {
                window.opener.completeConnection();
            }
            window.close();
            return false;
        }
    };


    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        mounted : function () {
            this.init();
        }
    });
});
