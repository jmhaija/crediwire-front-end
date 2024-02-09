/**
 * A module representing a collection of KPIs
 */
define([

    'services/API',
    'models/CompanyModel',
    'models/ContextModel'

], function(API, CompanyModel, ContextModel) {
    return function() {
        return {
            getUnits : function() {
                var url = '/company/' + CompanyModel.getCompany().id + '/unit?page=1&size=1000';
                
                if (ContextModel.getContext()) {
                    url = '/company/' + CompanyModel.getCompany().id + '/connection/see/'  + ContextModel.getContext().id + '/unit?page=1&size=1000';
                }
                
                return API.retrieve(url)
                    .then(function(listResp) {
                        return listResp.json();
                    }, function(err) {
                        return err;
                    });
            }
        };
    };
});
