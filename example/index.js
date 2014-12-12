global.EventEmitter = require("../src/index");


global.events = new EventEmitter(-1);


events.on("async-event", function(model, next) {
    setTimeout(function() {
        model.name = "bob";
        next();
    }, 100);
});
events.on("async-event", function(model, next) {
    setTimeout(function() {
        model.age = 32;
        next();
    }, 100);
});

var person = {};
events.emitAsync("async-event", person, function(err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log(person);
});


events.on("event", function(model) {
    model.name = "bob2";
});
events.on("event", function(model) {
    model.age = 16;
});

var person2 = {};
events.emit("event", person2);
console.log(person2);
