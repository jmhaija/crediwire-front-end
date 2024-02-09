/**
 * Model representing the current user of the application.
 */
define([

    'services/API',
    'models/CompanyModel',
    'models/ContextModel'

], function(API, CompanyModel, ContextModel) {
    var identified = false;
    var authenticated = false;
    var profile = {};
    var companyUser = {};

    return {
        /**
         * Returns whether a user has been identified.
         *
         * @return boolean True if ID'd, false otherwise
         */
        identified : function() {
            return identified;
        },

        /**
         * Returns whether a user has been authenticated.
         *
         * @return boolean True if authenticated, false otherwise
         */
        authenticated : function() {
            return authenticated;
        },

        /**
         * Returns the user's profile information.
         *
         * @return object The profile information.
         */
        profile : function() {
            return profile;
        },

        /**
         * Get session information on user by hitting the profile
         * end-point of the API.
         */
        fromSession : function() {
            return API.retrieve('/profile')
                .then(function(profileResp) {
                    return profileResp.json();
                }, function(error) {
                    return error;
                });
        },

        /**
         * Get the profile information by attempting an email/password
         * login on the API.
         */
        fromLogin : function(email, password) {
            return API.create('/login', {
                email : email,
                password : password
            }).then(function(loginResp) {
                return loginResp.json();
            }, function(error) {
                return error;
            });
        },


        /**
         * Get profile information by attempting a login_token login
         * to the API
         */
        fromLoginToken : function(token) {
            return API.create('/session', {
                grant_type : 'login_token',
                token : token
            }).then(function(loginResp) {
                return loginResp.json();
            }, function(error) {
                return error;
            });
        },

        /**
         * Get the profile information by attempting a provider/token
         * login to the API.
         */
        fromToken : function(provider, token) {
            return API.create('/login', {
                provider : provider,
                token : token
            }).then(function(loginResp) {
                return loginResp.json();
            }, function(error) {
                return error;
            });
        },

        /**
         * Register a user using a 3rd party token provider.
         */
        registerToken : function(provider, email, token) {
            return API.create('/register', {
                provider : provider,
                email : email,
                token : token
            }).then(function(regResp) {
                return regResp.json();
            }, function(error) {
                return error;
            });
        },

        /**
         * Get profile information by attempting to register
         * a new user account with the API.
         */
        fromRegister : function(email, password, language, settings, source) {
            return API.create('/register', {
                email : email,
                password : password,
                language : language,
                settings : settings,
                source : source
            }).then(function(loginResp) {
                return loginResp.json();
            }, function(error) {
                return error;
            });
        },

        /**
         * Get profile information from recovery token and password.
         *
         * @param string email The email address of the account.
         * @param string password The new password to set for the account.
         * @param string token The token to use to verify/authenticate account.
         * @return promise Result of request represented as a JSON object.
         */
        fromRecovery : function(email, password, token) {
            return API.create('/recover', {
                email : email,
                password : password,
                token : token
            }).then(function(recoverResp) {
                return recoverResp.json();
            }, function(error) {
                return error;
            });
        },


        /**
         * Check if the user exists given an email address
         */
        checkRegister : function(email) {
            return API.hardExists('/register', {
                email : email
            }).then(function(loginResp) {
                return loginResp.json();
            }, function(error) {
                return error;
            });
        },

        /**
         * Construct the user model based on given profile info.
         *
         * @param object profileInfo JSON representation of the profile information.
         */
        construct : function(profileInfo) {
            identified = true;
            authenticated = true;
            profile = profileInfo;
        },

        /**
         * Forget all user information and logout.
         *
         * @return boolean True on success, false otherwise.
         */
        forget : function() {
            identified = false;
            authenticated = false;
            profile = {};

            return API.create('/logout', {})
                .then(function(logoutResp) {
                    return logoutResp.json();
                }, function(error) {
                    return error;
                });
        },

        /**
         * Save user profile after changes are made.
         *
         * @return promise Result of save request represented as JSON object.
         */
        save : function() {
            return API.create('/profile', profile)
                .then(function(profileResp) {
                    return profileResp.json();
                }, function(error) {
                    return error;
                });
        },


        /**
         * Agree to new terms of service
         */
        agreeTos : function() {
            return API.create('/profile/agree-to-terms-of-service', {
                'agreed-to-latest-terms-of-service' : true
            })
                .then(function(profileResp) {
                    return profileResp.json();
                }, function(error) {
                    return error;
                });
        },

        agreeSpecTos : function() {
            return API.create('/profile/agree-to-terms-of-service', {
                'agreed-to-latest-terms-of-service' : true,
                'specific' : true
            })
                .then(function(profileResp) {
                    return profileResp.json();
                }, function(error) {
                    return error;
                });
        },

        /**
         * Fetch company user information
         */
        fetchCompanyUserInfo : function() {
            var id = CompanyModel.getCompany().id;
            var url = '/company/'+id+'/company-user/_self';

            /**
            if (ContextModel.getContext()) {
                url = '/company/'+id+'/connection/see/'+ContextModel.getContext().id+'/erp';
            }
            */

             return API.retrieve(url)
                .then(function(cuResp) {
                    return cuResp.json();
                }, function(error) {
                    return error;
                });
        },


        /**
         * Save company user information
         */
        saveCompanyUserInfo : function() {
            var id = CompanyModel.getCompany().id;
            var url = '/company/'+id+'/company-user/_self';

            /**
            if (ContextModel.getContext()) {
                url = '/company/'+id+'/connection/see/'+ContextModel.getContext().id+'/erp';
            }*/

             return API.update(url, companyUser)
                .then(function(cuResp) {
                    return cuResp.json();
                }, function(error) {
                    return error;
                });
        },

        /**
         * Set permissions
         */
        setCompanyUserInfo : function(cu) {
            companyUser = cu;
        },

        /**
         * Get permissions
         */
        getCompanyUserInfo : function() {
            return companyUser;
        },


        getDashboardPermissions : function() {
                var url = '/company/' + CompanyModel.getCompany().id + '/company-user/' + companyUser.id + '/dashboard-permission';

                if (ContextModel.getContext()) {
                    url = '/company/' + CompanyModel.getCompany().id + '/connection/see/'  +ContextModel.getContext().id + '/dashboard-permission';
                }

                return API.retrieve(url)
                    .then(function(connResp) {
                        return connResp.json();
                    }, function(error) {
                        return error;
                    }).catch(function(err) {
                        return {};
                    });
            },
    };
});
