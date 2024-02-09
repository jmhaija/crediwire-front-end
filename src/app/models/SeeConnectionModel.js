/**
 * Model representing a "see" connection.
 * This is a connection with whom data is shared.
 */
define([

    'services/API',
    'models/CompanyModel'

], function(API, CompanyModel) {
    return function(connectionID) {
        if (connectionID) {
            return API.retrieve('/company/' + CompanyModel.getCompany().id + '/connection/see/' + connectionID)
                .then(function(connResp) {
                    return connResp.json();
                }, function(error) {
                    return error;
                });
        }
        
        
        return {
            request : function(company) {
                var compObj = company;
                
                if (typeof company != 'object') {
                    compObj = {
                        company : company
                    };
                }
                
                return API.create('/company/' + CompanyModel.getCompany().id + '/connection/see', compObj)
                    .then(function(connResp) {
                        return connResp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            delete : function(id) {
                return API.remove('/company/' + CompanyModel.getCompany().id + '/connection/see/' + id)
                    .then(function(connResp) {
                        return true;
                    }, function(error) {
                        return error;
                    });
            },
            
            
            sendInvite : function(info) {
                return API.create('/company/' + CompanyModel.getCompany().id + '/connection/see/invite', info)
                    .then(function(connResp) {
                        return connResp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            getDashboardPermissions : function(id) {
                return API.retrieve('/company/' + CompanyModel.getCompany().id + '/connection/see/' + id + '/dashboard-permission')
                    .then(function(connResp) {
                        return connResp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            getCompanyInfo : function (id) {
                return API.retrieve('/company/' + CompanyModel.getCompany().id + '/connection/see/' + id + '?include=toCompany')
                    .then(function(connResp) {
                        return connResp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            changeDepartment : function (id, department) {
                return API.update('/beta/company/' + CompanyModel.getCompany().id + '/connection/see/' + id, {
                    department : department
                })
                    .then(function(connResp) {
                        return connResp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            getAdminData : function (id) {
                var url = '/company/' + CompanyModel.getCompany().id + '/connection/see/' + id + '?include=adminData';
                
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
        };
    };
});
