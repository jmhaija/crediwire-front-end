require('./utils/define.js');
var assert = require('assert');
var Validator = require('../src/app/services/Validator');


describe('Validator', function() {
    var validator = Validator();
    
    it('Valid email addresses', function() {
        assert.equal(validator.email('demo@demo.com'), true);
        assert.equal(validator.email('demo@demo.ca'), true);
        assert.equal(validator.email('æøå@demo.com'), true);
        assert.equal(validator.email('_!1*+-()&@demo.com'), true);
    });
    
    it('Invalid email addresses', function() {
        assert.equal(validator.email('demo@demo'), false);
        assert.equal(validator.email('demodemodemo'), false);
        assert.equal(validator.email('..@..'), false);
        assert.equal(validator.email('_____'), false);
        assert.equal(validator.email(''), false);
        assert.equal(validator.email(1234), false);
        assert.equal(validator.email('   '), false);
        assert.equal(validator.email('*&^$&#^%&#'), false);
    });
    
    
    it('Valid minLength', function() {
        assert.equal(validator.minLength('abcdefg', 3), true);
        assert.equal(validator.minLength('abc', 1), true);
        assert.equal(validator.minLength('a', 1), true);
        assert.equal(validator.minLength('', 0), true);
        assert.equal(validator.minLength('123535', 3), true);
        assert.equal(validator.minLength('*&*^%', 3), true);
    });
    
    
    it('Invalid minLength', function() {
        assert.equal(validator.minLength(123, 1), false);
        assert.equal(validator.minLength('', 1), false);
        assert.equal(validator.minLength('abcdefgh', 50), false);
        assert.equal(validator.minLength(123, 1), false);
    });
    
    
     it('Valid passwords', function() {
        assert.equal(validator.password('djiQd92mdi'), true);
        assert.equal(validator.password('1Qq0_(@%$'), true);
        assert.equal(validator.password('jjjjjjJJJJJJJJJ888888888'), true);
    });
    
    
    it('Invalid passwords', function() {
        assert.equal(validator.password('dQd92m'), false);
        assert.equal(validator.password('lowecaseonly'), false);
        assert.equal(validator.password('UPPERCASEONLY'), false);
        assert.equal(validator.password('1234567890'), false);
        assert.equal(validator.password('sfojpoje989'), false);
        assert.equal(validator.password(''), false);
        assert.equal(validator.password('$$$$$$$$$'), false);
    });
});
