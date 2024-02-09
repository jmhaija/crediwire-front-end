/**
 * A module representing a collection of dashboards
 */
define([

    'services/API',
    'models/CompanyModel',
    'models/ContextModel'

], function(API, CompanyModel, ContextModel) {
    return function(includeAll) {
        return {
            getDashboards : function() {
                var url = '/company/' + CompanyModel.getCompany().id + '/dashboard';

                if (ContextModel.getContext()) {
                    url = '/company/' + CompanyModel.getCompany().id + '/connection/see/' + ContextModel.getContext().id + '/dashboard';
                }

                if (includeAll) {
                    url = url + '/_all';
                }

                url = url + '?include=company,dashboardKpis,dashboardKpis.kpi,dashboardKpis.kpi.unit&page=1&size=1000';

                return API.retrieve(url)
                    .then(function(listResp) {
                        if (!listResp.body) {
                            listResp.bodyText = '[]';
                        }
                        return listResp.json();
                    }, function(err) {
                        return err;
                    });
            },

            getOwnDashboards : function(includeAll) {
                var url = '/company/' + CompanyModel.getCompany().id + '/dashboard';

                if (includeAll) {
                    url = url + '/_all';
                }

                url = url + '?include=company,dashboardKpis,dashboardKpis.kpi,dashboardKpis.kpi.unit&page=1&size=1000';

                return API.retrieve(url)
                    .then(function(listResp) {
                        return listResp.json();
                    }, function(err) {
                        return err;
                    });
            },

            getDashboardPermissions : function() {
                var url = '/company/' + CompanyModel.getCompany().id + '/connection/see/' + ContextModel.getContext().id + '/inverse-dashboard-permission';

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
