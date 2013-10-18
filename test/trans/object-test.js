module.exports = function (util) {
    var trans  = util.trans
      , assert = util.assert
      , add    = util.add
      , sum    = util.sum
      , square = util.square;

    describe('object', function () {
        it('should objectify an array by the given key', function () {
            var o  = [ { a: 1, b: 'foo' }, { a: 2, b: 'wow' }, { a: 3, b: 'pow' } ]
              , t1 = trans(o).object('a').value()
              , t2 = trans(o).object('b').value();

            assert.deepEqual(t1, {
                1: { a: 1, b: 'foo' }
              , 2: { a: 2, b: 'wow' }
              , 3: { a: 3, b: 'pow' }
            });

            assert.deepEqual(t2, {
                foo: { a: 1, b: 'foo' }
              , wow: { a: 2, b: 'wow' }
              , pow: { a: 3, b: 'pow' }
            });
        });

        it('should objectify an array by the given key and value', function () {
            var o  = [ { a: 1, b: 'foo' }, { a: 2, b: 'wow' }, { a: 3, b: 'pow' } ]
              , t = trans(o).object('b', 'a').value();
            assert.deepEqual(t, { foo: 1, wow: 2, pow: 3 });
        });

        it('should handle nested keys', function () {
            var o = [ { a: { b: { c: 2 } } }, { a: { b: { c: 3 } } }, { a: { b: { c: 4 } } } ]
              , t = trans(o).object('a.b.c').value();
            assert.deepEqual(t, {
                2: { a: { b: { c: 2 } } }
              , 3: { a: { b: { c: 3 } } }
              , 4: { a: { b: { c: 4 } } }
            });
        });

        it('should handle nested values 1', function () {
            var o = [ { a: { b: { c: 2, d: 'A' } } }, { a: { b: { c: 3, d: 'B' } } }, { a: { b: { c: 4, d: 'C' } } } ]
              , t = trans(o).object('a.b.c', 'a.b.d').value();
            assert.deepEqual(t, {
                2: 'A'
              , 3: 'B'
              , 4: 'C'
            });
        });

        it('should handle nested values 2', function () {
            var o = [
                    { a: { b: { c: 1 } }, d: { e: 'A' } }
                  , { a: { b: { c: 2 } }, d: { e: 'B' } }
                  , { a: { b: { c: 3 } }, d: { e: 'C' } }
                  , { a: { b: { c: 4 } }, d: { e: 'D' } } ]
              , t = trans(o).object('a.b.c', 'd.e').value();
            assert.deepEqual(t, {
                1: 'A'
              , 2: 'B'
              , 3: 'C'
              , 4: 'D'
            });
        });

        it('should allow any key and any value on each source object', function () {
            var o = [
                    { a: { b: 'A' }, c: [ { d: 10 }, { d: 20 }, { d: 30 } ] }
                  , { a: { b: 'B' }, c: [ { d: 11 }, { d: 21 }, { d: 31 } ] }
                  , { a: { b: 'C' }, c: [ { d: 12 }, { d: 22 }, { d: 32 } ] } ]
              , t = trans(o).object('a.b', 'c.d', ['concat', '_FOO']).value();
            assert.deepEqual(t, {
                A_FOO: [ 10, 20, 30 ]
              , B_FOO: [ 11, 21, 31 ]
              , C_FOO: [ 12, 22, 32 ]
            });
        });

        it('should allow keys that are arrays', function () {
            var o = [
                    { a: [ 8, 2, 3 ], b: '823' }
                  , { a: [ 2, 3, 5 ], b: '235' }
                  , { a: [ 2, 3, 5, 9 ], b: '2359' } ]
              , t = trans(o).object('a', 'b').value();
            assert.deepEqual(t, { '8,2,3': '823' , '2,3,5': '235' , '2,3,5,9': '2359' });
        });

        it('should allow keys that are arrays and apply transformations', function () {
            var o = [
                    { a: [ 8, 2, 3 ], b: '823' }
                  , { a: [ 2, 3, 5 ], b: '235' }
                  , { a: [ 2, 3, 5, 9 ], b: '2359' } ]
              , t = trans(o).object('a', 'b', sum).value();
            assert.deepEqual(t, { 13: '823' , 10: '235' , 19: '2359' });
        });

        it('should allow keys that are items of an array', function () {
            var o = [
                    { a: [ 8, 2, 4 ], b: '824' }
                  , { a: [ 1, 3, 5 ], b: '135' }
                  , { a: [ 7, 6 ], b: '76' } ]
              , t = trans(o).object('a.', 'b').value();
            assert.deepEqual(t, {
                1: '135'
              , 2: '824'
              , 3: '135'
              , 4: '824'
              , 5: '135'
              , 6: '76'
              , 7: '76'
              , 8: '824'
            });
        });

        it('should let the last value win in case of collisions', function () {
            var o = [ { a: 1, b: 'A' }, { a: 2, b: 'B' }, { a: 1, b: 'C' } ]
              , t = trans(o).object('a', 'b').value();
            assert.deepEqual(t, { 1: 'C', 2: 'B' });
        });

        it('should make the array index available to the key field transformer', function () {
            var o = [ { a: 1, b: 'A' }, { a: 2, b: 'B' }, { a: 1, b: 'C' } ]
              , t = trans(o)
                   .object('a', 'b', function (x) { return x + ':' + this.getIndex(); })
                   .value();
            assert.deepEqual(t, { '1:0': 'A', '2:1': 'B', '1:2': 'C' });
        });

        it('should apply key transformations before creating the object', function () {
            var o = [ { a: 'abc', b: 1 }, { a: 'cde', b: 2 }, { a: 'efg', b: 3 } ]
              , t = trans(o).object('a', null, 'toUpperCase').value();
            assert.deepEqual(t, {
                ABC: { a: 'abc', b: 1 }
              , CDE: { a: 'cde', b: 2 }
              , EFG: { a: 'efg', b: 3 }
            });
        });

        it('should work with nested arrays 1', function () {
            var o = [
                    { a: [ { b: 1 }, { b: 2 } ] }
                  , { a: [ { b: 2 }, { b: 2 } ] }
                  , { a: [ { b: 3 }, { b: 2 } ] } ]
              , t = trans(o).object('a.b', 'a', sum).value();
            assert.deepEqual(t, {
                3: [ { b: 1 }, { b: 2 } ]
              , 4: [ { b: 2 }, { b: 2 } ]
              , 5: [ { b: 3 }, { b: 2 } ]
            });
        });

        it('should work with nested arrays 2', function () {
            var o = [
                    { a: [ { b: 1 }, { b: 2 } ] }
                  , { a: [ { b: 3 }, { b: 4 } ] }
                  , { a: [ { b: 5 }, { b: 6 } ] } ]
              , t = trans(o)
                   .object('a.b.', 'a.b', function (x) { return x + ':' + this.getIndexes(); })
                   .value();
            assert.deepEqual(t, {
                '1:0,0': [ 1, 2 ]
              , '2:1,0': [ 1, 2 ]
              , '3:0,1': [ 3, 4 ]
              , '4:1,1': [ 3, 4 ]
              , '5:0,2': [ 5, 6 ]
              , '6:1,2': [ 5, 6 ]
            });
        });

        it('should objectify an array of strings', function () {
            var o = [ 'abc', 'def', 'wow', 'dew', 'pow', 'wow', 'dew' ]
              , t = trans(o).object().value();
            assert.deepEqual(t, { abc: 'abc', def: 'def', wow: 'wow', dew: 'dew', pow: 'pow' });
        });

        it('should objectify an array of numbers', function () {
            var o = [ 1, 2, 1, 1, 3, 0, 0 ]
              , t = trans(o).object(null, null, [add, 1]).value();
            assert.deepEqual(t, { 2: 1, 3: 2, 4: 3, 1: 0 });
        });

        it('should objectify an array of objects', function () {
            var o = [ 1, 2, 1, 1, 3, 0, 0 ]
              , t = trans(o)
                   .map('.', function(x) { return { k: x, v: Boolean(x) }; })
                   .object('k', 'v')
                   .value();
            assert.deepEqual(t, { 1: true, 2: true, 3: true, 0: false });
        });

        it('should handle missing values', function () {
            var o = [ { a: { b: 1 } }, { a: {} }, { a: { b: 2 } } ]
              , t = trans(o).object('a.b', 'a').value();
            assert.deepEqual(t, { 1: { b: 1 }, null: {}, 2: { b: 2 } });
        });

        it('should throw if the target is not an array', function () {
            assert.throws(function () {
                trans({ a: 1 }).object('a');
            }, /the object target is not an array/i);
        });
    });

    describe('objectf', function () {
        it('should objectify the array at the given field', function () {
            var o = { a: { b: [ { c: 1, d: 'one' }, { c: 2, d: 'two' } ] } }
              , t = trans(o).objectf('a.b', 'c', 'd', square).value();
            assert.deepEqual(t, { a: { b: { 1: 'one', 4: 'two' } } });
        });

        it('should objectify all target arrays 1', function () {
            var o = [ { a: [ 1, 2 ] }, { a: [ 2, 4 ] }, { a: [ 5 ] } ]
              , t = trans(o).objectf('a').value();
            assert.deepEqual(t, [
                { a: { 1: 1, 2: 2 } }
              , { a: { 2: 2, 4: 4 } }
              , { a: { 5: 5 } }
            ]);
        });

        it('should objectify all target arrays 2', function () {
            var o = [ { a: [ 'ab', 'cd' ] }, { a: [ 'foo', 'bar' ] }, { a: [ 'aaa' ] } ]
              , t = trans(o).objectf('a', null, null, ['charAt', 0], 'toUpperCase').value();
            assert.deepEqual(t, [
                { a: { A: 'ab', C: 'cd' } }
              , { a: { F: 'foo', B: 'bar' } }
              , { a: { A: 'aaa' } }
            ]);
        });
    });

    describe('objectff', function () {
        it('should objectify the source array and set it on the destination', function () {
            var o = { a: { b: [ { c: 1, d: 'one' }, { c: 2, d: 'two' } ] }, e: 'ready' }
              , t = trans(o).objectff('a.b', 'e', 'c', 'd').value();
            assert.deepEqual(t, {
                a: { b: [ { c: 1, d: 'one' }, { c: 2, d: 'two' } ] }
              , e: { 1: 'one', 2: 'two' }
            });
        });
    });
};
