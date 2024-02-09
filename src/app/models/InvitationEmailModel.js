define([
    
    'moment',
    'services/API',
    'models/CompanyModel',
    'models/ContextModel'
    
], function(moment, API, CompanyModel, ContextModel) {
    return function(inviteId) {
        return {
            sendInvite : function(email, delay, template, linkOnly) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/invitation/'+inviteId+'/email';
                    
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/invitation/'+inviteId+'/email';
                }
                
                var obj = {
                    email : email,
                    send : true
                };
                
                if (linkOnly) {
                    obj.send = false;
                }
                
                if (delay) {
                    var date = moment();
                    obj.sendDate = date.format('YYYY') + '-' + date.format('MM') + '-' + date.format('DD');
                    obj.delay = delay;
                }
                
                if (template) {
                    obj.template = template;
                }
                
                return API.create(url, obj)
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            deleteInvite : function(emailId) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/invitation/'+inviteId+'/email/'+emailId;
                    
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/invitation/'+inviteId+'/email/'+emailId;
                }
                
                return API.remove(url)
                    .then(function(resp) {
                        return true;
                    }, function(error) {
                        return false;
                    });
            },
            
            changeEmail : function(emailId, email) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/invitation/'+inviteId+'/email/'+emailId;
                    
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/invitation/'+inviteId+'/email/'+emailId;
                }
                
                var obj = {
                    email : email
                };
                
                return API.update(url, obj)
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            }
        }
    };
});
