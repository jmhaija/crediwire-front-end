require('./utils/define.js');
var assert = require('assert');
var q = require('q');
var Cache = require('../src/app/services/Cache');

describe('Cache', function() {
    
    var mod = Cache(q);
    
    it('Create string value', function() {
        mod.create('testString', 'Hello World')
            .then(function(response) {
                assert.equal(response.ok, true);
            });
    });
    
    
    it('Create numerical value', function() {
        mod.create('testNumber', 34)
            .then(function(response) {
                assert.equal(response.ok, true);
            });
    });
    
    
    it('Create object value', function() {
        mod.create('testObject', {
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
        mod.create('testString', 'Hello World')
            .then(function() {}, function(error) {
                assert.equal(error.response, 'resource_exists');
            });
    });
    

    
    it('Retrieve string value', function() {
        mod.retrieve('testString')
            .then(function(response) {
                assert.equal(response.text(), 'Hello World');
            });
    });
    
    
    it('Retrieve numerical value', function() {
        mod.retrieve('testNumber')
            .then(function(response) {
                assert.equal(response.text(), 34);
            });
    });
    
    
    it('Retrieve object value', function() {
        mod.retrieve('testObject')
            .then(function(response) {
                var res = response.json();
                assert.equal(res.key1, 'foobar');
                assert.equal(res.key2, 12.7);
                assert.equal(res.key3.sub, 'val');
            });
    });
    
    
    it('Replace value', function() {
        mod.replace('testObject', {
            key1 : 'baz'
        })
            .then(function(response) {
                var res = response.json();
                assert.equal(res.key1, 'baz');
            });
    });
    
    
    it('Replace non-existent value', function() {
        mod.replace('testDoesNotExist', {
            key1 : 'baz'
        })
            .then(function() {}, function(error) {
                assert.equal(error.response, 'not_found');
            });
    });
    
    
    it('Update value', function() {
        mod.update('testObject', {
            key2 : 'beep'
        })
            .then(function(response) {
                var res = response.json();
                assert.equal(res.key1, 'baz');
                assert.equal(res.key2, 'beep');
            });
    });
    
    
    it('Update non-existent value', function() {
        mod.update('testDoesNotExist', {
            key1 : 'baz'
        })
            .then(function() {}, function(error) {
                assert.equal(error.response, 'not_found');
            });
    });
    
    
    it('Update type mismatched value', function() {
        mod.update('testObject', 'String')
            .then(function() {}, function(error) {
                assert.equal(error.response, 'type_mismatch');
            });
    });
    
    
    it('Delete value', function() {
        mod.delete('testNumber')
            .then(function(response) {
                assert.equal(response.ok, true);
            });
    });
    
    
    it('Delete non-existent value', function() {
        mod.delete('testDoesNotExist')
            .then(function() {}, function(error) {
                assert.equal(error.response, 'not_found');
            });
    });
    
    
    it('Retrieve non-existent value', function() {
        mod.retrieve('testNumber')
            .then(function() {}, function(error) {
                assert.equal(error.response, 'not_found');
            });
    });
    
    
    it('Check existence', function() {
        mod.exists('testString')
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
