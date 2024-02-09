define([
    
    'services/API',
    'models/CompanyModel',
    'models/ContextModel'
    
], function(API, CompanyModel, ContextModel) {
    return {
        getDepartmentsAll : function(from, to) {
            var url = '/v2/stats/company/' + CompanyModel.getCompany().id;
                
            if (ContextModel.getContext()) {
                //url = '/v2/stats/' + CompanyModel.getCompany().id + '/connection/see/'  +ContextModel.getContext().id;
                url = '/v2/stats/company/' + ContextModel.getContext().company.id;
            }
            
            url += '?type=department&from='+from+'&to='+to;
            
            return API.retrieve(url)
                .then(function(compResp) {
                    return compResp.json();
                }, function(error) {
                    return error;
                });
        },
        
        
        getUsersAll : function(from, to) {
            var url = '/v2/stats/company/' + CompanyModel.getCompany().id;
                
            if (ContextModel.getContext()) {
                //url = '/v2/stats/' + CompanyModel.getCompany().id + '/connection/see/'  +ContextModel.getContext().id;
                url = '/v2/stats/company/' + ContextModel.getContext().company.id;
            }
            
            url += '?type=company-user&from='+from+'&to='+to;
            
            return API.retrieve(url)
                .then(function(compResp) {
                    return compResp.json();
                }, function(error) {
                    return error;
                });
        },
        
        getDepartmentsDetails : function(deptID, from, to) {
            var url = '/v2/stats/company/' + CompanyModel.getCompany().id;
                
            if (ContextModel.getContext()) {
                //url = '/v2/stats/' + CompanyModel.getCompany().id + '/connection/see/'  +ContextModel.getContext().id;
                url = '/v2/stats/company/' + ContextModel.getContext().company.id;
            }
            
            url += '?type=company-user&type_id='+deptID+'&from='+from+'&to='+to;
            
            return API.retrieve(url)
                .then(function(compResp) {
                    return compResp.json();
                }, function(error) {
                    return error;
                });
        },
        
        getGoals : function() {
            var url = '/v2/stats/target/company/' + CompanyModel.getCompany().id;
                
            if (ContextModel.getContext()) {
                url = '/v2/stats/target/company/' + ContextModel.getContext().company.id;
            }
            
            return API.retrieve(url)
                .then(function(compResp) {
                    return compResp.json();
                }, function(error) {
                    return error;
                });
        },
        
        createGoal : function(goal) {
            var url = '/v2/stats/target/company/' + CompanyModel.getCompany().id;
                
            if (ContextModel.getContext()) {
                url = '/v2/stats/target/company/' + ContextModel.getContext().company.id;
            }
            
            return API.create(url, goal)
                .then(function(compResp) {
                    return compResp.json();
                }, function(error) {
                    return error;
                });
        },
        
        updateGoal : function(goalID, goal) {
            var url = '/v2/stats/target/company/' + CompanyModel.getCompany().id + '/' + goalID;
                
            if (ContextModel.getContext()) {
                url = '/v2/stats/target/company/' + ContextModel.getContext().company.id + '/' + goalID;
            }
            
            return API.update(url, goal)
                .then(function(compResp) {
                    return compResp.json();
                }, function(error) {
                    return error;
                });
        },
        
        deleteGoal : function(goalID) {
            var url = '/v2/stats/target/company/' + CompanyModel.getCompany().id + '/' + goalID;
                
            if (ContextModel.getContext()) {
                url = '/v2/stats/target/company/' + ContextModel.getContext().company.id + '/' + goalID;
            }
            
            return API.remove(url)
                .then(function(compResp) {
                    return true;
                }, function(error) {
                    return error;
                });
        },
    };
});
