/**
 * Model representing a dictionary.
 */
define([
    
    'Vue',
    'moment',
    'services/LocalStore',
    'services/Config',
    'models/AssetModel'
    
], function(Vue, moment, LocalStore, Config, AssetModel) {
    var language = null;
    var hash = null;
    
    /**
     * Fetch dictionary file via HTTP/fetch()
     */
    var fetchHttp = function() {
        if (language === null) {
            language = Config.get('defaultLanguage');
        }
        
        var file = new AssetModel(Config.get('dictionaryPath') + '/' + language + '.json').path;
        return Vue.http.get(file)
          .then(function (response) {
            return response.json();
          }, function (error) {
            return error;
          });
    };
    
    return {
        /**
         * Get current language
         *
         * @return string The current language.
         */
        getLanguage : function() {
            if (language === null) {
                language = Config.get('defaultLanguage');
            }
            return language;
        },
        
        /**
         * Set the current language
         * 
         * @param string lang The ISO language code (ex: da-DK, en-US, etc.)
         * @return boolean True on success, false on failure
         */
        setLanguage : function(lang) {
            language = lang;
            return true;
        },
        
        /**
         * Fetch the dictionary from relevant source.
         * 
         * @param boolean forceHttp Flag to indicate that HTTP should be used to fetch dictionary even if it exists in cache
         * @return promise Callback to be invoked after fetch occurs.
         */
        fetchDictionary : function(forceHttp) {
            if (forceHttp) {
                return fetchHttp();
            }
            
            return LocalStore.retrieve('dictionary')
                .then(function(response) {
                    var dict = response.json();
                    if (dict.meta.version && dict.meta.version != Config.get('release')) {
                        return fetchHttp();
                    }
                    return dict;
                }, function(error) {
                    return fetchHttp();
                });
        },
        
        /**
         * Set the dictionary hash.
         * 
         * @param object dict The dictionary hash.
         * @return boolean True on success, false on failure.
         */
        setHash : function(dict) {
            if (hash === null) {
                LocalStore.create('dictionary', dict);
            } else {
                LocalStore.replace('dictionary', dict);
            }
            
            hash = dict;
            
            if (dict.shortcode == 'en') {
                moment.locale('en');
            } else {
                moment.locale('default', dict.locale);
            }
            
            return true;
        },
        
        /**
         * Get the dictionary hash.
         * 
         * @return object The dictionary hash.
         */
        getHash : function() {
            return hash;
        },
        
        /**
         * Get the lexicon value of the given key.
         * 
         * @param string key The lexicon term to return.
         * @return string The term as specified in the language.
         */
        lex : function(key) {
            if (key.indexOf('.') > 0) {
                var parts = key.split('.');
                var obj = hash;
                
                for (var i = 0; i < parts.length; i++) {
                    var idx = parts[i];
                    obj = obj[idx];
                }
                
                return obj;
            }
            
            return hash[idx];
        }
    };
});
