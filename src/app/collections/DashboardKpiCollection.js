/**
 * A module representing a collection of dashboard KPIs
 */
define([

    'services/API',
    'models/CompanyModel',
    'models/ContextModel'

], function(API, CompanyModel, ContextModel) {
    return function(id) {
        return {
            getKpis : function(ignoreContext) {
                var url = '/company/' + CompanyModel.getCompany().id + '/dashboard/' + id + '/dashboard-kpi?page=1&size=1000';
                
                if (ContextModel.getContext() && !ignoreContext) {
                    url = '/company/' + CompanyModel.getCompany().id + '/connection/see/'  +ContextModel.getContext().id + '/dashboard/' + id + '/dashboard-kpi?page=1&size=1000';
                }
                
                return API.retrieve(url)
                    .then(function(listResp) {
                        return listResp.json();
                    }, function(err) {
                        return err;
                    });
            }
        };
    };
});
