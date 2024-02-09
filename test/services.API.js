/**
require('./utils/define.js');
var assert = require('assert');
var fetchMock = require('fetch-mock');
var API = require('../src/app/services/API');


fetchMock.get('/test-resource', 200);
fetchMock.get('/network-error', { throws: true });
fetchMock.head('/exists-resource', 200);
fetchMock.post('/post-request', 201);
fetchMock.put('/put-request', 200);
fetchMock.patch('/patch-request', 200);
fetchMock.delete('/delete-request', 200);
fetchMock.post('/bad-post-request', 405);
fetchMock.get('/non-existent', 404);
fetchMock.head('/does-not-exist', 404);


describe('API', function() {
    var ConfigMock = {
        get : function() {
            return '';
        }
    };
    
    var XSRFMock = {
        get : function() {}
    };

    var PartnerMock = {
        getCodes: function() {
            return [];
        }
    };
    
    var Raven = {
        captureMessage : function(msg) {
            return;
        }
    };

    var api = API(fetch, Raven, ConfigMock, XSRFMock, PartnerMock);
    
    
    it('Retrieve resource', function() {
        api.retrieve('/test-resource')
            .then(function(response) {
                assert.equal(response.status, 200);
            });
    });
    

    it('Retrieve non-existent resource', function() {
        api.retrieve('/non-existent')
            .then(function(response) {
                assert.equal(response.status, 404);
            });
    });
    
    
    
    it('Network error', function() {
        api.retrieve('/network-error')
            .then(function() {}, function(error) {
                assert.equal(error.response, 'NETWORK');
            });
    });
    
    
    
    it('Create resource', function() {
        api.create('/post-request', 'test')
            .then(function(response) {
                assert.equal(response.status, 201);
            });
    });
    
    
    
    it('Create resource without body', function() {
        api.create('/post-request')
            .then(function(response) {
                assert.equal(response.status, 405);
            });
    });
    
    
    it('Replace resource', function() {
        api.replace('/put-request', 'test')
            .then(function(response) {
                assert.equal(response.status, 200);
            });
    });
    
    
    it('Update resource', function() {
        api.update('/patch-request', 'test')
            .then(function(response) {
                assert.equal(response.status, 200);
            });
    });
    
    
    it('Delete resource', function() {
        API.remove('/delete-request', 'test')
            .then(function(response) {
                assert.equal(response.status, 200);
            });
    });
    
    
    it('Check if a resource exists', function() {
        api.exists('/exists-resource')
            .then(function(response) {
                assert.equal(response.status, 200);
            });
    });
    
    
    it('Check if a resource does not exist', function() {
        api.exists('/does-not-exist')
            .then(function(response) {
                assert.equal(response.status, 404);
            });
    });
});
*/
