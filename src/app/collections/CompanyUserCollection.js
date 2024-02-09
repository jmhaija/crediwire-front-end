/**
 * A module representing a collection of company users
 */
define([

    'services/API',
    'models/CompanyModel',
    'models/ContextModel'

], function(API, CompanyModel, ContextModel) {
    return function() {
        return {
            getUsers : function() {
                var url = '/company/' + CompanyModel.getCompany().id + '/company-user';
                
                if (ContextModel.getContext()) {
                    url = '/company/' + CompanyModel.getCompany().id + '/connection/see/'  +ContextModel.getContext().id + '/company-user';
                }
                
                url = url +'?page=1&size=1000';
                
                return API.retrieve(url)
                    .then(function(listResp) {
                        return listResp.json();
                    }, function(err) {
                        return err;
                    });
            },
            
            getRequests : function () {
                var url = '/v2/company/' + CompanyModel.getCompany().id + '/company-user-request';
                
                if (ContextModel.getContext()) {
                    url = '/v2/company/' + CompanyModel.getCompany().id + '/connection/see/'  +ContextModel.getContext().id + '/company-user-request';
                }
                
                url = url +'?page=1&size=1000&include=user';
                
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
