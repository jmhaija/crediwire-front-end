define([
    
    'q',
    'services/API',
    'models/CompanyModel',
    'models/ContextModel',
    'models/DateRangeModel'
    
], function (q, API, CompanyModel, ContextModel, DateRangeModel) {
    var requestData = function(url, p) {
            url = url + '&page=' + p;
            
            return API.retrieve(url)
                .then(function(data) {
                    if (!data.body) {
                        data.bodyText = '{}';
                    }
                    return data.json();
                }, function(err) {
                    return err;
                });
        };
        
    var combinePromises = function(promises, interval) {
            var response = promises.shift();
            
            return q.allSettled(promises)
                .then(function(responses) {
                    responses.forEach(function(additionalResp, responseKey) {
                        if (additionalResp.value && additionalResp.value._embedded && additionalResp.value._embedded.items) {
                            response._embedded.items = response._embedded.items.concat(additionalResp.value._embedded.items);
                        }
                    });
                    
                    return response;
                });
        };
    
    var fetchData = function(endPoint, allowConnection, interval, type, fromDate, toDate, version) {
            var dataSize = 1000;

            //Build URL
            var url = '/v2/company/' + CompanyModel.getCompany().id;
                
            if (ContextModel.getContext() && allowConnection) {
                url = '/v2/company/' + CompanyModel.getCompany().id + '/connection/see/' + ContextModel.getContext().id;
            }
            
            url = url + '/' + endPoint + '?page_size=' + dataSize;
            
            
            if (fromDate && toDate) {
                url = url + '&start_date=' + fromDate + '&end_date=' + toDate;
            }
            
            
            if (interval) {
                url = url + '&interval=' + interval;
            }
            
            if (type) {
                url = url + '&type=' + type;
            }

            url = url + '&version=' + version;
            
            var promises = [];
            return requestData(url, 1)
                .then(function(data) {
                    if (data.errors) {
                        return false;
                    }
                        
                    promises.push(data);
                        
                    if (data.page_count && data.page_count > 1) {
                        for (var p = 2; p <= data.page_count; p++) {
                            var nextPromise = requestData(url, p);
                            promises.push(nextPromise);
                        }
                    }
                        
                    return combinePromises(promises, interval);
                });
        };
    
    
    return {
        getSalesPotentialCompany : function (fromDate, toDate, version) {
            return fetchData('sales-potential-company', true, false, false, fromDate, toDate, version)
                .then(function(data) {
                    return data;
                });
        },
        
        getSalesPotentialTotal : function () {
            return fetchData('sales-potential-total', true, false, false)
                .then(function(data) {
                    return data;
                });
        },
        
        
        getSalesPotentialTotalOverTime : function () {
            return fetchData('sales-potential-total-over-time', false, false, false)
                .then(function(data) {
                    return data;
                });
        },
        
        
        getSalesPotentialSumTotalOverTime : function () {
            return fetchData('sales-potential-sum-total-over-time', false, false, false)
                .then(function(data) {
                    return data;
                });
        },
    };
});
