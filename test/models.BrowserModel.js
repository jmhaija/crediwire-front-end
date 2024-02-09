require('./utils/define.js');
var assert = require('assert');
var BrowserModel = require('../src/app/models/BrowserModel');
global.navigator = {
    language : 'en-US',
    userAgent : 'Chrome'
};

describe('BrowserModel', function() {
    var bowserMock = {
        chrome : true,
        windows : true,
        version : '30.0',
        blink : true,
        a : true
    };

    var browser = BrowserModel(bowserMock);

    
    it('Language is defined', function() {
        assert.equal(browser.language, 'en-US');
    });
    
    
    it('UserAgent is defined', function() {
        assert.equal(browser.useragent, 'Chrome');
    });
    
    
    it('Defined browser flag', function() {
        assert.equal(browser.browser.chrome, true);
    });
    
    
    it('Undefined browser flag', function() {
        assert.equal(browser.browser.msie, undefined);
    });
    
    
    it('Defined OS flag', function() {
        assert.equal(browser.browser.windows, true);
    });
    
    it('Undefined OS flag', function() {
        assert.equal(browser.browser.linux, undefined);
    });
    
    it('Expected browser version', function() {
        assert.equal(browser.browser.version, '30.0');
    });
    
    it('Numerical browser version', function() {
        assert.equal(Number(browser.browser.version), 30);
    });
});
