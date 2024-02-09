/**
 * Service for sending account recovery email.
 */
define([
    
    'services/API',
    'models/DictionaryModel'
    
], function(API, DictionaryModel) {
    return {
        /**
         * Send out recovery email with generated token.
         * 
         * @param string email The email address to which the token should be sent.
         * @return promise Result of the response represented as a JSON object.
         */
        send : function(email) {
            return API.create('/recover/generate', {
                email : email,
                language : DictionaryModel.getLanguage()
            }).then(function(recResp) {
                    return recResp.json();
                }, function(error) {
                    return error;
                });
        }
    };
});
