var tape = require("tape"),
    EventEmitter = require("../src/index");


tape("EventEmitter extend(ChildConstructor) should make ChildConstructor inherit EventEmitter", function(assert) {
    function Child() {
        EventEmitter.call(this);
    }
    EventEmitter.extend(Child);

    assert.equal(Child.prototype instanceof EventEmitter, true);
    assert.equal(Child.prototype.constructor === Child, true);
    assert.equal(Child.extend === EventEmitter.extend, true);
    assert.equal(Child.super_ === EventEmitter, true);
    assert.equal(Child.__super === EventEmitter.prototype, true);

    assert.end();
});

tape("EventEmitter on(name, listener) should add event named name to emitters listeners", function(assert) {
    var ee = new EventEmitter(),
        fn = function() {};
    ee.on("test", fn);
    assert.equal(ee.__events.test[0], fn);

    assert.end();
});

tape("EventEmitter off(name, listener) should remove event named name from emitters listeners and after called should remove it", function(assert) {
    var ee = new EventEmitter(),
        fn = function() {};
    ee.on("test", fn);
    ee.off("test", fn);
    assert.equal(ee.__events.test, undefined);

    assert.end();
});

tape("EventEmitter emit(name, ...args) should call all listeners added to event named name", function(assert) {
    var ee = new EventEmitter(),
        called = false;

    ee.on("test", function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        called = true;
        assert.deepEqual(
            [a0, a1, a2, a3, a4, a5, a6, a7, a8, a9], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        );
    });
    ee.emit("test", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9);

    assert.equal(called, true);

    assert.end();
});

tape("EventEmitter emitAsync(name, ...args, callback) should call all listeners added to event named name in sequence", function(assert) {
    var ee = new EventEmitter(),
        called0 = false,
        called1 = false;

    ee.on("test", function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, next) {
        process.nextTick(function() {
            called0 = true;
            assert.deepEqual(
                [a0, a1, a2, a3, a4, a5, a6, a7, a8, a9], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
            );
            next();
        });
    });
    ee.on("test", function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, next) {
        process.nextTick(function() {
            called1 = true;
            assert.deepEqual(
                [a0, a1, a2, a3, a4, a5, a6, a7, a8, a9], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
            );
            next();
        });
    });

    ee.emitAsync("test", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, function(err) {
        assert.equal(err, undefined);
        assert.equal(called0, true);
        assert.equal(called1, true);
    });

    assert.equal(called0, false);
    assert.equal(called1, false);

    assert.end();
});

tape("EventEmitter listenTo(object, name) should attach listen to objects event name, and emit from this emitter", function(assert) {
    var ee1 = new EventEmitter(),
        ee2 = new EventEmitter();

    ee1.on("test", function(value) {
        assert.equal(value, 1);
    });

    ee1.listenTo(ee2, "test");
    ee2.emit("test", 1);

    assert.end();
});
