define([

    'Vue',
    'services/API',
    'services/Config',
    'models/CompanyModel',
    'models/ContextModel',
    'models/XSRFModel',
    
], function(Vue, API, Config, CompanyModel, ContextModel, XSRFModel) {
    return {
        connect : function(id) {
            var companyID = id || CompanyModel.getCompany().id;
            var url = '/company/' + companyID + '/erp';
            
            if (ContextModel.getContext()) {
                url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/erp';
            }
            
            return API.create(url, {
                erp : 'c5',
                authentication : {}
            }).then(function(resp) {
                return resp.json();
            }, function(error) {
                return error;
            });
        },
        
        upload : function (eventData) {
            var file = eventData.target.files[0];
            var companyID = CompanyModel.getCompany().id;
            var url = '/company/' + companyID + '/erp/file';
            
            if (ContextModel.getContext()) {
                url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/erp/file';
            }

            var formData = new FormData();
            formData.append('erp_file', file, file.name);
            
            return Vue.http.post(Config.get('apiUrl') + url, formData, { 
                 headers : {
                    'X-Xsrf-Token' : XSRFModel.get(),
                    'X-Persist' : 'false'
                },
                credentials : Config.get('corsCredentials')
            }).then(function (response) {
                return true;
            }, function (err) {
                return err;
            });
            
        }
    };
});
