/**
 * Model representing a company user.
 */
define([

    'services/API',
    'models/CompanyModel',
    'models/ContextModel'

], function(API, CompanyModel, ContextModel) {
    return function() {
        return {
            create : function(user) {
                var url = '/company/' + CompanyModel.getCompany().id + '/company-user';
                
                if (ContextModel.getContext()) {
                    url = '/company/' + CompanyModel.getCompany().id + '/connection/see/'  +ContextModel.getContext().id + '/company-user';
                }
                
                return API.create(url, user)
                    .then(function(connResp) {
                        return connResp.json();
                    }, function(error) {
                        return error;
                    });
            },

            
            update : function(user) {
                var url = '/company/' + CompanyModel.getCompany().id + '/company-user/' + user.id;
                
                if (ContextModel.getContext()) {
                    url = '/company/' + CompanyModel.getCompany().id + '/connection/see/'  +ContextModel.getContext().id + '/company-user/' + user.id;
                }
               
                return API.update(url, user)
                    .then(function(connResp) {
                        return connResp.json();
                    }, function(error) {
                        return error;
                    });                    
            },
            
            delete : function(user) {
                var url = '/company/' + CompanyModel.getCompany().id + '/company-user/' + user.id;
                
                if (ContextModel.getContext()) {
                    url = '/company/' + CompanyModel.getCompany().id + '/connection/see/'  +ContextModel.getContext().id + '/company-user/' + user.id;
                }
               
                return API.remove(url)
                    .then(function(connResp) {
                        return true;
                    }, function(error) {
                        return error;
                    }); 
            },
            
            deleteSelf : function() {
                var url = '/v2/company/' + CompanyModel.getCompany().id + '/company-user/_self';
               
                return API.remove(url)
                    .then(function(connResp) {
                        return true;
                    }, function(error) {
                        return error;
                    }); 
            },
            
            getDashboardPermissions : function(id) {
                var url = '/company/' + CompanyModel.getCompany().id + '/company-user/' + id + '/dashboard-permission';
                
                if (ContextModel.getContext()) {
                    url = '/company/' + CompanyModel.getCompany().id + '/connection/see/'  +ContextModel.getContext().id  + '/dashboard-permission';
                }
                
                return API.retrieve(url)
                    .then(function(connResp) {
                        return connResp.json();
                    }, function(error) {
                        return error;
                    });
            },
            
            createDashboardPermission : function(userId, dashId) {
                var url = '/company/' + CompanyModel.getCompany().id + '/company-user/' + userId + '/dashboard-permission';
                
                if (ContextModel.getContext()) {
                    url = '/company/' + CompanyModel.getCompany().id + '/connection/see/'  +ContextModel.getContext().id  + '/dashboard-permission';
                }
                
                return API.create(url, {
                    dashboard : dashId
                }).then(function(connResp) {
                    return connResp.json();
                }, function(error) {
                    return error;
                });
            },
            
            deleteDashboardPermission : function(userId, dpId) {
                var url = '/company/' + CompanyModel.getCompany().id + '/company-user/' + userId + '/dashboard-permission/' + dpId;
                
                if (ContextModel.getContext()) {
                    url = '/company/' + CompanyModel.getCompany().id + '/connection/see/'  +ContextModel.getContext().id + '/dashboard-permission/' + dpId;
                }
                
                return API.remove(url)
                    .then(function(connResp) {
                        return true;
                    }, function(error) {
                        return error;
                    });
            },
            
            requestToBecomeUser : function (companyID) {
                var url = '/v2/company/' + companyID + '/company-user-request';
                
                return API.create(url, {})
                .then(function(connResp) {
                    return connResp.json();
                }, function(error) {
                    return error;
                });
            },
            
            acceptUserRequest : function (requestId) {
                var url = '/v2/company/' + CompanyModel.getCompany().id + '/company-user';
                return API.create(url, {
                    request : requestId
                })
                .then(function(connResp) {
                    return connResp.json();
                }, function(error) {
                    return error;
                });
            },
            
            declineUserRequest : function (requestId) {
                var url = '/v2/company/' + CompanyModel.getCompany().id + '/company-user-request/' + requestId;
                return API.remove(url)
                    .then(function(connResp) {
                        return true;
                    }, function(error) {
                        return error;
                    });
            }
        };
    };
});
