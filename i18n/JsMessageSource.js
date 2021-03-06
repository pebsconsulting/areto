/**
 * @copyright Copyright (c) 2018 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('./MessageSource');

module.exports = class JsMessageSource extends Base {

    constructor (config) {
        super(Object.assign({
            basePath: config.i18n.basePath
        }, config));
    }
    
    loadMessages (category, language) {
        try {
            return require(path.join(this.basePath, language, category));
        } catch (err) {
            this.log('warn', 'loadMessages', err);
            return {};
        }
    }
};

const path = require('path');