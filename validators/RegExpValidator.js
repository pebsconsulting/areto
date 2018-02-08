'use strict';

const Base = require('./Validator');

module.exports = class RegExpValidator extends Base {

    static getConstants () {
        return {
            BUILTIN: {
            }
        };
    }

    constructor (config) {
        super(Object.assign({
            pattern: null,
            not: false // not match pattern
        }, config));
    }

    init () {
        super.init();
        if (!this.pattern) {
            throw new Error(`${this.constructor.name}: Not set pattern`);
        }
        if (typeof this.pattern === 'string') {
            if (!Object.prototype.hasOwnProperty.call(this.BUILTIN, this.pattern)) {
                throw new Error(`${this.constructor.name}: Not found built-in pattern: ${this.pattern}`);
            }
            this.pattern = this.BUILTIN[this.pattern];
        } else if (!(this.pattern instanceof RegExp)) {
            throw new Error(`${this.constructor.name}: Invalid pattern: ${this.pattern}`);
        }
    }

    getMessage () {
        return this.createMessage(this.message, 'Invalid value');
    }

    validateValue (value, cb) {
        let valid = true;
        if (typeof value !== 'string') {
            valid = false;
        } else if (this.pattern.test(value)) {
            valid = !this.not;
        } else {
            valid = !!this.not;
        }
        cb(null, valid ? null : this.getMessage());
    }
};
module.exports.init();