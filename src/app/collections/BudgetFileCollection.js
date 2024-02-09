define([

    'services/API',
    'models/CompanyModel',
    'models/ContextModel'

], function(API, CompanyModel, ContextModel) {
    return {
        getBudgetFiles: function () {
            var companyID = CompanyModel.getCompany().id;
            var url = '/beta/company/' + companyID + '/budget-file';

            if (ContextModel.getContext()) {
                url = '/beta/company/' + companyID + '/connection/see/' + ContextModel.getContext().id + '/budget-file';
            }

            return API.retrieve(url)
                .then(function (resp) {
                    return resp.json();
                }, function (error) {
                    return error;
                });
        },

        getBudgetNote(id) {
            if (ContextModel.getContext()) {
                const companyID = CompanyModel.getCompany().id;
                const connectionID = ContextModel.getContext().id;
                const url = `/beta/company/${companyID}/connection/see/${connectionID}/budget-file/${id}/budget-file-meta-info`;

                return API.retrieve(url)
                    .then(function (resp) {
                        return resp.json();
                    }, function (error) {
                        return error;
                    });
            }
        }
    }
})
