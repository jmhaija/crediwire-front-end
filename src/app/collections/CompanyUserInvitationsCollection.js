define([

    'services/API',
    'models/CompanyModel',
    'models/ContextModel'

], function(API, CompanyModel, ContextModel) {
    return function() {
        return {
            getInvitations : function() {
                var url = '/v2/company/' + CompanyModel.getCompany().id + '/invitation/company-user';
                
                if (ContextModel.getContext()) {
                    url = '/v2/company/' + CompanyModel.getCompany().id + '/connection/see/'  +ContextModel.getContext().id + '/invitation/company-user';
                }
                
                url = url +'?page=1&size=1000'; //&include=emails';
                
                return API.retrieve(url)
                    .then(function(listResp) {
                        return listResp.json();
                    }, function(err) {
                        return err;
                    });
            }
        };
    };
});
