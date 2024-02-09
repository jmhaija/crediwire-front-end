require('./utils/define.js');
var assert = require('assert');
var fetchMock = require('fetch-mock'); /*global fetch*/ /*Added globally with fetchMock*/
var UserModel = require('../src/app/models/UserModel');


fetchMock.get('/profile', { firstname : 'Demo', lastname : 'Demoson' });
fetchMock.get('/login', { firstname : 'Demos', lastname : 'Demosons' });
fetchMock.get('/register', { firstname : 'RDemo', lastname : 'Registrar' });
fetchMock.get('/logout', {});


describe('UserModel', function() {
    /**
     * Expected user cases
     */
    var apiMock = {
        retrieve : function(url) {
            return fetch(url);
        },
        create : function(url) {
            return fetch(url, {}, { method : 'POST' });
        }
    };
    
    var user = UserModel(apiMock);
    
    it('User is not identified', function() {
        assert.equal(user.identified(), false);
    });
    
    
    it('User is not authenticated', function() {
        assert.equal(user.authenticated(), false);
    });
    
    
    it('User has empty profile', function() {
        assert.deepEqual(user.profile(), {});
    });
    
    
    it('Construct profile', function() {
        user.construct({test : 'value'});
        assert.equal(user.profile().test, 'value');
    });

    
    it('Get user from session', function() {
        user.forget();
        
        user.fromSession()
            .then(function(profile) {
                user.construct(profile);
                assert.equal(user.profile().firstname, 'Demo');
            });
    });


    it('Forget user', function() {
        user.forget();
        assert.equal(user.identified(), false);
        assert.equal(user.authenticated(), false);
        assert.deepEqual(user.profile(), {});
    });
    
    
    it('Get user from login', function() {
        user.forget();
        
        user.fromLogin('demo@crediwire.com', 'demo123456')
            .then(function(profile) {
                assert.equal(profile.firstname, 'Demos');
            });
    });
    
    
    it('Get user from token', function() {
        user.forget();
        
        user.fromToken('google', 'token_123456789')
            .then(function(profile) {
                assert.equal(profile.firstname, 'Demos');
            });
    });
    
    it('Get user from registration', function() {
        user.forget();
        
        user.fromRegister('demo@crediwire.com', 'demo123456')
            .then(function(profile) {
                assert.equal(profile.firstname, 'RDemo');
            });
    });
});
