define([
    
    'services/API'
    
], function(API) {
    var token = null;
    var info = {};
    
    return {
        makeApiCall : function(t) {
            token = t;
            
            return API.create('/v2/economic-self', {
                authentication : token
            }).then(function(recResp) {
                    return recResp.json();
                }, function(error) {
                    return error;
                });
        },
        
        setInfo : function(i) {
            info = i;
        },
        
        getInfo : function() {
            return info;
        },
        
        getToken : function() {
            return token;
        },
        
        forgetAll : function() {
            token = null;
            info = {};
        }
    };
});
