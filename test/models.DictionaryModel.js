require('./utils/define.js');
var assert = require('assert');
var fetchMock = require('fetch-mock'); /*global fetch*/ /*Added globally with fetchMock*/
var DictionaryModel = require('../src/app/models/DictionaryModel');

fetchMock.get('/assets/dict/en-US.json', { "code" : "en-US",  "name" : "English (US)" });
fetchMock.get('/assets/dict/non-existent.json', { throws : true });

describe('DictionaryModel', function() {
    var ConfigMock = {
        get : function(setting) {
            return 'da-DK';
        }
    };
    
    var AssetModelMock = function(asset) {
        return {
            path : '/assets/dict/en-US.json'
        };
    };
    
    var SessionStoreMock = {
        retrieve : function(resource) {
            return {
                then : function(success, failure) {
                    //Bypass actual session storage
                    return failure();
                }
            };
        },
        create : function(resource, value) {},
        replace : function(resource, value) {}
    };
    
    
    var dictionary = DictionaryModel(fetch, SessionStoreMock, ConfigMock, AssetModelMock);


    /**
    it('Get default language', function() {
        assert.equal(dictionary.getLanguage(), 'da-DK');
    });
    */
    
    it('Set language', function() {
        assert.equal(dictionary.setLanguage('en-US'), true);
    });
    
    
    it('Get language', function() {
        assert.equal(dictionary.getLanguage(), 'en-US');
    });
    
    /**
    it('Fetch and set dictionary', function() {
        dictionary.fetchDictionary()
            .then(function(response) {
                dictionary.setHash(response.json());
                assert.equal(response.status, 200);
            });
    });
    
    
    it('Fetch undefined dictionary', function() {
        dictionary.setLanguage('non-existent');
        
        dictionary.fetchDictionary(true)
            .then(function(response) {
                assert.equal(response.status, 404);
            });
    });
    
    
    
    it('Get dictionary hash', function() {
        dictionary.setHash({ meta : { code : 'en-US' } });
        assert.equal(dictionary.getHash().meta.code, 'en-US');
    });
    
    
    it('Translate term using lex function', function() {
        assert.equal(dictionary.lex('meta.code'), 'en-US');
    });
    
    
    it('Translate nested term using lex function', function() {
        dictionary.setHash({
            key : {
                sub : {
                    subsub : {
                        test : 'Hello'
                    }
                }
            }
        });
        assert.equal(dictionary.lex('key.sub.subsub.test'), 'Hello');
    });
    */
});
