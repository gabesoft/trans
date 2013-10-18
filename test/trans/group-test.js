module.exports = function (util) {
    var trans  = util.trans
      , assert = util.assert
      , square = util.square
      , mod    = util.mod
      , sum    = util.sum
      , add    = util.add;

    describe('group', function () {
        it('should group an array by the given key - object', function () {
            var o = [
                    { a: { b: 1 } }
                  , { a: { b: 2 } }
                  , { a: { b: 2 } }
                  , { a: { b: 3 } }
                  , { a: { b: 2 } }
                  , { a: {} } ]
              , t = trans(o).group('a.b').value();
            assert.deepEqual(t, [
                { key: 1, value: [ { a: { b: 1 } } ] }
              , { key: 2, value: [ { a: { b: 2 } }, { a: { b: 2 } }, { a: { b: 2 } } ] }
              , { key: 3, value: [ { a: { b: 3 } } ] }
              , { key: null, value: [ { a: {} } ] }
            ]);
        });

        it('should group an array of primitives 1', function () {
            var o = [ 1, 1, 3, 3, 2, 1 ]
              , t = trans(o).group(null).value();
            assert.deepEqual(t, [
                { key: 1, value: [ 1, 1, 1 ] }
              , { key: 3, value: [ 3, 3 ] }
              , { key: 2, value: [ 2 ] }
            ]);
        });

        it('should group an array of primitives 2', function () {
            var o = [ 1, 1, 3, 3, 2, 1 ]
              , t = trans(o).group(null, null, square).value();
            assert.deepEqual(t, [
                { key: 1, value: [ 1, 1, 1 ] }
              , { key: 9, value: [ 3, 3 ] }
              , { key: 4, value: [ 2 ] }
            ]);
        });

        it('should group an array of strings', function () {
            var o = [ 'abc', 'abc', 'def', 'foo', 'bar', 'foo', 'abc' ]
              , t = trans(o).group().value();
            assert.deepEqual(t, [
                { key: 'abc', value: [ 'abc', 'abc', 'abc' ] }
              , { key: 'def', value: [ 'def' ] }
              , { key: 'foo', value: [ 'foo', 'foo' ] }
              , { key: 'bar', value: [ 'bar' ] }
            ]);
        });

        it('should make available the array index to the key transformer', function () {
            var o = [ 'abc', 'abc', 'def', 'foo', 'bar', 'foo', 'abc' ]
              , t = trans(o).group(null, null, function (x) { return x + this.getIndex(); }).value();
            assert.deepEqual(t, [
                { key: 'abc0', value: [ 'abc' ] }
              , { key: 'abc1', value: [ 'abc' ] }
              , { key: 'def2', value: [ 'def' ] }
              , { key: 'foo3', value: [ 'foo' ] }
              , { key: 'bar4', value: [ 'bar' ] }
              , { key: 'foo5', value: [ 'foo' ] }
              , { key: 'abc6', value: [ 'abc' ] }
            ]);
        });

        it('should be able to specify the group key and value names', function () {
            var o = [ 1, 1, 2, 2, 4 ]
              , t = trans(o).group(':num:data').value();
            assert.deepEqual(t, [
                { num: 1, data: [ 1, 1 ] }
              , { num: 2, data: [ 2, 2 ] }
              , { num: 4, data: [ 4 ] }
            ]);
        });

        it('should apply key transformations before grouping', function () {
            var o = [ { a: 'foo' }, { a: 'bar' }, { a: 'baz' } ]
              , t = trans(o).group('a:letter:obj', null, ['charAt', 1], 'toUpperCase').value();
            assert.deepEqual(t, [
                { letter: 'O', obj: [ { a: 'foo' } ] }
              , { letter: 'A', obj: [ { a: 'bar' }, { a: 'baz' } ] }
            ]);
        });

        it('should work with nested arrays 1', function () {
            var o = [
                    { a: [ { b: 1 }, { b: 2 } ] }
                  , { a: [ { b: 2 }, { b: 2 } ] }
                  , { a: [ { b: 1 }, { b: 3 } ] }
                  , { a: [ { b: 3 }, { b: 4 } ] } ]
              , t = trans(o).group('a.b', null, sum).value();
            assert.deepEqual(t, [
                { key: 3, value: [ { a: [ { b: 1 }, { b: 2 } ] } ] }
              , { key: 4, value: [ { a: [ { b: 2 }, { b: 2 } ] }, { a: [ { b: 1 }, { b: 3 } ] }] }
              , { key: 7, value: [ { a: [ { b: 3 }, { b: 4 } ] } ] }
            ]);
        });

        it('should work with nested arrays 2', function () {
            var o = [
                    [ { a: { b: 1 } }, { a: { b: 2 } } ]
                  , [ { a: { b: 3 } } ]
                  , [ { a: { b: 4 } }, { a: { b: 5 } } ] ]
              , t = trans(o).group('a.b', null, sum).value();
            assert.deepEqual(t, [
                { key: 3, value: [
                    [ { a: { b: 1 } }, { a: { b: 2 } } ], [ { a: { b: 3 } } ] ]
                }
              , { key: 9, value: [
                    [ { a: { b: 4 } }, { a: { b: 5 } } ] ]
                }
            ]);
        });

        it('should group an array by the given key - array2', function () {
            var o = [ { a: [ 1, 2 ] }, { a: [ 1 ] }, { a: [ 3 ] } ]
              , t = trans(o).group('a', null, sum).value();
            assert.deepEqual(t, [
                { key: 3, value: [ { a: [ 1, 2 ] }, { a: [ 3 ] } ] }
              , { key: 1, value: [ { a: [ 1 ] } ] }
            ]);
        });

        it('should group an array by the given key - array3', function () {
            var o = [ { a: [ 1, 2 ] }, { a: [ 1 ] }, { a: [ 2 ] } ]
              , t = trans(o).group('a', null, 'length').value();
            assert.deepEqual(t, [
                { key: 2, value: [ { a: [ 1, 2 ] } ] }
              , { key: 1, value: [ { a: [ 1 ] }, { a: [ 2 ] } ] }
            ]);
        });

        it('should pass missing keys as null through transformers', function () {
            var o = [ { a: { b: 1 } }, { a: { b: 2 } }, { a: {} }, { a: { b: 1 } } ]
              , t = trans(o).group('a.b', null, [add, 1]).value();
            assert.deepEqual(t, [
                { key: 2, value: [ { a: { b: 1 } }, { a: { b: 1 } } ] }
              , { key: 3, value: [ { a: { b: 2 } } ] }
              , { key: 1, value: [ { a: {} } ] }
            ]);
        });

        it('should group by the items in an array', function () {
            var o = [
                    { a: 1, c: { b: [ 'a', 'b' ] } }
                  , { a: 2, c: { b: [ 'a' ] } }
                  , { a: 3, c: { b: [ 'b' ] } }
                  , { a: 4, c: { b: [ 'c' ] } }
                  , { a: 5, c: { b: [ 'd', 'e' ] } } ]
              , t = trans(o).group('c.b.').value();
            assert.deepEqual(t, [
                { key: 'a', value: [
                    { a: 1, c: { b: [ 'a', 'b' ] } }
                  , { a: 2, c: { b: [ 'a' ] } } ]
                }
              , { key: 'b', value: [
                    { a: 1, c: { b: [ 'a', 'b' ] } }
                  , { a: 3, c: { b: [ 'b' ] } } ]
                }
              , { key: 'c', value: [ { a: 4, c: { b: [ 'c' ] } } ] }
              , { key: 'd', value: [ { a: 5, c: { b: [ 'd', 'e' ] } } ] }
              , { key: 'e', value: [ { a: 5, c: { b: [ 'd', 'e' ] } } ] }
            ]);
        });

        it('should make the array index available when grouping by the items in an array', function () {
            var o = [
                    { a: 1, c: { b: [ 'a', 'b' ] } }
                  , { a: 2, c: { b: [ 'a' ] } }
                  , { a: 3, c: { b: [ 'b' ] } }
                  , { a: 4, c: { b: [ 'c' ] } }
                  , { a: 5, c: { b: [ 'd', 'e' ] } } ]
              , t = trans(o)
                   .group('c.b.', 'a', function (x) { return x + ':' + this.getIndexes(); })
                   .value();
            assert.deepEqual(t, [
                { key: 'a:0,0', value: [ 1 ] }
              , { key: 'b:1,0', value: [ 1 ] }
              , { key: 'a:0,1', value: [ 2 ] }
              , { key: 'b:0,2', value: [ 3 ] }
              , { key: 'c:0,3', value: [ 4 ] }
              , { key: 'd:0,4', value: [ 5 ] }
              , { key: 'e:1,4', value: [ 5 ] }
            ]);
        });

        it('should group by the items in an array and apply key transformations', function () {
            var o = [
                    { a: [ { b: 1 }, { b: 2 } ] }
                  , { a: [ { b: 2 }, { b: 2 } ] }
                  , { a: [ { b: 3 }, { b: 2 } ] } ]
               ,t = trans(o).group('a.', null, 'b').value();
            assert.deepEqual(t, [
                { key: 1, value: [ { a: [ { b: 1 }, { b: 2 } ] } ] }
              , { key: 2, value: [
                    { a: [ { b: 1 }, { b: 2 } ] }
                  , { a: [ { b: 2 }, { b: 2 } ] }
                  , { a: [ { b: 3 }, { b: 2 } ] } ]
                }
              , { key: 3, value: [ { a: [ { b: 3 }, { b: 2 } ] } ] }
            ]);
        });


        it('should group by the items in an array with custom names', function () {
            var o = [ { a: 1, b: [ 1, 2 ] }, { a: 2, b: [ 1 ] }, { a: 3, b: [ 3 ] } ]
              , t = trans(o).group('b.:k:v').value();
            assert.deepEqual(t, [
                { k: 1, v: [ { a: 1, b: [ 1, 2 ] }, { a: 2, b: [ 1 ] } ] }
              , { k: 2, v: [ { a: 1, b: [ 1, 2 ] } ] }
              , { k: 3, v: [ { a: 3, b: [ 3 ] } ] }
            ]);
        });

        it('should be able to specify the group value 1', function () {
            var o = [ { a: 1, b: [ 1, 2 ] }, { a: 2, b: [ 1 ] }, { a: 3, b: [ 3 ] } ]
              , t = trans(o).group('b.:k:v', 'b').value();
            assert.deepEqual(t, [
                { k: 1, v: [ [ 1, 2 ], [ 1 ] ] }
              , { k: 2, v: [ [ 1, 2 ] ] }
              , { k: 3, v: [ [ 3 ] ] }
            ]);
        });

        it('should be able to specify the group value 2', function () {
            var o = [ { a: 1, b: 'A' }, { a: 1, b: 'B' }, { a: 3, b: 'C' } ]
              , t = trans(o).group('a:num:letters', 'b').value();
            assert.deepEqual(t, [
                { num: 1, letters: [ 'A', 'B' ] }
              , { num: 3, letters: [ 'C' ] }
            ]);
        });

        it('should be able to specify the group value 3', function () {
            var o = [
                    { a: 1, b: { c: 'one' } }
                  , { a: 2, b: { c: 'two' } },
                  , { a: 3, b: { c: 'three' } },
                  , { a: 10, b: { c: 'ten' } },
                  , { a: 11, b: { c: 'eleven' } },
                  , { a: 20, b: { c: 'twenty' } } ]
              , t = trans(o).group('a', 'b.c', [mod, 10]).value();
            assert.deepEqual(t, [
                { key: 1, value: [ 'one', 'eleven' ] }
              , { key: 2, value: [ 'two' ] }
              , { key: 3, value: [ 'three' ] }
              , { key: 0, value: [ 'ten', 'twenty' ] }
            ]);
        });

        it('should objectify an array of objects', function () {
            var o = [ 1, 2, 1, 1, 3, 0, 0 ]
              , t = trans(o)
                   .map('.', function(x) { return { k: x, v: Boolean(x) }; })
                   .group('k', 'v')
                   .value();
            assert.deepEqual(t, [
                { key: 1, value: [ true, true, true ] }
              , { key: 2, value: [ true ] }
              , { key: 3, value: [ true ] }
              , { key: 0, value: [ false, false ] }
            ]);
        });

        it('should throw if the group target is not an array', function () {
            assert.throws(function() {
                trans({ a: 1 }).group('a');
            }, /the group target is not an array/i);
        });
    });

    describe('groupf', function () {
        it('should group the object at the given field - object', function () {
            var o = { a: { b: [ 1, 1, 3, 3, 1, 2 ] } }
              , e = { a: { b: [
                    { key: 1, value: [ 1, 1, 1 ] }
                  , { key: 9, value: [ 3, 3 ] }
                  , { key: 4, value: [ 2 ] }
                ] } }
              , t = trans(o).groupf('a.b', null, null, square).value();
            assert.deepEqual(t, e);
        });

        it('should group the object at the given field - array1', function () {
            var o = { a: [ { b: [ 1, 1, 2 ] }, { b: [ 3, 3 ] }, { b: [ 1, 2, 3 ] } ] }
              , e = { a: [
                    { b: [ { key: 1, value: [ 1, 1 ] }, { key: 2, value: [ 2 ] } ] }
                  , { b: [ { key: 3, value: [ 3, 3 ] } ] }
                  , { b: [ { key: 1, value: [ 1 ] }, { key: 2, value: [ 2 ] }, { key: 3, value: [ 3 ] } ] }
                ] }
              , t = trans(o).groupf('a.b').value();
            assert.deepEqual(t, e);
        });

        it('should group the object at the given field - array2', function () {
            var o = { a: [ { b: [ 1, 1, 2 ] }, { b: [ 3, 3 ] }, { b: [ 1, 2, 3 ] } ] }
              , e = { a: [
                    { key: 3, value: [ { b: [ 1, 1, 2 ] }, { b: [ 1, 2, 3 ] } ] }
                  , { key: 2, value: [ { b: [ 3, 3 ] } ] }
                ]}
              , t = trans(o).groupf('a', 'b', null, 'length').value();
            assert.deepEqual(t, e);
        });

        it('should handle nested arrays', function () {
            var o = [
                    { a: [ { b: 1 }, { b: 2 }, { b: 3 } ] }
                  , { a: [ { b: 3 }, { b: 3 }, { b: 3 } ] }
                  , { a: [ { b: 4 } ] }
                ]
              , t = trans(o).groupf('a', 'b:k:v', null, [mod, 2]).value();
            assert.deepEqual(t, [
                { a: [ { k: 1, v: [ { b: 1 }, { b: 3 } ] }, { k: 0, v: [ { b: 2 } ] } ] }
              , { a: [ { k: 1, v: [ { b: 3 }, { b: 3 }, { b: 3 } ] } ] }
              , { a: [ { k: 0, v: [ { b: 4 } ] } ] }
            ]);
        });
    });

    describe('groupff', function () {
        it('should group the target value and set it on the destination field', function () {
            var o = { a: [ 1, 2, 1, 1 ], b: { c: 1 } }
              , t = trans(o).groupff('a', 'b.c', ':k:v', null, [add, 1]).value();
            assert.deepEqual(t, {
                a: [ 1, 2, 1, 1 ]
              , b: { c: [ { k: 2, v: [ 1, 1, 1 ] }, { k: 3, v: [ 2 ] } ] }
            });
        });

        it('should work with nested arrays', function () {
            var o = [
                    { a: [ 1, 2, 3 ] }
                  , { a: [ 11, 12, 13, 14 ] }
                  , { a: [ 99, 98, 77 ] } ]
              , t = trans(o).groupff('a', 'c', null, null, [mod, 2]).value();
            assert.deepEqual(t, [
                {
                    a: [ 1, 2, 3 ]
                  , c: [ { key: 1, value: [ 1, 3 ] }, { key: 0, value: [ 2 ] } ]
                }
              , {
                    a: [ 11, 12, 13, 14 ]
                  , c: [ { key: 1, value: [ 11, 13 ] }, { key: 0, value: [ 12, 14 ] } ]
                }
              , {
                    a: [ 99, 98, 77 ]
                  , c: [ { key: 1, value: [ 99, 77 ] }, { key: 0, value: [ 98 ] } ]
                }
            ]);
        });
    });
};
