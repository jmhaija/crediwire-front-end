define([

    'services/API',
    'models/CompanyModel'

], function(API, CompanyModel, ContextModel) {
    return function(warnID) {
        return {
            create : function(def) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/early-warning';
                
                return API.create(url, def)
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            
            save : function(def) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/early-warning/'+warnID;
                
                return API.update(url, def)
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            
            delete : function() {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/early-warning/'+warnID;
                
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
