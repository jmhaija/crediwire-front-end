require('./utils/define.js');
var assert = require('assert');
var Partner = require('../src/app/services/Partner');


describe('Partner', function () {
    var ConfigMock = {
        get: function (name) {
            if (name === 'partnerList') {
                return 'partners';
            }
            return '';
        }
    };

    var testPartner1 = {
        code: "testCode1"
    };
    var testPartner2 = {
        code: "testCode2"
    };

    var partnerList = {
        testPartner1: testPartner1,
        testPartner2: testPartner2
    };

    var codeList = ["testCode1", "testCode2"];

    var partnersMock = {
        partners: partnerList
    };

    var partner = Partner(ConfigMock, partnersMock);


    it('Get list of partners', function () {
        assert.deepEqual(partner.getList(), partnerList);
    });

    it('Get partner', function () {
        assert.deepEqual(partner.get('testPartner1'), testPartner1);
    });

    it('Get invalid partner', function () {
        assert.equal(partner.get('not a partner'), null);
    });

    it('Has partner', function () {
        assert.equal(partner.has('testPartner1'), true);
    });

    it('Has partner invalid', function () {
        assert.equal(partner.has('not a partner'), false);
    });

    it('Get partner codes', function () {
        assert.deepEqual(partner.getCodes(), codeList);
    });

});
