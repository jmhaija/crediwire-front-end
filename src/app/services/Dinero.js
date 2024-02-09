define([
    
    'services/Config',
    'services/API',
    'models/CompanyModel',
    'models/ContextModel'
    
], function(Config, API, CompanyModel, ContextModel) {
    return {
        parseToken : function (token) {
            return API.create('/v2/dinero-parser', {
                code : token,
                visma_connect : true
            }).then(function(resp) {
                    return resp.json();
                }, function(error) {
                    return error;
                });
        },
        
        saveErp : function (companyID, token, entityID, currency) {
            var url = '/company/' + companyID + '/erp';
            
            if (ContextModel.getContext()) {
                url = '/company/' + CompanyModel.getCompany().id + '/connection/see/' + ContextModel.getContext().id + '/erp';
            }
            
            return API.create(url, {
                erp : 'dinero',
                authentication : {
                    encrypted_token : token,
                    organisation_id : entityID,
                    currency : currency,
                    visma_connect : true
                }
            }).then(function(resp) {
                return resp.json();
            }, function(error) {
                return error;
            });
        }
    };
});
