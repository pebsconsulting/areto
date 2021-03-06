/**
 * @copyright Copyright (c) 2018 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('./Base');

module.exports = class Event extends Base {

    constructor (config) {
        super(Object.assign({
            name: null,
            sender: null,
            handled: false
        }, config));
    }

    // CLASS-LEVEL EVENTS

    static create (event, sender, name) {
        event = event || new this;
        event.sender = event.sender || sender;
        event.handled = false;
        event.name = name;
        return event;
    }

    static hasHandler (sender, name) {
        if (!(this._events[name] instanceof Array)) {
            return false;
        }
        if (typeof sender !== 'function') {
            sender = sender.constructor;
        }
        // check listeners of the sender class and parents 
        let id = sender.CLASS_FILE;
        while (id) {
            if (this._events[name][id] && this._events[name][id].length) {
                return true;
            }
            sender = Object.getPrototypeOf(sender);
            id = sender ? sender.CLASS_FILE : null;
        }
        return false;
    }
   
    static on (target, name, handler, data, prepend) {
        let id = target.CLASS_FILE;
        if (!id) {
            throw new Error(this.wrapClassMessage('Invalid event target'));
        }
        if (typeof name !== 'string') {
            throw new Error(this.wrapClassMessage('Invalid event name'));
        }
        if (typeof handler !== 'function') {
            throw new Error(this.wrapClassMessage('Invalid event handler'));
        }
        let event = this._events[name];
        if (!event) {
            this._events[name] = event = {};
        }
        event[id] = event[id] || [];
        // reverse order, see trigger()
        prepend ? event[id].push([handler, data]) 
                : event[id].unshift([handler, data]);
    }

    static off (target, name, handler) {
        let id = target.CLASS_FILE;
        let event = this._events[name];
        if (!id || !event || !event[id]) {
            return false;
        }
        if (!handler) {
            delete event[id];
            return true;
        }
        let removed = false;
        for (let i = event[id].length - 1; i >= 0; --i) {
            if (event[id][i][0] === handler) {
                event[id].splice(i, 1);
                removed = true;
            }
        }
        return removed;
    }

    static trigger (sender, name, event) {
        if (!this._events[name]) {
            return;
        }
        event = this.create(event, sender, name);
        if (typeof sender !== 'function') {
            sender = sender.constructor;
        }
        let id = sender.CLASS_FILE;
        while (id) {
            let handlers = this._events[name][id];
            if (handlers) {
                // trigger can be deleted inside the handler, array will change _events[name]
                for (let i = handlers.length - 1; i >= 0; --i) {
                    handlers[i][0](event, handlers[i][1]);
                    if (event.handled) {
                        return;
                    }
                }
            }
            sender = Object.getPrototypeOf(sender); // get parent class
            id = sender ? sender.CLASS_FILE : null;
        }
    }

    static async triggerWait (sender, name, event, tasks) {
        if (this._events[name]) {
            this.resolveTasks(sender, name, event, tasks);
        }
        if (tasks instanceof Array) {
            for (let task of tasks.reverse()) {
                await task();
            }
        }
    }

    static resolveTasks (sender, name, event, tasks) {
        event = this.create(event, sender, name);
        if (typeof sender !== 'function') {
            sender = sender.constructor;
        }
        let id = sender.CLASS_FILE;
        if (!id) {
            throw new Error(this.wrapClassMessage('Invalid event sender'));
        }
        tasks = tasks || [];
        while (id) {
            if (this._events[name][id] instanceof Array) {
                this._events[name][id].forEach(handler => {
                    tasks.push(()=> handler[0](event, handler[1]));
                });
            }
            sender = Object.getPrototypeOf(sender); // get parent class
            id = sender ? sender.CLASS_FILE : null;
        }
    }
};
module.exports._events = {};