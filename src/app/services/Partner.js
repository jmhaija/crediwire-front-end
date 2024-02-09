/**
 * Wrapper service for partners config
 */
define([

    'services/Config',
    'config/partners'

], function (Config, partners) {

    var partnerList = null;
    var partnerCodes = null;

    return {

        /**
         * Get the partners list object.
         *
         * @return {object.<string, object>}
         */
        getList: function () {
            if (partnerList === null) {
                var list = Config.get('partnerList');
                partnerList = partners[list];
            }
            return partnerList;
        },

        /**
         * Check if partner exists
         *
         * @param {string} name
         * @return {boolean}
         */
        has: function (name) {
            return this.getList().hasOwnProperty(name);
        },

        /**
         * Get a partner
         *
         * @param {string} name
         *
         * @return {{id: string, code: string, name: string, lang: string, logo.string, support: boolean, connectString: string, connectRequired: boolean}|null}
         */
        get: function (name) {
            if (this.has(name)) {
                return this.getList()[name];
            }
            return null;
        },

        /**
         * Get all codes used by partners
         *
         * @return {array}
         */
        getCodes: function () {
            if (partnerCodes === null) {
                partnerCodes = [];
                for (var key in this.getList()) {
                    if (this.has(key)) {
                        partnerCodes.push(partnerList[key]['code']);
                    }
                }
            }
            return partnerCodes;
        }
    };

});
