'use strict';

const Base = require('./Validator');

module.exports = class EmailValidator extends Base {

    constructor (config) {
        super(Object.assign({
            pattern: '^[a-zA-Z0-9!#$%&\'*+\\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&\'*+\\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$',
            maxLength: 128
        }, config));
    }

    getMessage () {
        return this.createMessage(this.message, 'Invalid email');
    }

    validateValue (value, cb) {
        if (typeof value !== 'string' || value.length > this.maxLength) {
            return cb(null, this.getMessage());
        }
        if (!(new RegExp(this.pattern)).test(value)) {
            return cb(null, this.getMessage());
        }
        cb();
    }
};