/**
 * @copyright Copyright (c) 2018 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('../base/Base');

module.exports = class Serializer extends Base {

    stringify (value) {
        return value;
    }

    parse (value) {
        return value;
    }
};