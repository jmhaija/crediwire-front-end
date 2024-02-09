define([

    'Vue',
    'services/API',
    'services/Config',
    'models/CompanyModel',
    'models/ContextModel',
    'models/XSRFModel',
    
], function(Vue, API, Config, CompanyModel, ContextModel, XSRFModel) {
    return {
        sendEmail : function(vat, id) {
            var companyID = id || CompanyModel.getCompany().id;
            var url = '/erp-connect';
            
            return API.create(url, {
                provider : 'seges',
                code : vat
            }).then(function(resp) {
                return resp.json();
            }, function(error) {
                return error;
            });
        },
        
        sendRequest : function(id) {
            var companyID = id || CompanyModel.getCompany().id;
            var url = '/company/' + companyID + '/erp';
            
            if (ContextModel.getContext()) {
                url = '/company/'+companyID+'/connection/see/'+ContextModel.getContext().id+'/erp';
            }
            
            return API.create(url, {
                erp : 'seges-contact',
                authentication : {
                    code : "seges"
                }
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
