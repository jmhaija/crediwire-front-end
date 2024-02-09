/**
 * Configuration settings service.
 * 
 * This service takes a settings object and provides a generic
 * method to get/set the properties of this object.
 * 
 * Essentially this is a parameter bag, or a wrapper around a POJO.
 * This pattern allows for different setting values to be injected
 * depending on the application environment (development, testing,
 * production, or any other combination).
 */
define(function() {
    var configSettings = {};
    
    return {
        /**
         * Inject the settings object. This is the object where
         * all of the settings are stored as key value pairs.
         * 
         * @param settings JSON The settings object.
         */
        settings : function(settings) {
            configSettings = settings;
        },
        /**
         * Get a single settings value.
         * 
         * @param name string The name of the setting
         * @return mixed The value of the setting.
         */
        get : function(name) {
            return configSettings[name];
        },
        /**
         * Set a single settings value.
         * If setting name does not exist, it will be created.
         * 
         * @param name string The name of the setting.
         * @param value mixed The value of the setting.
         */
        set : function(name, value) {
            configSettings[name] = value;
        }
    };
});
