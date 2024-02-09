define([
    
    'models/CompanyModel',
    'services/API'

], function(CompanyModel, API) {
    var token = JSON.parse(sessionStorage.getItem('invitation-token')) || null;
    var info = JSON.parse(sessionStorage.getItem('invitation-info')) || null;
    var connect = false;
    var companyUser = JSON.parse(sessionStorage.getItem('invitation-companyUser')) || false;
    
    return {
        markCompanyUser : function(val) {
           companyUser = val;
           sessionStorage.setItem('invitation-companyUser', JSON.stringify(val));
        },
        
        isCompanyUser : function() {
            return companyUser;
        },
        
        setToken : function(value) {
            token = value;
            sessionStorage.setItem('invitation-token', JSON.stringify(value));
        },
        
        getToken : function() {
            return token;
        },
        
        setInfo : function(value) {
            info = value;
            sessionStorage.setItem('invitation-info', JSON.stringify(value));
        },
        
        getInfo : function() {
            return info;
        },
        
        setConnect : function(value) {
            connect = value;
        },
        
        getConnect : function() {
            return connect;
        },
        
        parse : function(type) {
            return API.create('/parse-token', {
                type : type ? type : 'invitation',
                token : token
            }).then(function(resp) {
                    return resp.json();
                }, function(error) {
                    return error;
                });
        },
        
        process : function() {
            if (companyUser) {
                var id = info.company_id;
                var url = '/v2/company/'+id+'/process-user-invitation';
                
                return API.create(url, {
                    accepted : connect,
                    token : token,
                    email : info.email
                }).then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            } else {
                
                var id = CompanyModel.getCompany().id;
                var url = '/company/'+id+'/process-invitation';
                
                return API.create(url, {
                    accepted : connect,
                    token : token
                }).then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
                
            }
        },
        
        approveCompany : function (accept) {
            var id = info.company_id;
            var url = '/v2/company-approval';
                
                return API.create(url, {
                    accepted : accept,
                    token : token
                }).then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
        },
        
        decline : function(tkn, reason, presetReason) {
            if (companyUser) {
                var id = info.company_id;
                var url = '/v2/company/'+id+'/process-user-invitation';
                
                return API.create(url, {
                    accepted : connect,
                    token : token,
                    email : info.email,
                    decline_reason : (presetReason ? presetReason + '. ' : '') + reason
                }).then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            } else {
                return API.create('/decline-invitation', {
                    token : token,
                    reason : (presetReason ? presetReason + '. ' : '') + reason
                }).then(function(resp) {
                        return resp.json();
                    }, function(error) {
                        return error;
                    });
            }
        },
        
        forget : function() {
            token = false;
            info = false;
            connect = false;
            sessionStorage.removeItem('invitation-token');
            sessionStorage.removeItem('invitation-info');
            sessionStorage.removeItem('invitation-companyUser')
        }
    };
});
