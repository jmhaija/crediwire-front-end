define([

    'services/API',
    'models/CompanyModel',
    'models/ContextModel'

], function(API, CompanyModel, ContextModel) {
    return {
        getAnnualReport : function() {
            var url = '/beta/company/' + CompanyModel.getCompany().id + '/annual-report';
            
            if (ContextModel.getContext()) {
                url = '/beta/company/' + CompanyModel.getCompany().id + '/connection/see/'  + ContextModel.getContext().id + '/annual-report';
            }
            
            url = url + '?sort=startDate';
                
            return API.retrieve(url)
                .then(function(listResp) {
                    return listResp.json();
                }, function(err) {
                    return err;
                });
        }
    };
});
