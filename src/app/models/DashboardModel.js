define([

    'services/API',
    'models/CompanyModel',
    'models/ContextModel'

], function(API, CompanyModel, ContextModel) {
    return function(dashID) {
        return {
            create : function(def, ignoreContext) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/dashboard';
                
                if (ContextModel.getContext() && !ignoreContext) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/dashboard';
                }
                
                return API.create(url, def)
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            
            save : function(def, ignoreContext) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/dashboard/'+dashID;
                
                if (ContextModel.getContext() && !ignoreContext) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/dashboard/'+dashID;
                }
                
                return API.update(url, def)
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            
            delete : function(ignoreContext) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/dashboard/'+dashID;
                
                if (ContextModel.getContext() && !ignoreContext) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/dashboard/'+dashID;
                }
                
                return API.remove(url)
                    .then(function(resp) {
                        return true;
                    }, function(error) {
                        return error;
                    });
            },
            
            share : function() {
                var companyID = CompanyModel.getCompany().id;
                var contextID = ContextModel.getContext().id;
                
                var url = '/company/'+companyID+'/connection/see/'+contextID+'/inverse-dashboard-permission';
                
                 return API.create(url, {
                     dashboard : dashID
                 })
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            unshare : function(id) {
                var companyID = CompanyModel.getCompany().id;
                var contextID = ContextModel.getContext().id;
                
                var url = '/company/'+companyID+'/connection/see/'+contextID+'/inverse-dashboard-permission/'+id;
                
                 return API.remove(url)
                    .then(function(resp) {
                        return resp;
                    }, function(error) {
                        return error;
                    });
            }
        };
    };
});
