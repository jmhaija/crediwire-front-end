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
                    response.contents = response.contents.concat(additionalResp.value.contents);
                });
                
                return response;
            });
    };
    
    return function() {
        return {
            getInvitations : function(includeAdmin) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/invitation';
                    
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/invitation';
                }
                
                url = url + '?size=100';
                
                if (includeAdmin) {
                    url = url + '&include=adminData';
                }
                 
                var promises = [];
                return fetchData(url, 1)
                    .then(function(data) {
                            if (data.errors) {
                                return false;
                            }
                            
                            promises.push(data);
                            
                            if (data.meta && data.meta.pagination && data.meta.pagination.maxPage && data.meta.pagination.maxPage > 1) {
                                for (var p = 2; p <= data.meta.pagination.maxPage; p++) {
                                    var nextPromise = fetchData(url, p);
                                    promises.push(nextPromise);
                                }
                            }
                            
                            return combinePromises(promises);
                        });
            },
            
            checkUnique : function (vat) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/v2/company/'+companyID+'/unique/company-invitation';
                
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/unique/company-invitation';
                }
                
                if (vat) {
                    url = url + '?vat=' + vat;
                }
                
                return API.retrieve(url)
                    .then(function(data) {
                        if (!data.body) {
                            data.bodyText = '{}';
                        }
                        return data.json();
                    }, function(err) {
                        return err;
                    });
            }
        };
    };
});
