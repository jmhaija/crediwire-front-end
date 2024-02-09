/**
 * A module representing a collection of accounts
 */
define([

    'services/API',
    'models/CompanyModel',
    'models/ContextModel'

], function(API, CompanyModel, ContextModel) {
    return function(includeAll) {
        return {
            getAccounts : function() {
                var url = '/company/' + CompanyModel.getCompany().id + '/erp/mapping';
                
                if (ContextModel.getContext()) {
                    url = '/company/' + CompanyModel.getCompany().id + '/connection/see/'  +ContextModel.getContext().id + '/erp/mapping';
                }
                
                if (includeAll) {
                    url = url + '?allAccounts=true';
                }
                
                return API.retrieve(url)
                    .then(function(accResp) {
                        if (!accResp.body) {
                            accResp.bodyText = '[]';
                        }
                        return accResp.json();
                    }, function(err) {
                        return err;
                    });
            },
            
            saveAccounts : function(map) {
                var url = '/company/' + CompanyModel.getCompany().id + '/erp/mapping';
                
                if (ContextModel.getContext()) {
                    url = '/company/' + CompanyModel.getCompany().id + '/connection/see/'  +ContextModel.getContext().id + '/erp/mapping';
                }
                
                return API.replace(url, map)
                    .then(function(saveResp) {
                        return saveResp.json();
                    }, function(err) {
                        return err;
                    });
            },
            
            validateAccounts : function() {
                var url = '/v2/company/' + CompanyModel.getCompany().id + '/mapping-validation';
                
                if (ContextModel.getContext()) {
                    url = '/v2/company/' + CompanyModel.getCompany().id + '/connection/see/'  +ContextModel.getContext().id + '/mapping-validation';
                }
                
                return API.create(url, {
                    approved : true
                }).then(function(saveResp) {
                    return saveResp.json();
                }, function(err) {
                    return err;
                });
            }
        };
    };
});
