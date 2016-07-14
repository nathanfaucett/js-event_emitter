EventEmitter
=======

EventEmitter for the browser and node.js

```javascript
var EventEmitter = require("@nathanfaucett/event_emitter");


var emitter = new EventEmitter();


emitter.on("test", function handler(a, b, c) {
    console.log(a, b, c);
    emitter.off("test", handler);
});

emitter.emit(1, 2, 3);
emitter.emitArgs([1, 2, 3]);
emitter.emitArg(1);
```
