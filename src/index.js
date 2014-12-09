var type = require("type"),
    utils = require("utils");


function EventObject(listener, ctx) {
    this.listener = listener;
    this.ctx = ctx;
}


function EventEmitter(maxListeners) {

    this._events = {};
    this._maxListeners = maxListeners != null ? maxListeners : EventEmitter.defaultMaxListeners;
}

EventEmitter.prototype.on = function(name, listener, ctx) {
    var events, eventList, maxListeners;

    if (!type.isFunction(listener)) {
        throw new TypeError("EventEmitter.on(name, listener[, ctx]) listener must be a function");
    }

    events = this._events;
    eventList = (events[name] || (events[name] = []));
    maxListeners = this._maxListeners;

    eventList.push(new EventObject(listener, ctx || this));

    if (maxListeners !== -1 && eventList.length > maxListeners) {
        console.error("EventEmitter.on(type, listener, ctx) possible EventEmitter memory leak detected. " + maxListeners + " listeners added");
    }

    return this;
};

EventEmitter.prototype.addListener = EventEmitter.prototype.on;

EventEmitter.prototype.once = function(name, listener, ctx) {
    var _this = this;

    ctx || (ctx = this);

    function once() {
        var length = arguments.length;

        _this.off(name, once, ctx);

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

    this.on(name, once, ctx);

    return once;
};

EventEmitter.prototype.listenTo = function(obj, name, listener, ctx) {
    if (!type.isFunction(obj.on)) {
        throw new TypeError("EventEmitter.listenTo(obj, name, listener, ctx) obj must have a on function taking (name, listener[, ctx])");
    }

    obj.on(name, listener, ctx || this);
    return this;
};

EventEmitter.prototype.off = function(name, listener, ctx) {
    var events = this._events,
        eventList, event, i;

    if (!name) return this;

    eventList = events[name];
    if (!eventList) return this;

    if (!listener) {
        i = eventList.length;

        while (i--) {
            event = eventList[i];
            this.emit("removeListener", name, event.listener, event.ctx);
        }
        eventList.length = 0;
        delete events[name];
    } else {
        ctx = ctx || this;
        i = eventList.length;

        while (i--) {
            event = eventList[i];

            if (event.listener === listener && event.ctx === ctx) {
                this.emit("removeListener", name, event.listener, event.ctx);
                eventList.splice(i, 1);
            }
        }

        if (eventList.length === 0) {
            delete events[name];
        }
    }

    return this;
};

EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

EventEmitter.prototype.removeAllListeners = function() {
    var events = this._events,
        keys = utils.keys(events),
        i = -1,
        il = keys.length - 1,
        key, eventList, j, event;

    while (i++ < il) {
        key = keys[i];
        eventList = events[key];

        if (eventList) {
            j = eventList.length;

            while (j--) {
                event = eventList[i];
                this.emit("removeListener", key, event.listener, event.ctx);
                eventList.splice(j, 1);
            }
        }

        delete events[key];
    }

    return this;
};

function slice(array, offset) {
    var length, i, il, result, j;

    offset = offset || 0;

    length = array.length;
    i = offset - 1;
    il = length - 1;
    result = new Array(length - offset);
    j = 0;

    while (i++ < il) {
        result[j++] = array[i];
    }

    return result;
}

function emit(eventList, args) {
    var a1, a2, a3, a4,
        argsLength = args.length,
        length = eventList.length - 1,
        i = -1,
        event;

    if (argsLength === 0) {
        while (i++ < length) {
            if ((event = eventList[i])) event.listener.call(event.ctx);
        }
    } else if (argsLength === 1) {
        a1 = args[0];
        while (i++ < length) {
            if ((event = eventList[i])) event.listener.call(event.ctx, a1);
        }
    } else if (argsLength === 2) {
        a1 = args[0];
        a2 = args[1];
        while (i++ < length) {
            if ((event = eventList[i])) event.listener.call(event.ctx, a1, a2);
        }
    } else if (argsLength === 3) {
        a1 = args[0];
        a2 = args[1];
        a3 = args[2];
        while (i++ < length) {
            if ((event = eventList[i])) event.listener.call(event.ctx, a1, a2, a3);
        }
    } else if (argsLength === 4) {
        a1 = args[0];
        a2 = args[1];
        a3 = args[2];
        a4 = args[3];
        while (i++ < length) {
            if ((event = eventList[i])) event.listener.call(event.ctx, a1, a2, a3, a4);
        }
    } else {
        while (i++ < length) {
            if ((event = eventList[i])) event.listener.apply(event.ctx, args);
        }
    }
}

EventEmitter.prototype.emit = function(name) {
    var eventList = this._events[name];

    if (!eventList || !eventList.length) return this;
    emit(eventList, slice(arguments, 1));

    return this;
};

EventEmitter.prototype.emitArgs = function(name, args) {
    var eventList = this._events[name];

    if (!eventList || !eventList.length) return this;
    emit(eventList, args);

    return this;
};

function emitAsync(_this, eventList, args, callback) {
    var length = eventList.length,
        index = 0,
        argsLength = args.length,
        called = false,
        event;

    (function next(err) {
        if (called === true) {
            return;
        }
        if (index === length || err) {
            called = true;
            callback.call(_this, err);
            return;
        }

        event = eventList[index++];
        args[argsLength] = next;

        event.listener.apply(event.ctx, args);
    }());
}

EventEmitter.prototype.emitAsync = function(name, args, callback) {
    var _this = this,
        eventList = this._events[name];

    args = slice(arguments, 1);
    callback = args.pop();

    if (!type.isFunction(callback)) {
        throw new TypeError("EventEmitter.emitAsync(name [, ...args], callback) callback must be a function");
    }

    process.nextTick(function() {
        if (!eventList || !eventList.length) {
            callback.call(_this);
        } else {
            emitAsync(_this, eventList, args, callback);
        }
    });

    return this;
};

EventEmitter.prototype.listeners = function(name) {
    var eventList = this._events[name];

    return eventList ? slice(eventList) : [];
};

EventEmitter.prototype.listenerCount = function(name) {
    var eventList = this._events[name];

    return eventList ? eventList.length : 0;
};

EventEmitter.prototype.setMaxListeners = function(value) {
    if ((value = +value) !== value) {
        throw new TypeError("EventEmitter.setMaxListeners(value) value must be a number");
    }

    this._maxListeners = value < 0 ? -1 : value;
    return this;
};


EventEmitter.defaultMaxListeners = 10;

EventEmitter.listeners = function(obj, name) {
    var eventList;

    if (obj == null) {
        throw new TypeError("EventEmitter.listeners(obj, name) obj required");
    }
    eventList = obj._events && obj._events[name];

    return eventList ? slice(eventList) : [];
};

EventEmitter.listenerCount = function(obj, name) {
    var eventList;

    if (obj == null) {
        throw new TypeError("EventEmitter.listenerCount(obj, name) obj required");
    }
    eventList = obj._events && obj._events[name];

    return eventList ? eventList.length : 0;
};

EventEmitter.setMaxListeners = function(value) {
    if ((value = +value) !== value) {
        throw new TypeError("EventEmitter.setMaxListeners(value) value must be a number");
    }

    EventEmitter.defaultMaxListeners = value < 0 ? -1 : value;
    return value;
};

EventEmitter.extend = function(child) {

    utils.inherits(child, this);
    child.extend = this.extend;

    return child;
};


module.exports = EventEmitter;
