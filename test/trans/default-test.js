module.exports = function (util) {
    var trans  = util.trans
      , assert = util.assert
      , add    = util.add
      , sum    = util.sum
      , square = util.square;

    describe('default', function () {
        it('should set default values for null or undefined values', function () {
            var o = { a: { b: null, c: { }, d: { e: { g: 4 } } } }
              , t = trans(o).default('a.b', 1, 'a.c.f', 2, 'a.d.e.f', 5).value();
            assert.deepEqual(t, { a: { b: 1, c: { f: 2 }, d: { e: { f: 5, g: 4 } } } });
        });

        it('should handle arrays', function () {
            var o = { a: [ { b: {} }, { b: { c: null } }, { b: {} } ], e: { d: {}, f: 3 } }
              , t = trans(o).default('a.b.c', 2, 'e.d.g', 4).value();
            assert.deepEqual(t, {
                a: [ { b: { c: 2 } }, { b: { c: 2 } }, { b: { c: 2 } } ]
              , e: { d: { g: 4 }, f: 3 }
            });
        });

        it('should throw if there isn\'t an even number of arguments', function () {
            assert.throws(function () {
                trans({ a: 1 }).default('a', 1, 'b');
            }, /an even number of arguments was expected/i);
        });

        it('should throw if asked to set defaults on a primitive value', function () {
            assert.throws(function () {
                trans({ a: { b: 1, c: null }, d: 1 }).default('d.e', 3);
            }, /could not create field/i);
        });
    });
};
