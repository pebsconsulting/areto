'use strict';

const Base = require('../base/Component');

module.exports = class Migration extends Base {

    constructor (config) {
        super(config);
        this.db = this.db || this.module.getDb();
    }

    apply (cb) {
        cb(); // apply this migration
    }

    revert (cb) {
        cb(null, false); // false - migration cant be reverted
    }
};