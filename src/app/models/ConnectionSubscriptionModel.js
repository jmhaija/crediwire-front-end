define([
    
    'services/API',
    'models/CompanyModel',
    'models/UserModel'
    
], function(API, CompanyModel, UserModel) {
    return function(connID) {
        return {
            subscribe : function() {
                var companyID = CompanyModel.getCompany().id;
                var userID = UserModel.getCompanyUserInfo().id;
                
                var url = '/v2/company/'+companyID+'/company-user/'+userID+'/connection-subscription';
                
                return API.create(url, { connection : connID })
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            unsubscribe : function(subID) {
                var companyID = CompanyModel.getCompany().id;
                var userID = UserModel.getCompanyUserInfo().id;
                
                var url = '/v2/company/'+companyID+'/company-user/'+userID+'/connection-subscription/'+subID;
                
                return API.remove(url)
                    .then(function(resp) {
                        return true;
                    }, function(error) {
                        return error;
                    });
            }
        };
    };
});
