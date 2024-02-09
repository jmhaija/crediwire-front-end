define([

    'models/UserModel'
    
], function(UserModel) {
    var keys = [];
    
    return {
        getItem : function(key) {
            return JSON.parse(sessionStorage.getItem(key));
            
            if (UserModel.getCompanyUserInfo()
                && UserModel.getCompanyUserInfo().settings
                && UserModel.getCompanyUserInfo().settings.stateSettings
                && UserModel.getCompanyUserInfo().settings.stateSettings[key]) {
                
                return UserModel.getCompanyUserInfo().settings.stateSettings[key];
            }
            
            return false;
        },
        
        setItem : function(key, value) {
            if (keys.indexOf(key) < 0) {
                keys.push(key);
            }
            
            sessionStorage.setItem(key, JSON.stringify(value));
            return true;
            
            if (!UserModel.getCompanyUserInfo()
                || !UserModel.getCompanyUserInfo().settings) {
                
                return false;
            }
            
            var userInfo = UserModel.getCompanyUserInfo();
            
            if (!userInfo.settings.stateSettings) {
                userInfo.settings.stateSettings = {};
            }
            
            if (userInfo.settings.stateSettings[key] !== value) {
                userInfo.settings.stateSettings[key] = value;
                
                UserModel.setCompanyUserInfo(userInfo);
                UserModel.saveCompanyUserInfo();
            }
        },
        
        clearAllItems : function() {
            keys.forEach(function(key) {
                sessionStorage.removeItem(key);
            });
        }
    };
});
