/**
 * A module representing a collection of companies.
 * 
 * Module can be instantiated with an object that has the following properties:
 * - type : can be '_all', '_owned', '_related'; this determined the category of companies to return
 * - query : optional string used for searching for company name
 */
define([
    
    'services/API'
    
], function(API) {
    return function(config) {
        var companies = {
            type : null,
            query : null
        };
        
        /**
         * Check if instance is passed configuration object.
         * Cannot use .assign() to merge because it is not supported
         * but IE. Instead, assign each property individually.
         */
        if (config.type) {
            companies.type = config.type;
        }
        
        if (config.query) {
            companies.query = config.query;
        }
        
        
        return {
            /**
             * Get list of companies.
             * 
             * @return promise Result of request represented as JSON object.
             */
            getCompanies : function() {
                var url = '/company';
                
                /**
                 * Add URL modifiers
                 */
                if (companies.type) {
                    url += '/' + companies.type;
                }
                
                if (companies.query) {
                    url += '?q=' + companies.query;
                }
                
                return API.retrieve(url)
                    .then(function(compResp) {
                        return compResp.json();
                    }, function(error) {
                        return error;
                    });
            }
        };
    };
});
