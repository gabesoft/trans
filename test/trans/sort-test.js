module.exports = function (util) {
    var trans  = util.trans
      , assert = util.assert
      , square = util.square
      , mod    = util.mod
      , sum    = util.sum
      , add    = util.add;

    describe('sort', function () {
        it('should sort an array of numbers', function () {
            var o = [ 1, 1, 3, 4, 1, 1 ]
              , t = trans(o).sort().value();
            assert.deepEqual(t, [ 1, 1, 1, 1, 3, 4 ]);
        });

        it('should sort an array of numbers in descending order', function () {
            var o = [ 1, 1, 3, 4, 1, 1 ]
              , t = trans(o).sort(':desc').value();
            assert.deepEqual(t, [ 4, 3, 1, 1, 1, 1 ]);
        });

        it('should sort an array of strings', function () {
            var o = [ 'Ash', 'bar', 'Baz', 'baz', 'bak', 'Foo', 'ash' ]
              , t = trans(o).sort(null, 'toLowerCase').value();
            assert.deepEqual(t, [ 'Ash', 'ash', 'bak', 'bar', 'Baz', 'baz', 'Foo' ]);
        });

        it('should allow specifying fields as part of the transformers', function () {
            var o = [
                    { a: { b: [ 1, 2 ] } }
                  , { a: { b: [ 1 ] } }
                  , { a: { b: [ 2, 2, 1 ] } }
                  , { a: { b: [] } } ]
              , t = trans(o).sort('a', 'b', sum, [mod, 4]).value();
            assert.deepEqual(t, [
                { a: { b: [] } }
              , { a: { b: [ 1 ] } }
              , { a: { b: [ 2, 2, 1 ] } }
              , { a: { b: [ 1, 2 ] } }
            ]);
        });

        it('should allow specifying the sort field with dot notation', function () {
            var o = [
                    { a: { b: [ 1, 2 ] } }
                  , { a: { b: [ 1 ] } }
                  , { a: { b: [ 2, 2, 2 ] } }
                  , { a: { b: [] } } ]
              , t = trans(o).sort('a.b', 'length').value();
            assert.deepEqual(t, [
                { a: { b: [] } }
              , { a: { b: [ 1 ] } }
              , { a: { b: [ 1, 2 ] } }
              , { a: { b: [ 2, 2, 2 ] } }
            ]);
        });

        it('should work with nested arrays 1', function () {
            var o = [
                    { a: { b: [ { c: 1 }, { c: 2 } ] } }
                  , { a: { b: [ { c: 2 }, { c: 2 } ] } }
                  , { a: { b: [ { c: 2 }, { c: 1 } ] } }
                  , { a: { b: [ { c: 3 }, { c: 1 } ] } }
                  , { a: { b: [ { c: 1 }, { c: 1 } ] } }
                ]
              , e = [
                    { a: { b: [ { c: 1 }, { c: 1 } ] } }
                  , { a: { b: [ { c: 1 }, { c: 2 } ] } }
                  , { a: { b: [ { c: 2 }, { c: 1 } ] } }
                  , { a: { b: [ { c: 2 }, { c: 2 } ] } }
                  , { a: { b: [ { c: 3 }, { c: 1 } ] } }
                ]
              , t = trans(o).sort('a.b.c', sum).value();
            assert.deepEqual(t, e);
        });

        it('should work with nested arrays 2', function () {
            var o = [
                    [ { a: 1 }, { a: 2 } ]
                  , [ { a: 5 } ]
                  , [ { a: 0 }, { a: 1 }, { a: 1 } ]
                  , [ { a: 2 }, { a: 2 } ] ]
              , t = trans(o).sort('a', sum).value();
            assert.deepEqual(t, [
                [ { a: 0 }, { a: 1 }, { a: 1 } ]
              , [ { a: 1 }, { a: 2 } ]
              , [ { a: 2 }, { a: 2 } ]
              , [ { a: 5 } ]
            ]);
        });

        it('should sort with a specified comparer', function () {
            var o = [ { a: 1, b: 1 }, { a: 2, b: 1 }, { a: 1, b: 2 }, { a: 1, b: 0 } ]
              , t = trans(o).sort(null, function (x, y) {
                    return x.a === y.a ? x.b - y.b : x.a - y.a;
                }).value();
            assert.deepEqual(t, [
                { a: 1, b: 0 }
              , { a: 1, b: 1 }
              , { a: 1, b: 2 }
              , { a: 2, b: 1 }
            ]);
        });

        it('should sort by a given field with a specified comparer', function () {
            var o = [
                    { a: 'z', b: 1 }
                  , { a: 'a', b: 2 }
                  , { a: 'aa', b: 3 }
                  , { a: 'zaa', b: 4 }
                  , { a: 'ba', b: 5 }
                  , { a: 'ca', b: 6 }
                  , { a: 'ccc', b: 7 } ]
              , t = trans(o).sort('a', function (x, y) {
                    return x.length === y.length ? x.localeCompare(y) : x.length - y.length;
                }).value();
            assert.deepEqual(t, [
                { a: 'a', b: 2 }
              , { a: 'z', b: 1 }
              , { a: 'aa', b: 3 }
              , { a: 'ba', b: 5 }
              , { a: 'ca', b: 6 }
              , { a: 'ccc', b: 7 }
              , { a: 'zaa', b: 4 }
            ]);
        });

        it('should work with missing fields 1', function () {
            var o = [ { a: { b: 1 } }, { a: { b: 5 } }, { a: {} }, { a: { b: 2 } }, { a: {} } ]
              , t = trans(o).sort('a.b').value();
            assert.deepEqual(t, [
                { a: {} }, { a: {} }, { a: { b: 1 } }, { a: { b: 2 } }, { a: { b: 5 } }
            ]);
        });

        it('should work with missing fields 2', function () {
            var o = [ { a: { b: 0 } }, { a: { b: 5 } }, { a: {} }, { a: { b: 2 } }, { a: {} } ]
              , t = trans(o).sort('a.b', [add, 1]).value();
            assert.deepEqual(t, [
                { a: { b: 0 } }, { a: {} }, { a: {} }, { a: { b: 2 } }, { a: { b: 5 } }
            ]);
        });

        it('should use a stable sort 1', function () {
            var o = [ { a: 1, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }, { a: 1, b: 4 }, { a: 2, b: 5 }, { a: 3, b: 6 } ]
              , t = trans(o).sort('a').value();
            assert.deepEqual(t, [
                { a: 0, b: 2 }
              , { a: 0, b: 3 }
              , { a: 1, b: 1 }
              , { a: 1, b: 4 }
              , { a: 2, b: 5 }
              , { a: 3, b: 6 }
            ]);
        });

        it('should use a stable sort 2', function () {
            var o = [ { a: 1, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }, { a: 1, b: 4 }, { a: 2, b: 5 }, { a: 3, b: 6 } ]
              , t = trans(o).sort('a:descending').value();
            assert.deepEqual(t, [
                { a: 3, b: 6 }
              , { a: 2, b: 5 }
              , { a: 1, b: 1 }
              , { a: 1, b: 4 }
              , { a: 0, b: 2 }
              , { a: 0, b: 3 }
            ]);
        });

        it('should throw if the sort target is not an array', function () {
            assert.throws(function () {
                trans({ a: 1 }).sort('a');
            }, /the sort target is not an array/i);
        });
    });

    describe('sortf', function () {
        it('should sort the target array', function () {
            var o = {
                    a: { b: 1 }
                  , c: { d: [ 1, 1, 5, 3, 3, 4, 0, ] }
                }
              , t = trans(o).sortf('c.d', null, [mod, 3]).value();
            assert.deepEqual(t, {
                a: { b: 1 }
              , c: { d: [ 3, 3, 0, 1, 1, 4, 5, ] }
            });
        });

        it('should sort the target array by the given field', function () {
            var o = { a: { b: [ { c: 1 }, { c: 7 }, { c: 3 }, { c: 2 } ] } }
              , t = trans(o).sortf('a.b', 'c').value();
            assert.deepEqual(t, {
                a: { b: [ { c: 1 }, { c: 2 }, { c: 3 }, { c: 7 } ] }
            });
        });

        it('should sort the target array by the given field and transformer', function () {
            var o = { a: { b: [ { c: [ 1 ] }, { c: [] }, { c: [ 3, 4, 5 ] }, { c: [ 2 ] } ] } }
              , t = trans(o).sortf('a.b', 'c', 'length').value();
            assert.deepEqual(t, {
                a: { b: [ { c: [] }, { c: [ 1 ] }, { c: [ 2 ] }, { c: [ 3, 4, 5 ] } ] }
            });
        });

        it('should sort all targets', function () {
            var o = [ { a: [ 1, 4, 2, 1 ] }, { a: [ 2, 2, 1, 4 ] }, { a: [  3, 1, 2  ] } ]
              , t = trans(o).sortf('a').value();
            assert.deepEqual(t, [
                { a: [ 1, 1, 2, 4 ] }, { a: [ 1, 2, 2, 4 ] }, { a: [  1, 2, 3  ] }
            ]);
        });
    });

    describe('sortff', function () {
        it('should sort the target array and set it on the destination field', function () {
            var o = { a: [ 1, 2, 1, 1, 3, 2 ] }
              , t = trans(o).sortff('a', 'c').value();
            assert.deepEqual(t, { a: [ 1, 2, 1, 1, 3, 2 ], c: [ 1, 1, 1, 2, 2, 3 ] });
        });

        it('should sort multiple times', function () {
            var o = [
                    { a: { b: [ { c: 5 }, { c: 2 }, { c: 3 }, { c: 4 } ] } }
                  , { a: {
                        b: [ { c: 199 }, { c: 290 }, { c: 112 } ]
                      , d: [ { c: 'five' }, { c: 'two' }, { c: 'three' }, { c: 'four' } ]
                    } }
                ]
              , t = trans(o)
                   .sortff('a.b', 'a.numeric', 'c')
                   .sortff('a.d', 'a.alpha', 'c')
                   .sortff('a.d', 'a.size', 'c', 'length')
                   .value();
            assert.deepEqual(t, [
                { a: {
                    b       : [ { c: 5 }, { c: 2 }, { c: 3 }, { c: 4 } ]
                  , numeric : [ { c: 2 }, { c: 3 }, { c: 4 }, { c: 5 } ]
                  , alpha   : null
                  , size    : null
                } }
                , { a: {
                      b       : [ { c: 199 }, { c: 290 }, { c: 112 } ]
                    , d       : [ { c: 'five' }, { c: 'two' }, { c: 'three' }, { c: 'four' } ]
                    , numeric : [ { c: 112 }, { c: 199 }, { c: 290 } ]
                    , alpha   : [ { c: 'five' }, { c: 'four' }, { c: 'three' }, { c: 'two' } ]
                    , size    : [ { c: 'two' }, { c: 'five' }, { c: 'four' }, { c: 'three' } ]
                  } }
            ]);
        });
    });
};
