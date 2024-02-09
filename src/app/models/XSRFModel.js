/*global localStorage */

define([], function() {
    var xsrfToken = localStorage.getItem('xsrf-token') || false;
    
    return {
        /**
         * Set token.
         * 
         * @param string token The XSRF token to be used in requests.
         */
        set : function(token) {
            xsrfToken = token;
            localStorage.setItem('xsrf-token', token);
        },
        
        /**
         * Get token.
         * 
         * @return string The XSRF token to be used in requests.
         */
        get : function() {
            return xsrfToken;
        }
    };
});
