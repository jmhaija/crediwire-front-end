define([
    
    'q',
    'services/API',
    'models/CompanyModel',
    'models/ContextModel'
    
], function(q, API, CompanyModel, ContextModel) {
    var fetchData = function(url, p) {
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
    
    var combinePromises = function(promises) {
        var response = promises.shift();
        
        return q.allSettled(promises)
            .then(function(responses) {
                responses.forEach(function(additionalResp, responseKey) {
                    response.invoices = response.invoices.concat(additionalResp.value.invoices);
                });
                
                return response;
            });
    };
    
    return function(recipID, recipReference) {
        return {
            getDetails : function(from, to) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/invoice/recipient/'+recipID+'/all';
                    
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/invoice/recipient/'+recipID+'/all';
                }
                    
                url = url + '?page_size=100';
                
                if (from && to) {
                    url = url + 'from=' + from + '&to=' + to;
                } else if (from) {
                    url = url + 'from=' + from;
                } else if (to) {
                    url = url + 'to=' + to;
                }
                    
                var promises = [];
                return fetchData(url, 1)
                    .then(function(data) {
                            if (data.errors) {
                                return false;
                            }
                            
                            promises.push(data);
                            
                            if (data.last_page && data.last_page > 1) {
                                for (var p = 2; p <= data.last_page; p++) {
                                    var nextPromise = fetchData(url, p);
                                    promises.push(nextPromise);
                                }
                            }
                            
                            return combinePromises(promises);
                        });
            },
            
            getUnpaid : function(from, to) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/invoice/recipient/'+recipID+'/unpaid';
                    
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/invoice/recipient/'+recipID+'/unpaid';
                }
                
                url = url + '?page_size=100';
                
                if (from && to) {
                    url = url + 'from=' + from + '&to=' + to;
                } else if (from) {
                    url = url + 'from=' + from;
                } else if (to) {
                    url = url + 'to=' + to;
                }
                    
                var promises = [];
                return fetchData(url, 1)
                    .then(function(data) {
                            if (data.errors) {
                                return false;
                            }
                            
                            promises.push(data);
                            
                            if (data.last_page && data.last_page > 1) {
                                for (var p = 2; p <= data.last_page; p++) {
                                    var nextPromise = fetchData(url, p);
                                    promises.push(nextPromise);
                                }
                            }
                            
                            return combinePromises(promises);
                        });
            },
            
            getUnhandledTransactions : function(from, to) {
                var companyID = CompanyModel.getCompany().id;
                var contactID = recipReference ? recipReference : recipID;
                
                var url = '/company/'+companyID+'/contact/'+contactID+'/un-invoiced-transaction';
                    
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/contact/'+contactID+'/un-invoiced-transaction';
                }
                
                url = url + '?pageSize=100';
                
                if (from && to) {
                    url = url + '&from=' + from + '&to=' + to;
                } else if (from) {
                    url = url + '&from=' + from;
                } else if (to) {
                    url = url + '&to=' + to;
                }
                    
                var promises = [];
                return fetchData(url, 1)
                    .then(function(data) {
                            if (data.errors) {
                                return false;
                            }
                            
                            promises.push(data);
                            
                            if (data.last_page && data.last_page > 1) {
                                for (var p = 2; p <= data.last_page; p++) {
                                    var nextPromise = fetchData(url, p);
                                    promises.push(nextPromise);
                                }
                            }
                            
                            return combinePromises(promises);
                        });
            }
        };
    };
});
