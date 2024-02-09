/**
 * Message logging service
 * 
 * This service simply provides an interface for logging messages.
 * Currently, these messages are simply output to the console.
 * In the future, messages can be relayed to an external service.
 */
define(function() {
    return {
        /**
         * Log message to the console.
         * 
         * @param string message The message to log.
         * @return string The message logged.
         */
        log : function(message) {
            console.log(message);
            return message;
        }
    };
});
