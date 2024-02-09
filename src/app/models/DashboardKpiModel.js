define([

    'services/API',
    'models/CompanyModel',
    'models/ContextModel'

], function(API, CompanyModel, ContextModel) {
    return function(dashID, dashKpiID) {
        return {
            create : function(def, ignoreContext) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/dashboard/'+dashID+'/dashboard-kpi';
                
                if (ContextModel.getContext() && !ignoreContext) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/dashboard/'+dashID+'/dashboard-kpi';
                }
                
                return API.create(url, def)
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            update : function(dk) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/dashboard/'+dk.dashboard+'/dashboard-kpi/'+dk.id;
                
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/dashboard/'+dk.dashboard+'/dashboard-kpi/'+dk.id;
                }
                
                return API.update(url, dk)
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            delete : function(ignoreContext) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/dashboard/'+dashID+'/dashboard-kpi/'+dashKpiID;
                
                if (ContextModel.getContext() && !ignoreContext) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/dashboard/'+dashID+'/dashboard-kpi/'+dashKpiID;
                }
                
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
