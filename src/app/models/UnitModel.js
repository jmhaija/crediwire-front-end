define([

    'services/API',
    'models/CompanyModel',
    'models/ContextModel'

], function(API, CompanyModel, ContextModel) {
    return function(unitID) {
        return {
            create : function(def) {
                var companyID = CompanyModel.getCompany().id;
                var url = '/company/'+companyID+'/unit';
                
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/unit';
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
                var url = '/company/'+companyID+'/unit/'+unitID;
                
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/unit/'+unitID;
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
                var url = '/company/'+companyID+'/unit/'+unitID;
                
                if (ContextModel.getContext()) {
                    url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/unit/'+unitID;
                }
                
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
