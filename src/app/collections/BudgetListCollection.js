define([
    
    'services/API',
    'models/CompanyModel',
    'models/ContextModel'
    
], function(API, CompanyModel, ContextModel) {
    return {
        getBudgetList : function() {
            var companyID = CompanyModel.getCompany().id;
            var url = '/v2/company/'+companyID+'/budget';
            
            if (ContextModel.getContext()) {
                url = '/v2/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/budget';
            }
                
            return API.retrieve(url)
                .then(function(resp) {
                    return resp.json();
                }, function(error) {
                    return error;
                });
        },
        
        deleteBudgetPeriod : function (budgetID) {
            var companyID = CompanyModel.getCompany().id;
            var url = '/v2/company/'+companyID+'/budget/' + budgetID;
            
            if (ContextModel.getContext()) {
                url = '/v2/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/budget/' + budgetID;
            }
            
            return API.remove(url)
                .then(function(resp) {
                    return true;
                }, function(error) {
                    return error;
                });
        }
    };
});
