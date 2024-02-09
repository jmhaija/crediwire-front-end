/**
 * Model representing a "see" connection.
 * This is a connection with whom data is shared.
 */
define([

    'services/API',
    'models/CompanyModel'

], function(API, CompanyModel) {
    return {
        checkUniqueness : function(connectionType, companyID) {
            
            return API.retrieve('/v2/company/' + CompanyModel.getCompany().id + '/unique/' + connectionType + '?company=' + companyID)
                .then(function(connResp) {
                    return connResp.json();
                }, function(error) {
                    return error;
                });
        }
    };
});
