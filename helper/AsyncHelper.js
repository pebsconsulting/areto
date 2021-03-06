/**
 * @copyright Copyright (c) 2018 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

module.exports = class AsyncHelper {

    // SERIES

    static series (items, callback) {
        let result = items instanceof Array ? [] : {};
        if (!items) {
            return callback(null, result);
        }
        let keys = Object.keys(items);
        if (!keys.length) {
            return callback(null, result);
        }
        (new this({items, callback, keys, result})).series();
    }

    static eachSeries (items, handler, callback) {
        if (!(items instanceof Array) || !items.length) {
            return callback();
        }
        (new this({items, handler, callback})).eachSeries();
    }

    static eachOfSeries (items, handler, callback) {
        if (!items) {
            return callback();
        }
        let keys = Object.keys(items);
        if (!keys.length) {
            return callback();
        }
        (new this({items, handler, callback, keys})).eachOfSeries();
    }

    static mapSeries (items, handler, callback) {
        let result = [];
        if (!(items instanceof Array) || !items.length) {
            return callback(null, result);
        }
        (new this({items, handler, callback, result})).mapSeries();
    }

    static filterSeries (items, handler, callback) {
        let result = [];
        if (!(items instanceof Array) || !items.length) {
            return callback(null, result);
        }
        (new this({items, handler, callback, result})).filterSeries();
    }

    static someSeries (items, handler, callback) {
        if (!(items instanceof Array) || !items.length) {
            return callback(null, false);
        }
        (new this({items, handler, callback})).someSeries();
    }

    static mapValuesSeries (items, handler, callback) {
        let result = {};
        if (!items) {
            return callback(null, result);
        }
        let keys = Object.keys(items);
        if (!keys.length) {
            return callback(null, result);
        }
        (new this({items, handler, callback, keys, result})).mapValuesSeries();
    }

    static waterfall (items, callback) {
        if (!(items instanceof Array) || !items.length) {
            return callback();
        }
        (new this({items, callback})).waterfall();
    }

    // PARALLEL

    static each (items, handler, callback) {
        if (!(items instanceof Array) || !items.length) {
            return callback();
        }
        (new this({items, handler, callback, counter: 0})).each();
    }

    static parallel (items, callback) {
        let result = items instanceof Array ? [] : {};
        if (!items) {
            return callback(null, result);
        }
        let keys = Object.keys(items);
        if (!keys.length) {
            return callback(null, result);
        }
        (new this({items, callback, keys, result, counter: 0})).each();
    }

    //

    constructor (config) {
        Object.assign(this, config);
    }

    series (pos = 0) {
        this.items[this.keys[pos]]((err, value)=> {
            if (err) {
                return this.callback(err);
            }
            this.result[this.keys[pos]] = value;
            if (++pos === this.keys.length) {
                return this.callback(null, this.result);
            }
            this.series(pos);
        });
    }

    eachSeries (pos = 0) {
        this.handler(this.items[pos], err => {
           if (err) {
               return this.callback(err);
           }
           if (++pos === this.items.length) {
               return this.callback();
           }
           this.eachSeries(pos);
        });
    }

    eachOfSeries (pos = 0) {
        this.handler(this.items[this.keys[pos]], this.keys[pos], err => {
            if (err) {
                return this.callback(err);
            }
            if (++pos === this.keys.length) {
                return this.callback();
            }
            this.eachOfSeries(pos);
        });
    }

    mapSeries (pos = 0) {
        this.handler(this.items[pos], (err, value)=> {
            if (err) {
                return this.callback(err);
            }
            this.result.push(value);
            if (++pos === this.items.length) {
                return this.callback(null, this.result);
            }
            this.mapSeries(pos);
        });
    }

    filterSeries (pos = 0) {
        this.handler(this.items[pos], (err, value)=> {
            if (err) {
                return this.callback(err);
            }
            if (value) {
                this.result.push(value);
            }
            if (++pos === this.items.length) {
                return this.callback(null, this.result);
            }
            this.filterSeries(pos);
        });
    }

    someSeries (pos = 0) {
        this.handler(this.items[pos], (err, value)=> {
            if (err) {
                return this.callback(err);
            }
            if (value) {
                return this.callback(null, true);
            }
            if (++pos === this.items.length) {
                return this.callback(null, false);
            }
            this.someSeries(pos);
        });
    }

    mapValuesSeries (pos = 0) {
        this.handler(this.items[this.keys[pos]], this.keys[pos], (err, value)=> {
            if (err) {
                return this.callback(err);
            }
            this.result[this.keys[pos]] = value;
            if (++pos === this.keys.length) {
                return this.callback(null, this.result);
            }
            this.mapValuesSeries(pos);
        });
    }

    waterfall (result = [], pos = 0) {
        result.push((err, ...result)=> {
            if (err) {
                return this.callback(err);
            }
            if (++pos === this.items.length) {
                result.unshift(null);
                return this.callback.apply(this, result);
            }
            this.waterfall(result, pos);
        });
        this.items[pos].apply(this, result);
    }

    // PARALLEL

    each () {
        let process = err => {
            if (err || ++this.counter === this.items.length) {
                this.callback(err);
            }
        };
        for (let item of this.items) {
            this.handler(item, process);
        }
    }

    parallel () {
        let process = err => {
            if (err || ++this.counter === this.items.length) {
                this.callback(err);
            }
        };
        for (let key of this.keys) {
            this.items[key](this.processParallel.bind(this, key));
        }
    }

    processParallel (key, err, value) {
        if (err) {
            return this.callback(err);
        }
        this.result[key] = value;
        if (++this.counter === this.keys.length) {
            this.callback(null, this.result);
        }
    }
};