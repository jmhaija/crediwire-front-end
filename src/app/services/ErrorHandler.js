define([
    'models/DictionaryModel',
    'services/Config',
    'services/Toast'
], function(DictionaryModel, Config, Toast) {
    return {
        /**
         * Handle error.
         *
         * The error handler behaves based on settings in
         * the application configurations.
         *
         * @param e Error Javascript error object.
         */
        handleError : function(e) {

            var errorMessage = DictionaryModel.getHash().general.errors.general;
            Toast.show(errorMessage, 'error');
            // Log error to console. This prints the
            // standard JS error trace to the console.
            if (Config.get('exposeErrors')) {
                console.error(e);
            }
            return e;
        }
    };
});
