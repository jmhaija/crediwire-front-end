define([
    
    'services/API'

], function(API) {
    return {
        getAll : function() {
            return API.retrieve('/app')
                .then(function(apps) {
                    return apps.json();
                }, function(err) {
                    return err;
                });
        },
        
        byID : function(id) {
            return API.retrieve('/app/' + id)
                .then(function(app) {
                    return app.json();
                }, function(err) {
                    return err;
                });
        },
        
        validateToken : function(id, token) {
            return API.create('/data-token/parse', {
                token : token,
                appId : id
            }).then(function(app) {
                return app.json();
            }, function(err) {
                return err;
            });
        }
    };
});
