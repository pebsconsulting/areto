'use strict';

const Base = require('./Validator');

module.exports = class RelationValidator extends Base {

    static getConstants () {
        return {
            CHANGES: ['links', 'unlinks', 'removes']
        };
    }

    constructor (config) {
        super(Object.assign({
            allow: null, // allow changes ['unlinks', ...]
            deny: null
        }, config));
    }

    init () {
        super.init();
        if (this.allow && this.deny) {
            throw new Error(`${this.constructor.name}: Allowed only one permission`);
        }
        this.createMessage('message', 'Invalid relation request');
    }

    validateAttr (model, attr, cb) {
        this.validateValue(model.get(attr), (err, message, params, value)=> {
            if (err) {
                return cb(err);
            } else if (message) {
                this.addError(model, attr, message, params);
            } else {
                model.set(attr, value);
            }
            cb();
        });
    }

    validateValue (value, cb) {
        let error = false;
        if (!value) {
            cb(null, null, value);
        }
        try {            
            value = JSON.parse(value);
            for (let item of this.CHANGES) {
                for (let id of value[item]) {
                    if (!id || typeof id === 'object') {
                        return cb(null, this.message);
                    }
                }
            }
            this.filterValue(value);
            if (this.isIntersection(value)) {
                return cb(null, this.message);
            }
            cb(null, null, null, value);
        } catch (err) {
            cb(null, this.message);
        }
    }

    isIntersection (changes) {
        for (let link of changes.links) {
            if (changes.unlinks.includes(link) || changes.removes.includes(link)) {
                return true;
            }
        }
        for (let unlink of changes.unlinks) {
            if (changes.removes.includes(unlink)) {
                return true;
            }
        }
        return false;
    }

    filterValue (value) {
        if (this.allow) {
            for (let item of this.CHANGES) {
                if (!this.allow.includes(item)) {
                    value[item] = [];
                }
            }
        }
        if (this.deny) {
            for (let item of this.CHANGES) {
                if (this.deny.includes(item)) {
                    value[item] = [];
                }
            }
        }
    }
};
module.exports.init();