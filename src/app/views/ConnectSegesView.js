define([
    
    'Vue',
    'models/DictionaryModel',
    'models/CompanyModel',
    'models/ErpModel'
    
], function(Vue, DictionaryModel, CompanyModel, ErpModel) {
    /**
     * View template
     */
    var template = [
        '<article>',
        '   <div v-show="ui.loading">',
        '       <div class="app-loader"></div>',
        '   </div>',
        '   <div v-show="!ui.loading" class="lone-component">',
        '       <section class="message-bar">',
        '           <div class="warning" v-show="ui.companyError">{{ui.dictionary.erp.companyError}}</div>',
        '           <div class="warning" v-show="ui.erpError">{{ui.dictionary.erp.erpError}}</div>',
        '       </section>',
        '   </div>',
        '</article>'
    ].join('');
    
    
    /**
     * Data bindings
     */
    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                loading : true,
                companyError : false,
                erpError : false
            },
            erp : {},
            entities : [],
            chosenEntity : null,
            company : JSON.parse(localStorage.getItem('segesCompany')),
            context : JSON.parse(localStorage.getItem('segesContext')),
            token : null
        };
    };
    
    
    var methods = {
        init : function() {
            this.token = this.$route.query.token;

            CompanyModel.setCompany(this.company, this.$store);
            localStorage.removeItem('segesCompany');
            
            this.saveErp();
        },

        saveErp : function() {
            var scope = this;
            
            ErpModel.createConnection('seges', this.token)
                .then(function(res) {
                    if (!res.errors) {
                        ErpModel.setErp(res);
                        scope.redirect();
                    } else {
                        scope.ui.loading = false;
                        scope.ui.erpError = true;
                    }
                });
        },
        
        redirect : function() {
            var url = localStorage.getItem('client') ? '/client?step=mapping' : '/account/updating';
            
            if (window.name == 'externalErpFlow') {
                if (window.opener) {
                    window.opener.completeConnection(url);
                }
                window.close();
                return false;
            }
            
            this.$router.push(url);
            
        }
    };
    
    
    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        created : function() {
            this.init();
        }
    });
});
