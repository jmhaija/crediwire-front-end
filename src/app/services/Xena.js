define([

    'Vue',
    'services/Config',
    'services/API'

], function(Vue, Config, API) {
    return {
        getEntities : function(accessToken) {
            var headers = {
                "Authorization": "Bearer " + accessToken,
            };

            return Vue.http.get(Config.get('xenaApiUrl'), {
                method: 'GET',
                headers: headers
            }).then(function (response) {
                if (response.ok) {
                    return response.json();
                }

                return false;
            });
        },

        saveErp : function(companyId, code, id) {
            var url = '/company/' + companyId + '/erp';

            return API.create(url, {
                erp : 'xena',
                authentication : {
                    code : code,
                    id : id
                }
            }).then(function(resp) {
                return resp.json();
            }, function(error) {
                return error;
            });
        },

        reconnectErp : function(companyId, code, id) {
            var url = '/company/' + companyId + '/erp';

            return API.update(url, {
                erp : 'xena',
                authentication : {
                    code : code,
                    id : id
                }
            }).then(function(resp) {
                return resp.json();
            }, function(error) {
                return error;
            });
        }
    };
});
