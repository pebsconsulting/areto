'use strict';

const Base = require('./Base');

module.exports = class Component extends Base {

    static getConstants () {
        return {
            BEHAVIORS: {
                //behavior1: require('./UserBehavior1'),
                //behavior2: { Class: require('./UserBehavior2'), prop1: ..., prop2: ... }
            }
        };
    }

    init () {
        this._events = {};
        this._behaviors = null;
    }

    // OBJECT-LEVEL SYNC/ASYNC EVENTS

    hasEventHandlers (name) {
        this.ensureBehaviors();
        return !!this._events[name] || ExtEvent.hasHandlers(this, name);
    }

    /**
     * @param data - get only with this handler
     */
    on (name, handler, data, prepend) {
        if (!name) {
            throw new Error(`${this.constructor.name}: Invalid event name`);
        }   
        if (typeof handler !== 'function') {
            throw new Error(`${this.constructor.name}: Invalid event handler`);
        }    
        this.ensureBehaviors();
        if (!this._events[name]) {
            this._events[name] = [];
        }
        // reverse order of addition, see trigger()
        prepend ? this._events[name].push([handler, data]) 
                : this._events[name].unshift([handler, data]);
    }

    off (name, handler) {
        this.ensureBehaviors();
        if (!this._events[name]) {
            return false;
        }
        if (handler) {
            let removed = false;
            for (let i = this._events[name].length - 1; i >= 0; --i) {
                if (this._events[name][i][0] === handler) {
                    this._events[name].splice(i, 1);
                    removed = true;    
                }
            }
            return removed;
        }
        delete this._events[name];
        return true;
    }

    trigger (name, event) {
        this.ensureBehaviors();
        if (this._events[name]) {
            event = ExtEvent.initEvent(event, this, name);
            // триггер может быть удален внутри хэндлера, изменится массив this._events[name]
            for (let i = this._events[name].length - 1; i >= 0; --i) {
                this._events[name][i][0](event, this._events[name][i][1]); // handler(event, data)
                if (event.handled) {
                    return;
                }
            }
        }        
        ExtEvent.trigger(this, name, event); // invoke class-level attached handlers
    }

    triggerCallback (name, cb, event) {
        let tasks = [];
        this.ensureBehaviors();
        if (this._events[name]) {
            event = ExtEvent.initEvent(event, this, name);
            this._events[name].forEach(function (handler) {
                tasks.push(function (cb) {
                    handler[0](event, cb, handler[1]); 
                });
            });
        }
        ExtEvent.triggerCallback(this, name, cb, event, tasks);
    }

    // BEHAVIORS

    getBehavior (name) {
        this.ensureBehaviors();
        return Object.prototype.hasOwnProperty.call(this._behaviors, name) ? this._behaviors[name] : null;
    }

    getBehaviors () {
        this.ensureBehaviors();
        return this._behaviors;
    }

    attachBehavior (name, behavior) {
        this.ensureBehaviors();
        return this.attachBehaviorInternal(name, behavior);
    }

    attachBehaviors (behaviors) {
        this.ensureBehaviors();
        for (let name of Object.keys(behaviors)) {
            this.attachBehaviorInternal(name, behaviors[name]);
        }
    }

    detachBehavior (name) {
        this.ensureBehaviors();
        if (!this._behaviors.hasOwnProperty(name)) {
            return null;
        }
        let behavior = this._behaviors[name];
        delete this._behaviors[name];
        behavior.detach();
        return behavior;
    }

    detachBehaviors () {
        this.ensureBehaviors();
        for (let name of Object.keys(this._behaviors)) {
            this.detachBehavior(name);
        }
    }

    ensureBehaviors () {
        if (!this._behaviors) {
            this._behaviors = {};
            for (let name of Object.keys(this.BEHAVIORS)) {
                this.attachBehavior(name, this.BEHAVIORS[name]);
            }    
        }
    }

    attachBehaviorInternal (name, behavior) {
        if (!behavior) {
            throw new Error(`${this.constructor.name}: Attach undefined behavior: ${name}`);
        }
        if (behavior.prototype instanceof Behavior) {
            behavior = new behavior({name});
        } else if (behavior.Class && behavior.Class.prototype instanceof Behavior) {
            behavior.name = behavior.name || name;
            behavior = new behavior.Class(behavior);
        } else {
            throw new Error(`${this.constructor.name}: Attach invalid behavior: ${name}`);
        }
        if (Object.prototype.hasOwnProperty.call(this._behaviors, name)) {
            this._behaviors[name].detach();
        }
        behavior.attach(this);
        this._behaviors[name] = behavior;
        return behavior;
    }
};

const async = require('async');
const ExtEvent = require('./ExtEvent');
const Behavior = require('./Behavior');