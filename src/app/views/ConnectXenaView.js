define([
    
    'Vue',
    'models/DictionaryModel',
    'models/CompanyModel',
    'services/Xena'
], function(Vue, DictionaryModel, CompanyModel, Xena) {
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
        
        '           <div v-show="ui.showEntities">',
        '               <p>{{ui.dictionary.erp.xena.instruction}}</p>',
        '               <div class="radio-field" v-for="entity in entities">',
        '                   <label><input type="radio" v-model="chosenEntity" v-bind:value="entity"> <i></i> {{entity.Name}}</label>',
        '               </div>',
        '               <div v-show="chosenEntity">',
        '                   <button class="primary" v-on:click="selectEntity(chosenEntity)">{{ui.dictionary.erp.xena.select}}</button>',
        '               </div>',
        '           </div>',
        '       </section>',
        '       ',
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
                erpError : false,
                showEntities : false
            },
            erp : {},
            entities : [],
            chosenEntity : null,
            company : JSON.parse(sessionStorage.getItem('xenaCompany')),
            reconnect : JSON.parse(sessionStorage.getItem('xenaReconnectCompany'))
        };
    };
    
    
    var methods = {
        init : function() {
            if (window.name == 'xena') {
                window.opener.redirectToConnect(window.location.href);
                window.close();
                return false;    
            }
            
            this.erp = this.extractHashValues(window.location.hash.substr(1));
            this.getEntities();
        },
        
        
        extractHashValues : function(string) {
            var arr = string.split('&');
            var vals = {};
            
            arr.forEach(function(val) {
                var parts = val.split('=');
                var key = parts[0];
                var value = parts[1];
                
                vals[key] = value;
            });

            return vals;
        },
        
        
        getEntities : function() {
            var scope = this;
            Xena.getEntities(this.erp.access_token)
                .then(function(res) {
                    if (res && res.Entities && res.Entities.length > 0) {
                        scope.entities = res.Entities;
                        
                        if (res.Entities.length === 1) {
                            scope.selectEntity(scope.entities[0]);
                        } else {
                            scope.ui.showEntities = true;
                        }
                    } else {
                        scope.ui.erpError = true;
                    }
                    
                    scope.ui.loading = false;
                });
        },
        
        
        selectEntity : function(entity) {
            var scope = this;
            this.ui.loading = true;
            this.ui.showEntities = false;
            CompanyModel.setCompany(this.company, this.$store);
            sessionStorage.removeItem('xenaCompany');

            if (this.reconnect) {
                Xena.reconnectErp(this.company.id, this.erp.code, entity.FiscalSetupId)
                .then(function(res) {
                    if (res.errors) {
                        scope.ui.erpError = true;
                        scope.ui.loading = false;
                    } else {
                        scope.redirect();
                    }
                });
                sessionStorage.removeItem('xenaReconnectCompany');
                return true;
            }
            Xena.saveErp(this.company.id, this.erp.code, entity.FiscalSetupId)
                .then(function(res) {
                    if (res.errors) {
                        scope.ui.erpError = true;
                        scope.ui.loading = false;
                    } else {
                        scope.redirect();
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
