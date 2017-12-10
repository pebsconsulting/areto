'use strict';

const Base = require('./RateLimitStore');

module.exports = class DbRateLimitStore extends Base {

    constructor (config) {
        super(Object.assign({
            db: config.rateLimit.module.getDb(),
            table: 'rate_limit'
        }, config));
    }

    find (type, user, cb) {
        let model = this.createModel({type, user});
        async.waterfall([
            cb => this.getQueryBy(type, user).one(cb),
            (doc, cb)=> {
                model.setData(doc);
                cb(null, model);
            }
        ], cb);
    }

    save (model, cb) {
        this.getQueryBy(model.type, model.user).upsert(model.getData(), cb);
    }

    getQueryBy (type, user) {
        let query = this.getQuery().where({type});
        return user.isAnonymous()
            ? query.and({
                ip: user.getIp(),
                userId: null
            })
            : query.and({
                userId: user.getId()
            });
    }

    getQuery () {
        return (new Query).db(this.db).from(this.table);
    }
};

const async = require('async');
const Query = require('../../db/Query');