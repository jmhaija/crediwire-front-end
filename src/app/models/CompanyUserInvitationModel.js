define([
    
    'services/API',
    'models/CompanyModel',
    'models/ContextModel'
    
], function(API, CompanyModel, ContextModel) {
    return function(companyID, contextID) {
        return {
            inviteUser : function(invitationObject, make_owner, remove_inviter) {
                if (!companyID) {
                    companyID = CompanyModel.getCompany().id;
                }
                
                var url = '/v2/company/' + companyID + '/invitation/company-user';
                
                if (ContextModel.getContext()) {
                    url = '/v2/company/' + companyID + '/connection/see/'  + ContextModel.getContext().id + '/invitation/company-user';
                }
                
                if (contextID) {
                    url = '/v2/company/' + companyID + '/connection/see/'  + contextID + '/invitation/company-user';
                }
                
                if (make_owner) {
                    url = url + '?make_owner=1';
                    
                    if (remove_inviter) {
                        url = url + '&remove_inviter=1';
                    }
                }
                
                return API.create(url, invitationObject)
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            addEmail : function(userID, email) {
                if (!companyID) {
                    companyID = CompanyModel.getCompany().id;
                }
                
                
                var url = '/v2/company/' + companyID + '/invitation/company-user/'+userID+'/email';
                
                if (ContextModel.getContext()) {
                    url = '/v2/company/' + companyID + '/connection/see/'  +ContextModel.getContext().id + '/invitation/company-user/'+userID+'/email';
                }
                
                if (contextID) {
                    url = '/v2/company/' + companyID + '/connection/see/'  + contextID + '/invitation/company-user';
                }
                
                return API.create(url, {
                    email : email
                })
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            getEmail : function(userID) {
                var url = '/v2/company/' + CompanyModel.getCompany().id + '/invitation/company-user/'+userID+'/email';
                
                if (ContextModel.getContext()) {
                    url = '/v2/company/' + CompanyModel.getCompany().id + '/connection/see/'  +ContextModel.getContext().id + '/invitation/company-user/'+userID+'/email';
                }
                
                return API.retrieve(url)
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            delete : function(user) {
                var url = '/v2/company/' + CompanyModel.getCompany().id + '/invitation/company-user/' + user.id;
                
                if (ContextModel.getContext()) {
                    url = '/v2/company/' + CompanyModel.getCompany().id + '/connection/see/'  +ContextModel.getContext().id + '/invitation/company-user/' + user.id;
                }
               
                return API.remove(url)
                    .then(function(connResp) {
                        return true;
                    }, function(error) {
                        return error;
                    }); 
            },
        };
    };
});
