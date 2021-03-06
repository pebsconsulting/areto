/**
 * @copyright Copyright (c) 2018 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('../base/Component');

module.exports = class Rbac extends Base {

    static getConstants () {
        return {
            EVENT_AFTER_LOAD: 'afterLoad'
        };
    }

    constructor (config) {
        super(Object.assign({
            store: require('./FileStore'),
            Inspector: require('./Inspector'),
            Item: require('./Item')
        }, config));

        this.store = ClassHelper.createInstance(this.store, {
            rbac: this
        });
    }

    async init () {
        await PromiseHelper.setImmediate();
        await this.load();
    }

    async load () {
        if (this._loading) {
            throw new Error(this.wrapClassMessage('Loading in progress'));
        }
        try {
            this._loading = true;
            let data = await this.store.load();
            this._loading = false;
            this.build(data);
            await this.afterLoad();
            await PromiseHelper.setImmediate();
        } catch (err) {
            this._loading = false;
            throw err;
        }
    }

    afterLoad () {
        return this.triggerWait(this.EVENT_AFTER_LOAD);
    }

    build (data) {
        this.ruleMap = {};
        for (let name of Object.keys(data.rules)) {
            this.ruleMap[name] = ClassHelper.normalizeInstanceConfig(data.rules[name], {name});
        }
        this.resolveItemRules(data.items);
        this.itemMap = {};
        for (let name of Object.keys(data.items)) {
            this.itemMap[name] = new this.Item(Object.assign({
                rbac: this
            }, data.items[name]));
        }
        for (let id of Object.keys(data.items)) {
            this.resolveItemLinks(this.itemMap[id]);
        }
        this.assignmentIndex = data.assignments;
    }

    resolveItemRules (itemMap) {
        for (let item of Object.values(itemMap)) {
            let rule = item.rule;
            if (rule) {
                item.rule = Object.prototype.hasOwnProperty.call(this.ruleMap, rule)
                    ? this.ruleMap[rule]
                    : ClassHelper.normalizeInstanceConfig(rule);
            }
        }
    }

    resolveItemLinks (item) {
        if (!(item.children instanceof Array)) {
            return;
        }
        let children = [];
        for (let id of item.children) {
            if (!(this.itemMap[id] instanceof this.Item)) {
                throw new Error(this.wrapClassMessage(`Unknown child: ${id}`));
            }
            children.push(this.itemMap[id]);
            this.itemMap[id].addParent(item);
        }
        item.children = children;
    }

    findUserModel (name) {
        return this.module.components.user.UserModel.find({name});
    }

    getUserAssignments (userId) {
        return Object.prototype.hasOwnProperty.call(this.assignmentIndex, userId)
            ? this.assignmentIndex[userId]
            : null;
    }

    async can (assignments, itemId, params) {
        if (this._loading
            || !Object.prototype.hasOwnProperty.call(this.itemMap, itemId)
            || !assignments
            || !assignments.length) {
            return false;
        }
        let inspector = new this.Inspector({params});
        for (let assignment of assignments) {
            if (Object.prototype.hasOwnProperty.call(this.itemMap, assignment)) {
                inspector.assignment = this.itemMap[assignment];
                if (await inspector.execute(this.itemMap[itemId])) {
                    return true;
                }
            }
        }
    }

    // CREATE

    async createByData (data) {
        if (data) {
            await this.store.createRules(data.rules);
            await this.store.createItems(data.items);
            await this.store.createPermissionItems(data.permissions);
            await this.store.createRoleItems(data.roles);
            await this.store.createRouteItems(data.routes);
            await this.store.createAssignments(data.assignments);
        }
    }
};
module.exports.init();

const ClassHelper = require('../helper/ClassHelper');
const PromiseHelper = require('../helper/PromiseHelper');