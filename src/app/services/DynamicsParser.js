define([
    
    'Vue',
    'services/API',
    'models/CompanyModel',
    'models/ContextModel'

], function(Vue, API, CompanyModel, ContextModel) {
    return {
        getCompanyInfo : function (username, key, env, domain) {
            return API.create('/v2/ms-dynamics-extra-info', {
                "environment": env,
                "domain_id": domain,
                "username": username,
                "web_service_key": key
            }).then(function(res) {
                return res.json();
            }, function(error) {
                return error;
            });
        },

        connectToDynamics : function (username, key, env, domain, company) {
            var id = CompanyModel.getCompany().id;
            var url = '/company/'+id+'/erp';
            if (ContextModel.getContext()) {
                url = '/company/'+id+'/connection/see/'+ContextModel.getContext().id+'/erp';
            }

            var erpObject = {
                erp : 'msdynamics',
                authentication : {
                    environment : env,
                    domain_id : domain,
                    username : username,
                    web_service_key : key,
                    dynamics_company_id : company,
                    currency : "DKK"
                },
                performVatCheck : true
            };

            return API.create(url, erpObject)
                .then(function(erpResp) {
                    return erpResp.json();
                }, function(error) {
                    return error;
                });
        }
    };
});
