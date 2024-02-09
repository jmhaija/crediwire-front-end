/**
 * Collection representing a list of languages.
 */
define([
    
    'Vue',
    'services/Config',
    'models/AssetModel'
    
], function(Vue, Config, AssetModel) {
    var list = [];
    
    return {
        /**
         * Fetch the language list from file source.
         * 
         * @return promise Callback to be invoked after fetch occurs.
         */
        fetchLanguages : function() {
            var file = new AssetModel(Config.get('dictionaryPath') + '/meta.json').path;
            
            if (list.length === 0) {
                return Vue.http.get(file)
                  .then(function (response) {
                    return response.json();
                  }, function (error) {
                    return error;
                  });
            }
        },
        
        /**
         * Set the language list.
         * 
         * @param object langs The language list.
         * @return boolean True on success, false on failure.
         */
        setList : function(langs) {
            list = langs;
            return true;
        },
        
        /**
         * Get the language list.
         * 
         * @return object The language list.
         */
        getList : function() {
            return list;
        }
    };
});
