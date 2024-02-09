/**
 * Model representing a company.
 */
define([
    'Vue',
    'moment',
    'services/API',
    'services/Config',
    'models/CompanyModel',
    'models/XSRFModel'
], function(Vue, moment, API, Config, CompanyModel, XSRFModel) {
    var company = sessionStorage.getItem('company') ? JSON.parse(sessionStorage.getItem('company')) : null;

    return {
        /**
         * Returns current company.
         *
         * @return object JSON object representing a company.
         */
        getCompany : function() {
            return company;
        },

        /**
         * Set company.
         *
         * @param object company JSON object representing a company.
         */
        setCompany : function(comp, store) {
            company = comp;
            sessionStorage.setItem('company', JSON.stringify(comp));
            localStorage.setItem('company', JSON.stringify(comp));

            if (store) {
                store.dispatch('setCompany', company);
            }

        },

        forgetCompany : function() {
            company = null;
            sessionStorage.removeItem('company');
            localStorage.removeItem('company');
        },

        /**
         * Get company from provided ID.
         *
         * @param string id The ID of the company.
         * @return promise The response represented by a JSON object.
         */
        fromID : function(id) {
            return API.retrieve('/company/'+id)
                .then(function(companyResp) {
                    return companyResp.json();
                }, function(error) {
                    return error;
                });
        },

        /**
         * Create company.
         *
         * @param string name The name of the company.
         * @param string vat The VAT of the company.
         * @return promise The result of the request.
         */
        createCompany : function(name, vat, industryCode, country, source) {
            if (sessionStorage.getItem('channel')) {
                source.channel = JSON.parse(sessionStorage.getItem('channel'));
            }

            return API.create('/company', {
                name : name,
                vat : vat.length === 0 ? null : vat,
                industryCode : industryCode,
                country : {
                    reference : country || 'denmark'
                },
                source : source
            }).then(function(compResp) {
                return compResp.json();
            }, function(error) {
                return error;
            });
        },


        createCompanyApproval : function (name, vat, requiresOwnerApproval) {
            return API.create('/company', {
                name : name,
                vat : vat.length === 0 ? null : vat,
                requiresOwnerApproval : requiresOwnerApproval
            }).then(function(compResp) {
                return compResp.json();
            }, function(error) {
                return error;
            });
        },


        /**
         * Save company
         *
         * @param string name The name of the company
         * @param string vat The VAT of the company
         * @param string bank The name of the company bank
         */
        saveCompany : function(name, vat, bank, country, companyID) {
            var cid = companyID || company.id;

            return API.update('/company/' + cid, {
                name : name,
                vat : vat,
                bank : bank,
                country : country
            }).then(function(compResp) {
                return compResp.json();
            }, function(error) {
                return error;
            });
        },

        agreeToDpa : function() {
            return API.update('/v2/company/' + company.id + '/agreement', {
                "data_processing_accept": true
            }).then(function(compResp) {
                return compResp.json();
            }, function(error) {
                return error;
            });
        },

        getDpa : function() {
            return API.retrieve('/v2/company/' + company.id + '/agreement')
                .then(function(compResp) {
                    return compResp.json();
                }, function(error) {
                    return error;
                });
        },

        deleteCompany : function() {
            return API.remove('/company/' + company.id)
                .then(function(connResp) {
                    return true;
                }, function(error) {
                    return error;
                });
        },

        uploadCompanyLogo(logo) {

            var url = '/beta/company/' + company.id + '/logo';
            let formData = new FormData();

            formData.append('logo_file', logo, logo.name);

            return Vue.http.post(Config.get('apiUrl') + url, formData, {
                headers : {
                    'X-Xsrf-Token' : XSRFModel.get(),
                    'X-Persist' : 'false'
                },
                credentials : Config.get('corsCredentials')
            }).then(function (response) {
                return response.json().then(({url}) => {
                   company.logo = url;
                });
            }, function (err) {
                return err;
            });
        },

        getCompanyLogo() {
            //beta/company/:companyId/logo
            var url = '/beta/company/' + company.id + '/logo';

            return API.retrieve(url)
                .then(function(connResp) {
                    return connResp.json();
                }, function(error) {
                    return error;
                });
        },

        deleteCompanyLogo() {
            var url = '/beta/company/' + company.id + '/logo';

            return API.remove(url)
                .then(function(connResp) {
                    return connResp.json();
                }, function(error) {
                    return error;
                });
        }
    };
});
