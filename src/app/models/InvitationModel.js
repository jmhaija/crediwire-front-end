define([
    
    'services/API',
    'models/CompanyModel',
    'models/ContextModel'
    
], function(API, CompanyModel, ContextModel) {
    return function(id) {
        return {
            createInvitation : function(data) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/invitation';
                    
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/invitation';
                }
                    
                return API.create(url, data)
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            update : function(data) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/invitation/'+id;
                    
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/invitation/'+id;
                }
                    
                return API.update(url, data)
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            delete : function() {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/invitation/' + id;
                    
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/invitation/' + id;
                }
                    
                return API.remove(url)
                    .then(function(resp) {
                        return resp;
                    }, function(error) {
                        return error;
                    });
            }
        }
    };
});
