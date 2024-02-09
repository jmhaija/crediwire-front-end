/**
 * A module representing a collection of KPIs
 */
define([

    'services/API',
    'models/CompanyModel',
    'models/ContextModel'

], function(API, CompanyModel, ContextModel) {
    return function() {
        return {
            getKpis : function(onlyOwned, ignoreContext) {
                var url = '/company/' + CompanyModel.getCompany().id + '/kpi?page=1&size=1000&include=unit';
                
                if (ContextModel.getContext() && !ignoreContext) {
                    url = '/company/' + CompanyModel.getCompany().id + '/connection/see/' + ContextModel.getContext().id + '/kpi?page=1&size=1000&include=unit';
                }
                
                if (!onlyOwned) {
                    url = url + '&system=true';
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
