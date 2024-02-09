define([
    
    'Vue',
    'services/Config',
    'models/XSRFModel',
    'models/CompanyModel',
    'models/ContextModel',
    'services/API'

], function(Vue, Config, XSRFModel, CompanyModel, ContextModel, API) {
    return {
        parse : function (eventData) {
            var file = eventData.target.files[0];

            var formData = new FormData();
            formData.append('file', file, file.name);
            
            return Vue.http.post(Config.get('apiUrl') + '/v2/inventio-parser', formData, { 
                 headers : {
                    'X-Xsrf-Token' : XSRFModel.get(),
                    'X-Persist' : 'false'
                },
                credentials : Config.get('corsCredentials')
            }).then(function (response) {
                return response.json();
            }, function (err) {
                return err;
            });
            
        },
        
        parseRefId : function (refId) {
            var url = '/v2/inventio-parser';
            
            return API.create(url, {
                refid : refId
            })
                .then(function(erpResp) {
                    return erpResp.json();
                }, function(error) {
                    return error;
                });
        },
        
        connect : function (erpObj, cid) {
            var id = cid || CompanyModel.getCompany().id;
            var url = '/company/'+id+'/erp';
            if (ContextModel.getContext()) {
                url = '/company/'+id+'/connection/see/'+ContextModel.getContext().id+'/erp';
            }
            
            return API.create(url, erpObj)
                .then(function(erpResp) {
                    return erpResp.json();
                }, function(error) {
                    return error;
                });
        }
    };
});
