define([
    
    'services/API',
    'models/CompanyModel',
    'models/ContextModel'
    
], function (API, CompanyModel, ContextModel) {
    
    return {
        getUnpaidInvoices : function () {
            var url = '/company/' + CompanyModel.getCompany().id + '/invoice/unpaid';
                
            return API.retrieve(url)
                .then(function(data) {
                    if (!data.body) {
                        data.bodyText = '{}';
                    }
                    return data.json();
                }, function(err) {
                    return err;
                });
        },
        
        getCases : function() {
            var url = '/v2/company/' + CompanyModel.getCompany().id + '/debt-collector/invoice';
                
            return API.retrieve(url)
                .then(function(data) {
                    if (!data.body) {
                        data.bodyText = '{}';
                    }
                    return data.json();
                }, function(err) {
                    return err;
                });
        },
        
        
        getCollectorLink : function () {
            var url = '/v2/company/' + CompanyModel.getCompany().id + '/debt-collector';
                
            return API.retrieve(url)
                .then(function(data) {
                    if (!data.body) {
                        data.bodyText = '{}';
                    }
                    return data.json();
                }, function(err) {
                    return err;
                });
        },
        
        establishCollectorLink : function (collector, company_name, company_registration_number, address, zip_code, city, email, phone) {
            var url = '/v2/company/' + CompanyModel.getCompany().id + '/debt-collector';
                
            return API.create(url, {
                collector : collector,
                data : [
                    {
                        key : 'company_name',
                        value : company_name
                    },
                    {
                        key : 'company_registration_number',
                        value : company_registration_number
                    },
                    {
                        key : 'address',
                        value : address
                    },
                    {
                        key : 'zip_code',
                        value : zip_code
                    },
                    {
                        key : 'city',
                        value : city
                    },
                    {
                        key : 'email',
                        value : email
                    },
                    {
                        key : 'phone',
                        value : phone
                    }
                ]
            }).then(function(data) {
                    if (!data.body) {
                        data.bodyText = '{}';
                    }
                    return data.json();
                }, function(err) {
                    return err;
                });
        },
        
        startCase : function (id) {
            var url = '/v2/company/' + CompanyModel.getCompany().id + '/debt-collector/invoice';
                
            return API.create(url, {
                invoice : id
            }).then(function(data) {
                    if (!data.body) {
                        data.bodyText = '{}';
                    }
                    return data.json();
                }, function(err) {
                    return err;
                });
        }
    };
    
});
