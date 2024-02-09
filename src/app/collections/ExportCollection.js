define([
    
    'services/API',
    'models/CompanyModel',
    'models/ContextModel'
    
], function(API, CompanyModel, ContextModel) {
    return function() {
        return {
            getExportList : function() {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/custom-export';
                    
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/custom-export';
                }
                    
                return API.retrieve(url)
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            }
        };
    };
});
