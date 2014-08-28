var arrayShift = Array.prototype.shift,
    hasOwnProperty = Object.prototype.hasOwnProperty;


function EventObject(listener, ctx) {
    this.listener = listener;
    this.ctx = ctx;
}


function EventEmitter() {

    this._events = Object.create(null);
    this._maxListeners = EventEmitter.defaultMaxListeners;
}

EventEmitter.prototype.on = function(type, listener, ctx) {
    if (typeof(listener) !== "function") throw new TypeError("EventEmitter.on(type, listener[, ctx]) listener must be a function");
    var events = this._events,
        eventList = (events[type] || (events[type] = [])),
        maxListeners = this._maxListeners;

    eventList.push(new EventObject(listener, ctx || this));

    if (maxListeners !== -1 && eventList.length > maxListeners) {
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
    if (!(hasOwnProperty.call(obj, "on") && typeof(obj.on) === "function")) {
        throw new TypeError("EventEmitter.listenTo(obj, type, listener, ctx) obj must have a on function taking (type, listener[, ctx])");
    }

    obj.on(type, listener, ctx || this);
    return this;
};

EventEmitter.prototype.off = function(type, listener, ctx) {
    var events = this._events,
        eventList, event, i;

    if (!type) return this.removeAllListeners();

    eventList = events[type];
    if (!eventList) return this;

    if (!listener) {
        i = eventList.length;
        while (i--) {
            event = eventList[i];
            this.emit("removeListener", type, event.listener, event.ctx);
        }
        eventList.length = 0;
        delete events[type];
    } else {
        ctx = ctx || this;
        i = eventList.length;
        while (i--) {
            event = eventList[i];

            if (event.listener === listener) {
                this.emit("removeListener", type, event.listener, event.ctx);
                eventList.splice(i, 1);
            }
        }
        if (eventList.length === 0) delete events[type];
    }

    return this;
};

EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

EventEmitter.prototype.removeAllListeners = function() {
    var events = this._events,
        eventList, event, i, type;

    for (type in events) {
        if ((eventList = events[type])) {
            i = eventList.length;
            while (i--) {
                event = eventList[i];
                this.emit("removeListener", type, event.listener, event.ctx);
            }
            eventList.length = 0;
            delete events[type];
        }
    }

    return this;
};

function emit(eventList, args) {
    var a1, a2, a3, a4,
        length = args.length,
        event, i;

    if (length === 1) {
        i = eventList.length;
        while (i--) {
            if ((event = eventList[i])) event.listener.call(event.ctx);
        }
    } else if (length === 2) {
        a1 = args[1];
        i = eventList.length;
        while (i--) {
            if ((event = eventList[i])) event.listener.call(event.ctx, a1);
        }
    } else if (length === 3) {
        a1 = args[1];
        a2 = args[2];
        i = eventList.length;
        while (i--) {
            if ((event = eventList[i])) event.listener.call(event.ctx, a1, a2);
        }
    } else if (length === 4) {
        a1 = args[1];
        a2 = args[2];
        a3 = args[3];
        i = eventList.length;
        while (i--) {
            if ((event = eventList[i])) event.listener.call(event.ctx, a1, a2, a3);
        }
    } else if (length === 5) {
        a1 = args[1];
        a2 = args[2];
        a3 = args[3];
        a4 = args[4];
        i = eventList.length;
        while (i--) {
            if ((event = eventList[i])) event.listener.call(event.ctx, a1, a2, a3, a4);
        }
    } else {
        arrayShift.apply(args);
        i = eventList.length;
        while (i--) {
            if ((event = eventList[i])) event.listener.apply(event.ctx, args);
        }
    }
}

EventEmitter.prototype.emit = function(type) {
    var eventList = this._events[type];

    if (!eventList || !eventList.length) return this;
    emit(eventList, arguments);

    return this;
};

EventEmitter.prototype.listeners = function(type) {
    var eventList = this._events[type];

    return eventList ? eventList.slice() : [];
};

EventEmitter.prototype.listenerCount = function(type) {
    var eventList = this._events[type];

    return eventList ? eventList.length : 0;
};

EventEmitter.prototype.setMaxListeners = function(value) {
    if ((value = +value) !== value) throw new TypeError("EventEmitter.setMaxListeners(value) value must be a number");

    this._maxListeners = value < 0 ? -1 : value;
    return this;
};


EventEmitter.defaultMaxListeners = 10;

EventEmitter.listeners = function(obj, type) {
    if (obj == null) throw new TypeError("EventEmitter.listeners(obj, type) obj required");
    var eventList = obj._events && obj._events[type];

    return eventList ? eventList.slice() : [];
};

EventEmitter.listenerCount = function(obj, type) {
    if (obj == null) throw new TypeError("EventEmitter.listenerCount(obj, type) obj required");
    var eventList = obj._events && obj._events[type];

    return eventList ? eventList.length : 0;
};

EventEmitter.setMaxListeners = function(value) {
    if ((value = +value) !== value) throw new TypeError("EventEmitter.setMaxListeners(value) value must be a number");

    EventEmitter.defaultMaxListeners = value < 0 ? -1 : value;
    return value;
};

EventEmitter.extend = function(child, parent) {
    if (!parent) parent = this;

    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
    child._super = parent.prototype;
    child.extend = parent.extend;

    return child;
};


module.exports = EventEmitter;
