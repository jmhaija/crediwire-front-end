define([

    'services/API',
    'models/CompanyModel',
    'models/ContextModel',
    'models/DateRangeModel'

], function(API, CompanyModel, ContextModel, DateRangeModel) {
    return function(id) {
        return {
            getExport : function() {
                var fromDate = DateRangeModel.getFromString();
                var toDate = DateRangeModel.getToString();
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/custom-export/'+id;

                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/custom-export/'+id;
                }

                url += '?startDate='+fromDate+'&endDate='+toDate;

                return API.retrieve(url, true)
                    .then(function(resp) {
                        return resp.body;
                    }, function(error) {
                        return error;
                    });
            },

            getDashboardExport : function (dashboardID, params) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/' + companyID + '/dashboard/' + dashboardID + '/export-excel';

                if (ContextModel.getContext()) {
                    url = '/company/' + companyID + '/connection/see/' + ContextModel.getContext().id + '/dashboard/' + dashboardID + '/export-excel';
                }
                
                var kpiIDS = [];
                for (var kpi in params.kpis) {
                    kpiIDS.push(params.kpis[kpi]);
                }

                url += '?startDate='+params.startDate+'&endDate='+params.endDate+'&intervals='+params.intervals+'&aggregations=false&cashbook='+params.cashbook+'&benchmark='+params.benchmark+'&previous='+params.previous+'&unit='+params.unit+'&budget='+params.budget+'&kpis='+kpiIDS.join(',');

                return API.retrieve(url, true)
                    .then(function(resp) {
                        return resp.body;
                    }, function(error) {
                        return error;
                    });
            },
            
            getDashboardDrilldownExport : function (drilldownID, params) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/kpi/' + drilldownID + '/export-excel';
                    
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/kpi/' + drilldownID + '/export-excel';
                }
                
                var kpiIDS = [];
                for (var kpi in params.kpis) {
                    kpiIDS.push(params.kpis[kpi]);
                }
                    
                url += '?startDate='+params.startDate+'&endDate='+params.endDate+'&intervals='+params.intervals+'&aggregations=false&cashbook='+params.cashbook+'&benchmark='+params.benchmark+'&previous='+params.previous+'&unit='+params.unit+'&budget='+params.budget+'&kpis='+kpiIDS.join(',');
   
                return API.retrieve(url, true)
                    .then(function(resp) {
                        return resp.body;
                    }, function(error) {
                        return error;
                    });
            },

            getFinancialReportExport : function(id, date_from, date_to, granularity, comparison, balance, cashbook, isReclassified) {
                var fromDate = date_from || DateRangeModel.getFromStringPadded();
                var toDate = date_to || DateRangeModel.getToStringPadded();
                var dataSize = 100;

                //Build URL
                var url = '/beta/company/' + CompanyModel.getCompany().id;

                if (ContextModel.getContext()) {
                    url = '/beta/company/' + CompanyModel.getCompany().id + '/connection/see/' + ContextModel.getContext().id;
                }

                url = url + '/data-export/' + (isReclassified ? 'reclassified' : 'bookkeeping') + '/category';

                if (id) {
                    url = url + '/' + id;
                }
                
                url = url + '?date_from=' + fromDate + '&date_to=' + toDate + '&page_size=' + dataSize + '&granularity=' + granularity + '&comparison=' + comparison + '&balance=' + balance + '&include_journal=' + cashbook;
                


                return API.retrieve(url, true)
                    .then(function(data) {
                        if (!data.body || data.status == 404) {
                            return false;
                        } else {
                            return data.body;
                        }
                    }, function(err) {
                        return err;
                    });
            }
        }
    };
});
