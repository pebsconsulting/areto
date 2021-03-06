/**
 * @copyright Copyright (c) 2018 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

module.exports = class MongoHelper {

    static isObjectId (id) {
        return id instanceof ObjectID;
    }

    static isValidId (id) {
        return ObjectID.isValid(id);
    }

    static createObjectId () {
        return new ObjectID;
    }
    
    static isEqual (id1, id2) {
        if (id1 instanceof ObjectID) {
            return id1.equals(id2);      
        }
        if (id2 instanceof ObjectID) {
            return id2.equals(id1);
        }
        return id1 === id2;
    }

    static indexOf (id, values) {
        if (!(values instanceof Array)) {
            return -1;
        }
        if (!(id instanceof ObjectID)) {
            return values.indexOf(id);
        }
        for (let i = 0; i < values.length; ++i) {
            if (id.equals(values[i])) {
                return i;
            }
        }
        return -1;
    }

    static diff (target, excluded) {
        return ArrayHelper.diff(target, excluded, this.indexOf);
    }

    static intersect (target, excluded) {
        return ArrayHelper.intersect(target, excluded, this.indexOf);
    }

    static uniqueStrict (target, excluded) {
        return ArrayHelper.uniqueStrict(target, excluded, this.indexOf);
    }

    static replaceMongoDataToJson (data) {
        data = data || {};
        for (let key of Object.keys(data)) {
            if (data[key] instanceof ObjectID) {
                data[key] = {
                    $oid: data[key].toString()
                };
            } else if (data[key] instanceof Date) {
                data[key] = {
                    $date: data[key].toISOString()
                };
            } else if (data[key] instanceof Object) {
                this.replaceMongoDataToJson(data[key]);
            }
        }
    }

    static replaceJsonToMongoData (data) {
        data = data || {};
        for (let key of Object.keys(data)) {
            if (data[key] && data[key] instanceof Object) {
                if (CommonHelper.isValidDate(data[key].$date)) {
                    data[key] = new Date(data[key].$date);
                } else if (ObjectID.isValid(data[key].$oid)) {
                    data[key] = ObjectID(data[key].$oid);
                } else {
                    this.replaceJsonToMongoData(data[key]);
                }
            }
        }
    }
};

const ObjectID = require('mongodb').ObjectID;
const ArrayHelper = require('./ArrayHelper');
const CommonHelper = require('./CommonHelper');