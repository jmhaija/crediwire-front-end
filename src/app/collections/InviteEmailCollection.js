define([
    
    'services/API',
    'models/CompanyModel',
    'models/ContextModel'
    
], function(API, CompanyModel, ContextModel) {
    return function(inviteId) {
        return {
            getEmails : function() {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/invitation/'+inviteId+'/email';
                    
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/invitation/'+inviteId+'/email';
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
