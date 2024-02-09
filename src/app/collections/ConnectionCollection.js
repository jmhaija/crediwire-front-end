/**
 * A module representing a collection of connections
 */
define([

    'q',
    'services/API',
    'models/CompanyModel',
    'models/DateRangeModel',
    'models/ContextModel'

], function(q, API, CompanyModel, DateRangeModel, ContextModel) {
    

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
    
    
    return function(type) {
        return {
            getConnectionData : function (interval, reclassified) {
                var url = '/company/' + CompanyModel.getCompany().id + '/connection/see/data?include=company,warnings,warnings.values,warnings.earlyWarning&size=50';
                
                if (interval) {
                    url = url + '&interval=' + interval;
                }
                
                if (reclassified) {
                    url = url + '&reclassified=true';
                } else {
                    url = url + '&reclassified=false';
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
            
            getConnections : function(includeData, includeAdminData) {
                var url = '/company/' + CompanyModel.getCompany().id + '/connection/'+type;
                
                if (includeData) {
                    url = url +'/data?include=company,warnings,warnings.values,warnings.earlyWarning';
                } else {
                    if (type == 'see') {
                        url = url +'?include=company,company.erp,company.cvrCompanyInfo';
                        
                        /**
                        if (includeAdminData) {
                            url = url + ',adminData';
                        }
                        */
                    } else {
                        url = url +'?include=company';
                    }
                }
                

                if (includeData) {
                    var startDate = DateRangeModel.getFromString();
                    var endDate = DateRangeModel.getToString();
                    url = url + '&startDate='+startDate+'&endDate='+endDate;
                    url = url + '&size=50';
                } else {
                    url = url + '&size=1000';
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
            
            getConnectionInfo : function() {
                var url = '/company/' + CompanyModel.getCompany().id + '/connection';
                
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
            
            checkUnique : function (company) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/v2/company/'+companyID+'/unique/connection-' + type;
                
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/unique/connection-' + type;
                }
                
                if (company) {
                    url = url + '?company=' + company;
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
