define([

    'services/API',
    'models/CompanyModel'

], function(API, CompanyModel) {
    return {
        getDepartments : function() {
            var url = '/beta/company/' + CompanyModel.getCompany().id + '/department?page_size=100&page=1';
            
            return API.retrieve(url)
                .then(function(listResp) {
                    return listResp.json();
                }, function(err) {
                    return err;
                });
        }
    };
});
