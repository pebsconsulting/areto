'use strict';

const expect = require('chai').expect;
const StringHelper = require('../../../helpers/StringHelper');

describe('helpers.string', ()=> {

    it('ucwords: capitalize first letters', ()=> {
        expect(StringHelper.ucwords('up first letters')).to.equal('Up First Letters');
    });

    it('camelize', ()=> {
        expect(StringHelper.camelize('test_block online')).to.equal('TestBlockOnline');
    });

    it('camelToWords', ()=> {
        expect(StringHelper.camelToWords('TestBlockOnline')).to.equal('Test Block Online');
    });

    it('camelToId', ()=> {
        expect(StringHelper.camelToId('TestBlockOnline')).to.equal('test-block-online');
    });

    it('idToCamel', ()=> {
        expect(StringHelper.idToCamel('test-block-online')).to.equal('TestBlockOnline');
    });

});