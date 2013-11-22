var shift = Array.prototype.shift;


function EventEmitter() {

    this._events = {};
}


EventEmitter.prototype.on = EventEmitter.prototype.addEventListener = function(type, listener) {
	
    (this._events[type] || (this._events[type] = [])).push(listener);

    return this;
};


EventEmitter.prototype.once = EventEmitter.prototype.addEventListenerOnce = function(type, listener) {
	
    function once() {

        this.off(type, once);
        listener.apply(this, arguments);
    }

    (this._events[type] || (this._events[type] = [])).push(once);

    return this;
};


EventEmitter.prototype.off = EventEmitter.prototype.removeEventListener = function(type, listener) {
    var events, handler,
        i;

    if (!type) {
        events = this._events;
        for (i in events) events[i].length = 0;
        return this;
    }
	
	events = this._events[type];
    if (!events) return this;

    if (!listener) {
        events.length = 0;
    } else {
        for (i = events.length; i--;) {
            handler = events[i];

            if (listener === handler) {
                events.splice(i, 1);
                return this;
            }
        }
    }

    return this;
};


EventEmitter.prototype.emit = EventEmitter.prototype.trigger = function(type) {
    var events = this._events[type],
		a1, a2, a3, a4,
		event,
        i;

    if (!events || !events.length) return this;
	
	switch(arguments.length){
		case 1:
			for (i = events.length; i--;) events[i].call(this);
			break;
		
		case 2:
			a1 = arguments[1];
			for (i = events.length; i--;) events[i].call(this, a1);
			break;
		
		case 3:
			a1 = arguments[1];
			a2 = arguments[2];
			for (i = events.length; i--;) events[i].call(this, a1, a2);
			break;
		
		case 4:
			a1 = arguments[1];
			a2 = arguments[2];
			a3 = arguments[3];
			for (i = events.length; i--;) events[i].call(this, a1, a2, a3);
			break;
		
		case 5:
			a1 = arguments[1];
			a2 = arguments[2];
			a3 = arguments[3];
			a4 = arguments[4];
			for (i = events.length; i--;) events[i].call(this, a1, a2, a3, a4);
			break;
		
		default:
			shift.apply(arguments);
			for (i = events.length; i--;) events[i].apply(this, arguments);
	}

    return this;
};


module.exports = EventEmitter;