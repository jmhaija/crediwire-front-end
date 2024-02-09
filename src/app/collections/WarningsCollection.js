define([
    
    'services/API',
    'models/CompanyModel'

], function(API, CompanyModel) {
    return function() {
        return {
            getWarnings : function() {
                var url = '/company/' + CompanyModel.getCompany().id + '/early-warning';
                
                return API.retrieve(url)
                    .then(function(resp) {
                        return resp.json();
                    }, function(err) {
                        return err;
                    }).catch(function(err) {
                        return {};
                    });
            },
            
            getInclude : function(warnID) {
                var url = '/company/' + CompanyModel.getCompany().id + '/early-warning/' + warnID + '/include';
                
                return API.retrieve(url)
                    .then(function(resp) {
                        return resp.json();
                    }, function(err) {
                        return err;
                    });
            },
            
            getExclude : function(warnID) {
                var url = '/company/' + CompanyModel.getCompany().id + '/early-warning/' + warnID + '/exclude';
                
                return API.retrieve(url)
                    .then(function(resp) {
                        return resp.json();
                    }, function(err) {
                        return err;
                    });
            },
            
            getConditions : function(warnID) {
                var url = '/company/' + CompanyModel.getCompany().id + '/early-warning/' + warnID + '/condition';
                
                return API.retrieve(url)
                    .then(function(resp) {
                        return resp.json();
                    }, function(err) {
                        return err;
                    });
            }
        };
    };
});
