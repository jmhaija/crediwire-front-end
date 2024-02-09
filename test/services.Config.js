require('./utils/define.js');
var assert = require('assert');
var Config = require('../src/app/services/Config');

describe('Config', function() {
    var mockSettings = {
        key1 : 1,
        key2 : '2',
        key3 : false,
        obj : {
            objKey : [1,2,3]
        }
    };
    
    var config = Config();
    config.settings(mockSettings);
    
    it('Numerical setting', function() {
        assert.equal(config.get('key1'), 1);
    });
    
    it('String setting', function() {
        assert.equal(config.get('key2'), '2');
    });
    
    it('String to number setting', function() {
        assert.equal(Number(config.get('key2')), 2);
    });
    
    it('Boolean setting', function() {
        assert.equal(config.get('key3'), false);
    });
    
    it('Change setting', function() {
        config.set('key3', true);
        assert.equal(config.get('key3'), true);
    });
    
    it('Undefined setting', function() {
        assert.equal(config.get('key4'), undefined);
    });
    
    it('Create new setting', function() {
        config.set('key4', true);
        assert.equal(config.get('key4'), true);
    });
    
    it('Object setting', function() {
        assert.equal(typeof config.get('obj'), 'object');
    });
    
    it('Deep object setting', function() {
        assert.equal(config.get('obj').objKey[1], 2);
    });
    
    it('Change deep object setting', function() {
        var newObj = config.get('obj');
        newObj.objKey[1] = 5;
        config.set('obj', newObj);
        
        assert.equal(config.get('obj').objKey[1], 5);
    });
});
