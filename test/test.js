var assert = require("assert"),
    EventEmitter = require("../src/index");


describe("EventEmitter", function() {
    describe("#on(name, listener)", function() {
        it("should add event named name to emitters listeners", function() {
            var ee = new EventEmitter(),
                fn = function() {};
            ee.on("test", fn);
            assert.equal(ee.__events.test[0], fn);
        });
    });

    describe("#off(name, listener)", function() {
        it("should remove event named name from emitters listeners and after called should remove it", function() {
            var ee = new EventEmitter(),
                fn = function() {};
            ee.on("test", fn);
            ee.off("test", fn);
            assert.equal(ee.__events.test, undefined);
        });
    });

    describe("#emit(name, ...args)", function() {
        it("should call all listeners added to event named name", function() {
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
        });
    });

    describe("#emitAsync(name, ...args, callback)", function() {
        it("should call all listeners added to event named name in sequence", function() {
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
        });
    });
});
