require('./utils/define.js');
var assert = require('assert');
var Logger = require('../src/app/services/Logger');


describe('Logger', function() {
    var logger = Logger();
    it('Log messages', function() {
        // Muting console.log for the sake of this test
        var storedConsoleLog = console.log
        console.log = () => {}
        assert.equal(logger.log(true), true);
        assert.equal(logger.log(2), 2);
        assert.equal(logger.log('Hello World'), 'Hello World');
        // Unmuting console.log
        console.log = storedConsoleLog
    });
});
