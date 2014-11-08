global.EventEmitter = require("../src/index.js");


var events = new EventEmitter();

events.on("async-event", function(model, next) {
    setTimeout(function() {
        model.name = "bob";
        console.timeEnd("name");
        console.time("age");
        next();
    }, 500);
});
events.on("async-event", function(model, next) {
    setTimeout(function() {
        model.age = 32;
        console.timeEnd("age");
        next();
    }, 500);
});


var person = {};
console.time("name");
events.emitAsync("async-event", person, function(err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log(person);
});
