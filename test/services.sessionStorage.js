require('./utils/define.js');
var assert = require('assert');
var q = require('q');
var SessionStore = require('../src/app/services/SessionStore');
global.sessionStorage = require('localStorage'); //Use the same module as the browse API is identical

describe('SessionStore', function() {
    
    var mod = SessionStore(q);
    
    it('Create string value', function() {
        mod.create('ssString', 'Hello World')
            .then(function(response) {
                assert.equal(response.ok, true);
            });
    });
    
    
    it('Create numerical value', function() {
        mod.create('ssNumber', 34)
            .then(function(response) {
                assert.equal(response.ok, true);
            });
    });
    
    
    it('Create object value', function() {
        mod.create('ssObject', {
            key1 : 'foobar',
            key2 : 12.7,
            key3 : {
                sub : 'val'
            }
        }).then(function(response) {
                assert.equal(response.ok, true);
            });
    });
    
    
    it('Create existing value', function() {
        mod.create('ssString', 'Hello World')
            .then(function() {}, function(error) {
                assert.equal(error.response, 'resource_exists');
            });
    });
    

    
    it('Retrieve string value', function() {
        mod.retrieve('ssString')
            .then(function(response) {
                assert.equal(response.text(), 'Hello World');
            });
    });
    
    
    it('Retrieve numerical value', function() {
        mod.retrieve('ssNumber')
            .then(function(response) {
                assert.equal(response.text(), 34);
            });
    });
    
    
    it('Retrieve object value', function() {
        mod.retrieve('ssObject')
            .then(function(response) {
                var res = response.json();
                assert.equal(res.key1, 'foobar');
                assert.equal(res.key2, 12.7);
                assert.equal(res.key3.sub, 'val');
            });
    });
    
    
    it('Replace value', function() {
        mod.replace('ssObject', {
            key1 : 'baz'
        })
            .then(function(response) {
                var res = response.json();
                assert.equal(res.key1, 'baz');
            });
    });
    
    
    it('Replace non-existent value', function() {
        mod.replace('ssDoesNotExist', {
            key1 : 'baz'
        })
            .then(function() {}, function(error) {
                assert.equal(error.response, 'not_found');
            });
    });
    
    
    it('Update value', function() {
        mod.update('ssObject', {
            key2 : 'beep'
        })
            .then(function(response) {
                var res = response.json();
                assert.equal(res.key1, 'baz');
                assert.equal(res.key2, 'beep');
            });
    });
    
    
    it('Update non-existent value', function() {
        mod.update('ssDoesNotExist', {
            key1 : 'baz'
        })
            .then(function() {}, function(error) {
                assert.equal(error.response, 'not_found');
            });
    });
    
    
    it('Update type mismatched value', function() {
        mod.update('ssObject', 'String')
            .then(function() {}, function(error) {
                assert.equal(error.response, 'type_mismatch');
            });
    });
    
    
    it('Delete value', function() {
        mod.delete('ssNumber')
            .then(function(response) {
                assert.equal(response.ok, true);
            });
    });
    
    
    it('Delete non-existent value', function() {
        mod.delete('ssDoesNotExist')
            .then(function() {}, function(error) {
                assert.equal(error.response, 'not_found');
            });
    });
    
    
    it('Retrieve non-existent value', function() {
        mod.retrieve('ssNumber')
            .then(function() {}, function(error) {
                assert.equal(error.response, 'not_found');
            });
    });
    
    
    it('Check existence', function() {
        mod.exists('ssString')
            .then(function(response) {
                assert.equal(response.ok, true);
            });
    });
    
    
    it('Check non-existence', function() {
        mod.exists('doesNotExist')
            .then(function() {}, function(error) {
                assert.equal(error.response, 'not_found');
            });
    });
});
