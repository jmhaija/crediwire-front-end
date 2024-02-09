define([
    
    'services/API'
    
], function(API) {
    return function() {
        return {
            getIndustryCodes : function(country) {
                if (!country) {
                    country = 'germany';
                }
                
                return API.retrieve('/industry-codes?country='+country)
                    .then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            }
        };
    };
});
