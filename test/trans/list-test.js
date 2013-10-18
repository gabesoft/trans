module.exports = function (util) {
    var trans  = util.trans
      , assert = util.assert
      , add    = util.add;

    describe('take', function () {
        it('should keep only the specified number of items from an array', function () {
            var o = [ 1, 2, 3, 4, 5, 6 ]
              , t = trans(o).take(4).value();
            assert.deepEqual(t, [1, 2, 3, 4]);
        });
    });

    describe('takef', function () {
        it('should keep only the specified number of items from the target array', function () {
            var o = { a: { b: [ { c: 1 }, { c: 2 }, { c: 3 }, { c: 4 }, { c: 5 } ] } }
              , t = trans(o).takef('a.b', 3).value();
            assert.deepEqual(t, { a: { b: [ { c: 1 }, { c: 2 }, { c: 3 } ] } });
        });
    });

    describe('skip', function () {
        it('should remove the first specified items from an array', function () {
            var o = [ 1, 2, 3, 4, 5, 6, 7, 8 ]
              , t = trans(o).skip(3).value();
            assert.deepEqual(t, [ 4, 5, 6, 7, 8 ]);
        });
    });

    describe('pluck', function () {
        it('should pluck the specified field from all objects in an array', function () {
            var o = [ { a: { b: 1, c: 1 } }, { a: { b: 2, c: 'b' } }, { a: { b: 3 } }, { a: { b: 4, d: 'F' } }, { a: { b: 5 } } ]
              , t = trans(o).pluck('a.b').value();
            assert.deepEqual(t, [ 1, 2, 3, 4, 5 ]);
        });

        it('should pluck the specified field and apply transformations', function () {
            var o = [ { a: { b: 'aab', c: 1 } }, { a: { b: 'aac', c: 'b' } }, { a: { b: 'foo' } }, { a: { b: 'bar', d: 'F' } }, { a: { b: 'GFK' } } ]
              , t = trans(o).pluck('a.b', [ 'charAt', 0 ], 'toUpperCase').value();
            assert.deepEqual(t, [ 'A', 'A', 'F', 'B', 'G' ]);
        });

        it('should pluck the specified field from a single object', function () {
            var o = { a: { b: 1, c: { d: { e: 'ABC', f: 3 } }, g: { h: 10 } }, k: 2 }
              , t = trans(o).pluck('a.c.d.e', 'toLowerCase').value();
            assert.strictEqual(t, 'abc');
        });

        it('should handle multiple arrays', function () {
            var o = [
                    [ { a: [ { b: 1 }, { b: 2 } ] }, { a: [ { b: 3 } ] } ]
                  , [ { a: [ { b: 10 } ] }, { a: [ { b: 11 }, { b: 12 }, { b: 13 } ] } ] ]
              , t = trans(o).pluck('a.b', [add, 5]).value();
            assert.deepEqual(t, [ [ [ 6, 7 ], [ 8 ] ], [ [ 15 ], [ 16, 17, 18 ] ] ]);
        });
    });

    describe('pluckf', function () {
        it('should replace the field value with the specified pluck values 1', function () {
            var o = { a: [ { b: { c: { d: 1 } } }, { b: { c: { d: 2 } } }, { b: { c: { d: 1 } } } ] }
              , t = trans(o).pluckf('a.b', 'c.d').value();
            assert.deepEqual(t, { a: [ { b: 1 }, { b: 2 }, { b: 1 } ] });
        });

        it('should replace the field value with the specified pluck values 2', function () {
            var o = { a: [ { b: { c: { d: 1 } } }, { b: { c: { d: 2 } } }, { b: { c: { d: 1 } } } ] }
              , t = trans(o).pluckf('a', 'b.c.d').value();
            assert.deepEqual(t, { a: [ 1, 2, 1 ] });
        });
    });

    describe('first', function () {
        it('should keep only the first element in the list', function () {
            var o = [ 1, 2, 3, 4 ]
              , t = trans(o).first().value();
            assert.deepEqual(t, 1);
        });

        it('should not modify the original array', function () {
            var o = [ 1, 2, 3, 4, 5 ]
              , t = trans(o).first().value();
            assert.deepEqual(o, [ 1, 2, 3, 4, 5 ]);
        });

        it('should handle empty arrays', function () {
            var t = trans([]).first().value();
            assert.strictEqual(t, null);
        });
    });

    describe('firstf', function () {
        it('should keep only the first element from the target array', function () {
            var o = { a: { b: [ { c: 1 }, { c: 2 }, { c: 3 }, { c: 4 }, { c: 5 } ] } }
              , t = trans(o).firstf('a.b').value();
            assert.deepEqual(t, { a: { b: { c: 1 } } });
        });
    });

    describe('firstff', function () {
        it('should keep only the first element from the target array and set it on the destination', function () {
            var o = { a: { b: [ { c: 1 }, { c: 2 }, { c: 3 }, { c: 4 }, { c: 5 } ] } }
              , t = trans(o).firstff('a.b', 'a.e').value();
            assert.deepEqual(t, { a: {
                b: [ { c: 1 }, { c: 2 }, { c: 3 }, { c: 4 }, { c: 5 } ]
              , e: { c: 1 }
            } });
        });
    });

    describe('last', function () {
        it('should keep only the last element in the list', function () {
            var o = [ 1, 2, 3, 4 ]
              , t = trans(o).last().value();
            assert.deepEqual(t, 4);
        });

        it('should not modify the original array', function () {
            var o = [ 1, 2, 3, 4, 5 ]
              , t = trans(o).last().value();
            assert.deepEqual(o, [ 1, 2, 3, 4, 5 ]);
        });

        it('should handle empty arrays', function () {
            var t = trans([]).last().value();
            assert.strictEqual(t, null);
        });
    });

    describe('lastf', function () {
        it('should keep only the last element from the target array', function () {
            var o = { a: { b: [ { c: 1 }, { c: 2 }, { c: 3 }, { c: 4 }, { c: 5 } ] } }
              , t = trans(o).lastf('a.b').value();
            assert.deepEqual(t, { a: { b: { c: 5 } } });
        });
    });

    describe('firstff', function () {
        it('should keep only the last element from the target array and set it on the destination', function () {
            var o = { a: { b: [ { c: 1 }, { c: 2 }, { c: 3 }, { c: 4 }, { c: 5 } ] } }
              , t = trans(o).lastff('a.b', 'a.e').value();
            assert.deepEqual(t, { a: {
                b: [ { c: 1 }, { c: 2 }, { c: 3 }, { c: 4 }, { c: 5 } ]
              , e: { c: 5 }
            } });
        });
    });
};
