define([
    
    'Vue',
    'models/DictionaryModel',
    'models/UserModel',
    'services/Validator',
    'models/AssetModel'
    
],function(Vue, DictionaryModel, UserModel, Validator, AssetModel) {
    /**
     * View template
     */
    var template = [
        '<article class="lone-component">',


        '   <div class="lone-logo">',
        '       <img :src="getImage(\'/assets/img/logo/default.png\')">',
        '   </div>',
        

        '   <div class="login-form">',
        
        '   <section class="message-bar" v-show="!ui.success">',
        '       <div class="normal" v-show="!ui.error">{{ui.dictionary.recover.password}}</div>',
        '       <div class="warning" v-show="ui.error">{{ui.dictionary.recover.failed}}</div>',
        '   </section>',
        '   <section class="message-bar" v-show="ui.success">',
        '       <div class="normal">{{ui.dictionary.recover.success}}</div>',
        '       <div class="normal"><p><router-link to="/login">{{ui.dictionary.login.prompt}}.</router-link></p></div>',
        '   </section>',
        '   <section class="form" v-show="!ui.success">',
        '       <form v-on:submit.prevent="setPassword(recover.password.value)">',
        '           <div class="input-field extra-space">',
        '               <input :placeholder="ui.dictionary.register.password" class="white" type="password" v-model="recover.password.value" v-bind:class="{ invalid : !recover.password.valid }" v-on:keyup="validatePassword()" v-on:blur="validatePassword(true)">',
        '               <label v-bind:class="{ filled: recover.password.value.length > 0 }">{{ui.dictionary.register.password}}</label>',
        '               <div class="warning" v-bind:class="{ show : !recover.password.valid }">{{ui.dictionary.general.validation.passwordEntropy}}</div>',
        '           </div>',
        '           <div class="input-field">',
        '               <input :placeholder="ui.dictionary.register.password2" class="white" type="password" v-model="recover.password2.value" v-bind:class="{ invalid : !recover.password2.valid }" v-on:keyup="verifyPassword()" v-on:blur="verifyPassword(true)">',
        '               <label v-bind:class="{ filled: recover.password2.value.length > 0 }">{{ui.dictionary.register.password2}}</label>',
        '               <div class="warning" v-bind:class="{ show : !recover.password2.valid }">{{ui.dictionary.register.passwordMatch}}</div>',
        '           </div>',
         '           <section class="toolbar">',
        '               <div class="float-right"><div class="working" v-show="ui.working"></div><button type="submit" class="accent" v-show="!ui.working">{{ui.dictionary.recover.reset}}</button></div>',
        '           </section>',
        '       </form>',
        '   </section>',
        
        '   </div>',
        
        '</article>'
    ].join("\n");
    
    /**
     * Data bindings
     */
    var bindings = function() {
        return {
            ui : {
                dictionary : DictionaryModel.getHash(),
                working : false,
                success : false,
                error : false
            },
            recover : {
                password : { value : '', valid : true },
                password2 : { value : '', valid : true }
            }
        };
    };
    
    /**
     * Methods
     */
    var methods = {
        getImage : function(file) {
            return new AssetModel(file).path;
        },
        
        /**
         * Validate password
         */
        validatePassword : function(force) {
            if (force || !this.recover.password.valid) {
                this.recover.password.valid = Validator.password(this.recover.password.value);
            }
            
            return this.recover.password.valid;
        },
        /**
         * Validate verification password
         * Make sure it matches the chosen password.
         */
        verifyPassword : function(force) {
            if (force || !this.recover.password2.valid) {
                this.recover.password2.valid = this.recover.password.value == this.recover.password2.value;
            }
            
            return this.recover.password2.valid;
        },
        /**
         * Set new password.
         */
        setPassword : function(password) {
            if ( !this.validatePassword(true) || !this.verifyPassword(true) ) {
                return false;
            }
            
            var scope = this;
            scope.ui.working = true;
            scope.ui.error = false;
            
            UserModel.fromRecovery(scope.$route.query.email, password, scope.$route.query.token)
                .then(function(response) {
                    if (response.success) {
                        scope.ui.success = true;
                    } else {
                        scope.ui.error = true;
                    }
                    
                    scope.ui.working = false;
                });
        },
        /**
         * Determine interface language.
         */
        setLanguage : function() {
            if (this.$route.query.language) {
                var scope = this;
                
                DictionaryModel.setLanguage(this.$route.query.language);
                DictionaryModel.fetchDictionary(true)
                    .then(function(dictionary) {
                        DictionaryModel.setHash(dictionary);
                        scope.ui.dictionary = DictionaryModel.getHash();
                    });
            }
        },
        /**
         * Check URL query parameters.
         */
        checkParams : function() {
            if (!this.$route.query.token || !this.$route.query.email) {
                //Silently push to login screen
                this.$router.push('/login');
            } else {
                this.setLanguage();
            }
        }
    };
    
    
    return Vue.extend({
        template : template,
        data : bindings,
        methods : methods,
        created : function() {
            this.checkParams();
        }
    });
});
