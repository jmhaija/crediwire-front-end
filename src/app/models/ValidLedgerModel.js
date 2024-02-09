define([
    
    'q',
    'models/CompanyModel',
    'models/ContextModel',
    'services/API'
    
], function(q, CompanyModel, ContextModel, API) {
    var validDate = false;
    
    return {
        getDates : function () {
            var id = CompanyModel.getCompany().id;
            var url = '/v2/company/'+id+'/valid-ledger';
            
            if (ContextModel.getContext()) {
                url = '/v2/company/'+id+'/connection/see/'+ContextModel.getContext().id+'/valid-ledger';
            }
            
            url = url + '?sort=-created';
            
            return API.retrieve(url)
                .then(function(response) {
                    return response.json();
                }, function(error) {
                    return error;
                });
        },
        
        createDate : function(date) {
            var id = CompanyModel.getCompany().id;
            var url = '/v2/company/'+id+'/valid-ledger';
            
            if (ContextModel.getContext()) {
                url = '/v2/company/'+id+'/connection/see/'+ContextModel.getContext().id+'/valid-ledger';
            }
            
            return API.create(url, {
                date : date
            }).then(function(response) {
                return response.json();
            }, function(error) {
                return error;
            });
        },
        
        setValidDate : function(date) {
            validDate = date;
        },
        
        getValidDate : function() {
            return validDate;
        }
    };
});
