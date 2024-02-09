define([
    
    'services/API'
    
], function(API) {
    var countries = [];
    
    return {
        getCountries : function () {
            return countries;
        },
        
        setCountries : function (c) {
            countries = c;
        },
        
        fetchCountries : function() {
            return API.retrieve('/v2/country')
                .then(function(resp) {
                    return resp.json();
                }, function(error) {
                    return error;
                });
        }
    };
});
