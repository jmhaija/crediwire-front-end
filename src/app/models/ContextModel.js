/**
 * Model representing a connection context
 */
define([

    'models/BudgetFileModel',
    'services/API'

], function(BudgetFileModel, API) {
    var connection = localStorage.getItem('context') ? JSON.parse(localStorage.getItem('context')) : (sessionStorage.getItem('context') ? JSON.parse(sessionStorage.getItem('context')) : null);
    
    return {
        /**
         * Returns current context.
         * 
         * @return object JSON object representing a connection.
         */
        getContext : function() {
            return connection;
        },
        
        /**
         * Set context.
         * 
         * @param object company JSON object representing a connection.
         */
        setContext : function(conn) {
            connection = conn;
            localStorage.setItem('context', JSON.stringify(conn));
        },
        
        
        forgetContext : function() {
            connection = null;
            localStorage.removeItem('context');
            BudgetFileModel.forgetBudgetFile();
        },
        
        /**
         * Get context from provided ID.
         * 
         * @param string company The ID of the company.
         * @param string connection The ID of the connection.
         * @return promise The response represented by a JSON object.
         */
        fromID : function(company, connection) {
            return API.retrieve('/company/'+company+'/connection/see/'+connection+'?include=company')
                .then(function(conResp) {
                    return conResp.json();
                }, function(error) {
                    return error;
                });
        },
        
        /**
         * Save company
         * 
         * @param string name The name of the company
         * @param string vat The VAT of the company
         * @param string bank The name of the company bank
         */
        saveContext : function(company, name, vat, bank, country) {
            return API.update('/company/' + company + '/connection/see/' + connection.id + '/company', {
                name : name,
                vat : vat,
                bank : bank,
                country : country
            }).then(function(compResp) {
                return compResp.json();
            }, function(error) {
                return error;
            });
        }
    };
});
