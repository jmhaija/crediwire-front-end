define([

    'services/API',
    'models/CompanyModel'

], function(API, CompanyModel, ContextModel) {
    return function(warnID) {
        return {
            createInclude : function(def) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/early-warning/' + warnID + '/include';
                
                return API.create(url, def)
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            createExclude : function(def) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/early-warning/' + warnID + '/exclude';
                
                return API.create(url, def)
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            },

            deleteInclude : function(includeID) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/early-warning/' + warnID + '/include/' + includeID;
                
                return API.remove(url)
                    .then(function(resp) {
                        return true;
                    }, function(error) {
                        return error;
                    });
            },
            
            deleteExclude : function(excludeID) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/early-warning/' + warnID + '/exclude/' + excludeID;
                
                return API.remove(url)
                    .then(function(resp) {
                        return true;
                    }, function(error) {
                        return error;
                    });
            }
        };
    };
});
