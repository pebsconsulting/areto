/**
 * @copyright Copyright (c) 2018 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('../base/Base');

module.exports = class L10nFileMap extends Base {

    constructor (config) {
        super(Object.assign({
            // baseDir: base path
            // localDir: localization path,
            required: false // require files
        }, config));

        try {
            this.createBaseMap();
            this.createLocalMap();
        } catch (err) {}
    }

    createBaseMap () {
        this._base = ClassHelper.createInstance(FileMap, {
            dir: path.join(this.baseDir),
            required: this.required
        });
    }

    createLocalMap () {
        this._locals = {};
        for (let name of fs.readdirSync(this.localDir)) {
            let dir = path.join(this.localDir, name);
            if (fs.lstatSync(dir).isDirectory()) {
                let map = ClassHelper.createInstance(FileMap, {dir});
                if (!map.isEmpty()) {
                    this._locals[name] = map;
                }
            }
        }
    }

    get (name, language) {
        return language && this.getLocal(name, language) || this._base.get(name);
    }

    getBase (name) {
        return this._base.get(name);
    }

    getLocal (name, language) {
        if (Object.prototype.hasOwnProperty.call(this._locals, language)) {
            return this._locals[language].get(name);
        }
    }

    isEmpty () {
        return this._base.isEmpty();
    }
};

const fs = require('fs');
const path = require('path');
const ClassHelper = require('../helper/ClassHelper');
const FileMap = require('../base/FileMap');
