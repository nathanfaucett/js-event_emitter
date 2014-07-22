var shift = Array.prototype.shift,
    has = Object.prototype.hasOwnProperty;


function EventObject(listener, ctx) {
    this.listener = listener;
    this.ctx = ctx;
}


function EventEmitter() {

    this._events = {};
    this._maxListeners = EventEmitter.defaultMaxListeners;
}

EventEmitter.defaultMaxListeners = 10;

EventEmitter.prototype.on = function(type, listener, ctx) {
    if (typeof(listener) !== "function") throw new TypeError("EventEmitter.on(type, listener[, ctx]) listener must be a function");
    var events = this._events,
        event = (events[type] || (events[type] = [])),
        maxListeners = this._maxListeners;

    event.push(new EventObject(listener, ctx || this));

    if (maxListeners !== -1 && event.length > maxListeners) {
        console.error("EventEmitter.on(type, listener, ctx) possible EventEmitter memory leak detected. " + maxListeners + " listeners added");
    }

    return this;
};

EventEmitter.prototype.addListener = EventEmitter.prototype.on;

EventEmitter.prototype.once = function(type, listener, ctx) {
    var _this = this;
    ctx || (ctx = this);

    function once() {
        _this.off(type, once, ctx);
        var length = arguments.length;

        if (length === 0) {
            return listener.call(ctx);
        } else if (length === 1) {
            return listener.call(ctx, arguments[0]);
        } else if (length === 2) {
            return listener.call(ctx, arguments[0], arguments[1]);
        } else if (length === 3) {
            return listener.call(ctx, arguments[0], arguments[1], arguments[2]);
        } else if (length === 4) {
            return listener.call(ctx, arguments[0], arguments[1], arguments[2], arguments[3]);
        } else if (length === 5) {
            return listener.call(ctx, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
        }

        return listener.apply(ctx, arguments);
    }

    return this.on(type, once, ctx);
};

EventEmitter.prototype.listenTo = function(obj, type, listener, ctx) {
    if (!(has.call(obj, "on") && typeof(obj.on) === "function")) {
        throw new TypeError("EventEmitter.listenTo(obj, type, listener, ctx) obj must extend EventEmitter");
    }

    obj.on(type, listener, ctx || this);
    return this;
};

EventEmitter.prototype.off = function(type, listener, ctx) {
    if (typeof(listener) !== "function") throw new TypeError("EventEmitter.on(type, listener, ctx) listener must be a function");
    var thisEvents = this._events,
        events, event,
        i;

    if (!type) {
        for (var key in thisEvents) {
            if ((events = thisEvents[key])) events.length = 0;
        }

        return this;
    }

    events = thisEvents[type];
    if (!events) return this;

    if (!listener) {
        events.length = 0;
    } else {
        ctx = ctx || this;
        i = events.length;

        while (i--) {
            event = events[i];

            if (event.listener === listener && event.ctx === ctx) {
                events.splice(i, 1);
                break;
            }
        }
    }

    return this;
};

EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

EventEmitter.prototype.removeAllListeners = function() {
    var events = this._events,
        event;

    for (var key in events) {
        if ((event = events[key])) event.length = 0;
    }
};

EventEmitter.prototype.emit = function(type) {
    var events = this._events[type],
        a1, a2, a3, a4,
        length, event,
        i;

    if (!events || !events.length) return this;
    length = arguments.length;

    if (length === 1) {
        i = events.length;
        while (i--) {
            if ((event = events[i])) event.listener.call(event.ctx);
        }
    } else if (length === 2) {
        a1 = arguments[1];
        i = events.length;
        while (i--) {
            if ((event = events[i])) event.listener.call(event.ctx, a1);
        }
    } else if (length === 3) {
        a1 = arguments[1];
        a2 = arguments[2];
        i = events.length;
        while (i--) {
            if ((event = events[i])) event.listener.call(event.ctx, a1, a2);
        }
    } else if (length === 4) {
        a1 = arguments[1];
        a2 = arguments[2];
        a3 = arguments[3];
        i = events.length;
        while (i--) {
            if ((event = events[i])) event.listener.call(event.ctx, a1, a2, a3);
        }
    } else if (length === 5) {
        a1 = arguments[1];
        a2 = arguments[2];
        a3 = arguments[3];
        a4 = arguments[4];
        i = events.length;
        while (i--) {
            if ((event = events[i])) event.listener.call(event.ctx, a1, a2, a3, a4);
        }
    } else {
        shift.apply(arguments);
        i = events.length;
        while (i--) {
            if ((event = events[i])) event.listener.apply(event.ctx, arguments);
        }
    }

    return this;
};

EventEmitter.prototype.listeners = function(type) {
    if (typeof(type) !== "string") throw new TypeError("EventEmitter.listeners(type) must be a string");
    var events = this._events[type];

    return events ? events.length : 0;
};

EventEmitter.prototype.setMaxListeners = function(value) {
    if ((value = +value) !== value) throw new TypeError("EventEmitter.setMaxListeners(value) must be a number");

    this._maxListeners = value < 0 ? -1 : value;
    return this;
};

EventEmitter.extend = function(child, parent) {
    if (!parent) parent = this;

    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
    child.prototype._super = parent.prototype;
    child.extend = parent.extend;
    child._super = parent;

    return child;
};


module.exports = EventEmitter;
