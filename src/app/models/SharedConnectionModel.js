/**
 * Model representing a "show" connection.
 * This is a connection with whom data is shared.
 */
define([

    'services/API',
    'models/CompanyModel'

], function(API, CompanyModel) {
    return function(connectionID) {
        if (connectionID) {
            return API.retrieve('/company/' + CompanyModel.getCompany().id + '/connection/show' + connectionID)
                .then(function(connResp) {
                    return connResp.json();
                }, function(error) {
                    return error;
                });
        }
        
        
        return {
            request : function(company, targetID) {
                var compObj = company;
                
                if (typeof company != 'object') {
                    compObj = {
                        company : company,
                        permissionType : 'extended',
                        approved : true
                    };
                }
                
                if (!targetID) {
                    targetID = CompanyModel.getCompany().id;
                }
                
                return API.create('/company/' + targetID + '/connection/show', compObj)
                    .then(function(connResp) {
                        return connResp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            approve : function(id) {
                return API.update('/company/' + CompanyModel.getCompany().id + '/connection/show/' + id, {
                    approved : true
                }).then(function(connResp) {
                    return connResp.json();
                }, function(error) {
                    return error;
                });
            },
            
            decline : function(id) {
                return API.update('/company/' + CompanyModel.getCompany().id + '/connection/show/' + id, {
                    approved : false
                }).then(function(connResp) {
                    return connResp.json();
                }, function(error) {
                    return error;
                });
            },
            
            update : function(connection) {
                return API.update('/company/' + CompanyModel.getCompany().id + '/connection/show/' + connection.id, connection)
                    .then(function(connResp) {
                        return connResp.json();
                    }, function(error) {
                        return error;
                    });                    
            },
            
            getDashboardPermissions : function(id) {
                return API.retrieve('/company/' + CompanyModel.getCompany().id + '/connection/show/' + id + '/dashboard-permission')
                    .then(function(connResp) {
                        return connResp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            createDashboardPermission : function(connectionId, dashId) {
                return API.create('/company/' + CompanyModel.getCompany().id + '/connection/show/' + connectionId + '/dashboard-permission', {
                    dashboard : dashId
                }).then(function(connResp) {
                    return connResp.json();
                }, function(error) {
                    return error;
                });
            },
            
            deleteDashboardPermission : function(connectionId, dpId) {
                return API.remove('/company/' + CompanyModel.getCompany().id + '/connection/show/' + connectionId + '/dashboard-permission/'+dpId)
                    .then(function(connResp) {
                        return connResp.json();
                    }, function(error) {
                        return error;
                    });
            }
        };
    };
});
