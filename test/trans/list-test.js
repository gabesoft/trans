module.exports = function (util) {
    var trans  = util.trans
      , assert = util.assert
      , add    = util.add
      , mod    = util.mod;

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
              , t = trans(o).pluck('a.b', '.', [add, 5]).value();
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

    describe('uniq', function () {
        it('should remove all duplicates according to the specified field', function () {
            var o = [ { a: { b: 1 } }, { a: { b: '1' } }, { a: { b: 2 } }, { a: { b: 1 } }, { a: { b: 10 } } ]
              , t = trans(o).uniq('a.b').value();
            assert.deepEqual(t, [
                { a: { b: 1 } }, { a: { b: '1' } }, { a: { b: 2 } }, { a: { b: 10 } }
            ]);
        });

        it('should apply transformers and remove all duplicates', function () {
            var o = [ { a: { b: 1 } }, { a: { b: '1' } }, { a: { b: 2 } }, { a: { b: 1 } }, { a: { b: 10 } } ]
              , t = trans(o).uniq('a.b', parseInt).value();
            assert.deepEqual(t, [
                { a: { b: 1 } }, { a: { b: 2 } }, { a: { b: 10 } }
            ]);
        });

        it('should not remove if the value is null or undefined', function () {
            var o = [ { a: { b: 1 } }, { a: {} }, { a: { b: 2 } }, { a: {} }, { a: { b: 1 } } ]
              , t = trans(o).uniq('a.b').value();
            assert.deepEqual(t, [
                { a: { b: 1 } }, { a: {} }, { a: { b: 2 } }, { a: {} }
            ]);
        });

        it('should remove duplicates in an array of strings', function () {
            var o = [ 'a', 'b', 'a', 'a', 'b', 'c', 'd', 'a', 'e' ]
              , t = trans(o).uniq().value();
            assert.deepEqual(t, [ 'a', 'b', 'c', 'd', 'e' ]);
        });
    });

    describe('uniqf', function () {
        it('should remove duplicates from the target array', function () {
            var o = [
                    { a: { b: [ 1, 1, 3, 4, 4, 11, 12, 99, 9, 3, 4 ] } }
                  , { a: { b: [ 1, 1, 14, 4 ] } } ]
              , t = trans(o).uniqf('a.b', null, [mod, 10]).value();
            assert.deepEqual(t, [
                { a: { b: [ 1, 3, 4, 12, 99 ] } }
              , { a: { b: [ 1, 14 ] } } ]);
        });
    });

    describe('uniqff', function () {
        it('should remove duplicates from the target array and set it on the destination', function () {
            var o = { a: [ 1, 1, 3 ] }
              , t = trans(o).uniqff('a', 'b').value();
            assert.deepEqual(t, { a: [ 1, 1, 3 ], b: [ 1, 3 ] });
        });
    });
};
