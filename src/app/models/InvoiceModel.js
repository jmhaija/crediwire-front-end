define([
    
    'q',
    'services/API',
    'models/CompanyModel',
    'models/ContextModel'
    
], function(q, API, CompanyModel, ContextModel) {
    var mockData = function() {
        var d = q.defer();
        
        var data = JSON.parse('{"invoices":{"unpaid":352320.48,"overdue":352320.48,"overdue_15_days":352320.48}}');
        
        d.resolve(data);
        
        return d.promise;
    };
    
    return function() {
        return {
            getSummary : function(from, to, mock) {
                if (mock) {
                    return mockData();
                }
                
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/invoice/summary';
                    
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/invoice/summary';
                }
                
                if (from && to) {
                    url = url + '?from=' + from + '&to=' + to;
                } else if (from) {
                    url = url + '?from=' + from;
                } else if (to) {
                    url = url + '?to=' + to;
                }
                    
                return API.retrieve(url)
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    }).catch(function(err) {
                        return {};
                    });
            }
        }
    };
});
