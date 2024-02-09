define([

    'services/API',
    'models/CompanyModel',
    'models/ContextModel',
    'models/DateRangeModel'

], function(API, CompanyModel, ContextModel, DateRangeModel) {
    return function(kpiID) {
        return {
            create : function(def) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/kpi';
                
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/kpi';
                }
                
                return API.create(url, def)
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            
            save : function(def) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/kpi/'+kpiID;
                
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/kpi/'+kpiID;
                }
                
                return API.update(url, def)
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            
            delete : function() {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/kpi/'+kpiID;
                
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/kpi/'+kpiID;
                }
                
                return API.remove(url)
                    .then(function(resp) {
                        return true;
                    }, function(error) {
                        return error;
                    });
            },
            
            
            getData : function() {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/kpi/' + kpiID + '/data';
                
                var fromDate = DateRangeModel.getFromString();
                var toDate = DateRangeModel.getToString();
                var dataSize = 100;
                
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/kpi/' + kpiID + '/data';
                }
                
                url += '?aggregation=true&startDate=' + fromDate + '&endDate=' + toDate + '&size=' + dataSize + '&page=1&intervals=year';
                
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
