define([
    
    'services/API',
    'models/CompanyModel',
    'models/UserModel'
    
], function(API, CompanyModel, UserModel) {
    return function() {
        return {
            getSubscriptions : function() {
                var companyID = CompanyModel.getCompany().id;
                var userID = UserModel.getCompanyUserInfo().id;
                
                var url = '/v2/company/'+companyID+'/company-user/'+userID+'/connection-subscription';
                
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
