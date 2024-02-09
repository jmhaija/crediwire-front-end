define([
    
    'services/API',
    'models/CompanyModel',
    'models/ContextModel'
    
], function(API, CompanyModel, ContextModel) {
    return {
        getStats : function() {
            var url = '/v2/company-stats';

            return API.retrieve(url)
                .then(function(compResp) {
                    return compResp.json();
                }, function(error) {
                    return error;
                });
        }
    };
});
