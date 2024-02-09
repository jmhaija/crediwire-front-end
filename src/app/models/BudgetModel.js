define([

    'Vue',
    'moment',
    'services/API',
    'services/Config',
    'models/CompanyModel',
    'models/ContextModel',
    'models/XSRFModel'

], function (Vue, moment, API, Config, CompanyModel, ContextModel, XSRFModel) {
    var lastBudgetDate = false;

    return {
        getStatus : function () {
            var url = '/v2/company/' + CompanyModel.getCompany().id + '/erp/budget-status';

            if (ContextModel.getContext()) {
                url = '/v2/company/' + CompanyModel.getCompany().id + '/connection/see/'  +ContextModel.getContext().id + '/erp/budget-status';
            }

            return API.retrieve(url)
                .then(function(resp) {
                    return resp.json();
                }, function(error) {
                    return error;
                });
        },

        uploadFile({file, fileName}) {
            const formData = new FormData();
            formData.append('budget_file', file, file.name);
            formData.append('name', fileName);

            var url = `/beta/company/${CompanyModel.getCompany().id}/erp/budget-template-import`

            if (ContextModel.getContext()) {
                url = `/beta/company/${CompanyModel.getCompany().id}/connection/see/${ContextModel.getContext().id}/erp/budget-template-import`;
            }

            return Vue.http.post(Config.get('apiUrl') + url, formData, {
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

        renameFile({file, name}) {
            const url = `/beta/company/${CompanyModel.getCompany().id}/budget-file/${file.id}`;

            return Vue.http.patch(Config.get('apiUrl') + url, {name}, {
              headers : {
                'X-Xsrf-Token' : XSRFModel.get(),
                'X-Persist' : 'true'
              },
            credentials : Config.get('corsCredentials'),
          })
        },

        addBudgetFileNote({file, name}) {
            const connectionID = ContextModel.getContext().id;
            const url = `/beta/company/${CompanyModel.getCompany().id}/connection/see/${connectionID}/budget-file/${file.id}/budget-file-meta-info`;
            if(file.note) {
                return Vue.http.patch(Config.get('apiUrl') + url, {"note" : name}, {
                    headers : {
                        'X-Xsrf-Token' : XSRFModel.get(),
                        'X-Persist' : 'true'
                    },
                    credentials : Config.get('corsCredentials'),
                })
            } else {
                return Vue.http.post(Config.get('apiUrl') + url, {"note" : name}, {
                    headers : {
                        'X-Xsrf-Token' : XSRFModel.get(),
                        'X-Persist' : 'true'
                    },
                    credentials : Config.get('corsCredentials'),
                })
            }

        },

        upload : function (eventData) {
            var file = eventData.target.files[0];

            var formData = new FormData();
            formData.append('budget_file', file, file.name);

            var url = `/beta/company/${CompanyModel.getCompany().id}/erp/budget-template-import`;

            if (ContextModel.getContext()) {
                url = `/beta/company/${CompanyModel.getCompany().id}/connection/see/${ContextModel.getContext().id}/erp/budget-template-import`;
            }

            return Vue.http.post(Config.get('apiUrl') + url, formData, {
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



        download : function({date, precedingYears, forecastFinYears = 0, template, percentage = 0, cashbook = false, reclassified = true, bookkeepingValidDate, cashFlowAnalysis = false}) {
                if (!template) {
                    template = 'v1';
                }

                let url = `/beta/company/${CompanyModel.getCompany().id}/erp/budget-template-export`;

                if (ContextModel.getContext()) {
                    url = `/beta/company/${CompanyModel.getCompany().id}/connection/see/${ContextModel.getContext().id}/erp/budget-template-export`;
                }

                url = `${url}?template_name=${template}`;

                url = `${url}&cashbook=${cashbook}`;

                url = `${url}&start=${date}`;

                url = `${url}&percentage=${percentage}`;

                url = `${url}&bookkeeping_valid_date=${bookkeepingValidDate}`;

                url = `${url}&cash_flow_analysis=${cashFlowAnalysis}`;

                url = `${url}&preceding_financial_year=${precedingYears * -1}&forecast_financial_year=${forecastFinYears}`;

                return API.retrieve(url, true)
                    .then(function(resp) {
                        if (resp.ok) {
                            return resp.body;
                        } else {
                            return false;
                        }
                    }, function(error) {
                        return error;
                    });
        },

        setLastBudgetDate : function(d) {
            lastBudgetDate = moment(d).toDate();
        },

        getLastBudgetDate : function() {
            return lastBudgetDate;
        }
    };
});
