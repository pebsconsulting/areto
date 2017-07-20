'use strict';

const Base = require('./Rule');
const MainHelper = require('../helpers/MainHelper');

module.exports = class AuthorRule extends Base {

    execute (user, cb, params) {
        cb(null, params && MainHelper.isEqual(user.getId(), params.authorId));
    }
};