/* global localStorage */

define([

    'models/XSRFModel',
    'models/CompanyModel',
    'models/ErpModel',
    'models/ContextModel',
    'models/UserModel',
    'services/PersistentSettings'

], function(XSRFModel, CompanyModel, ErpModel, ContextModel, UserModel, PersistentSettings) {
    return {
        clearAllData : function(skipUserClear) {
            sessionStorage.removeItem('singleCompany');
            sessionStorage.removeItem('connections');
            localStorage.removeItem('client');

            XSRFModel.set(false);
            CompanyModel.forgetCompany();
            ErpModel.setErp(false);
            ContextModel.forgetContext();
            PersistentSettings.clearAllItems();

            if (!skipUserClear) {
                UserModel.forget();
            }
        }
    };
});
