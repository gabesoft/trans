module.exports = function (util) {
    var trans  = util.trans
      , assert = util.assert
      , add    = util.add
      , sum    = util.sum
      , square = util.square;

    describe('map', function () {
        it('should map the transformation state - object1', function () {
            var o = 'abc'
              , t = trans(o).map('toUpperCase').value();
            assert.strictEqual(t, 'ABC');
        });

        it('should map the transformation state - object2', function () {
            var o = { a: 'abc' }
              , t = trans(o).map('a', 'toUpperCase').value();
            assert.strictEqual(t, 'ABC');
        });

        it('should map the transformation state - object3', function () {
            var o = { a: { b: 'abc' } }
              , t = trans(o).map('a', 'b', ['substring', 1, 3], 'toUpperCase').value();
            assert.strictEqual(t, 'BC');
        });

        it('should map the transformation state - object3', function () {
            var o = { a: { b: { c: 1 } } }
              , t = trans(o).map('a', 'b', 'c').value();
            assert.strictEqual(t, 1);
        });

        it('should map the transformation state - array1a', function () {
            var o = [ 1, 2, 3 ]
              , t = trans(o).map('.', [add, 1]).value();
            assert.deepEqual(t, [ 2, 3, 4 ]);
        });

        it('should accept functions in array format1', function () {
            var o = [ 1, 2, 3 ]
              , t = trans(o).map('.', [add, 5]).value();
            assert.deepEqual(t, [ 6, 7, 8 ]);
        });

        it('should pass in the element index when iterating through an array', function () {
            var o = [ 'a', 'b', 'c', 'd' ]
              , t = trans(o).map('.', function (x) { return x + this.getIndex(); }).value();
            assert.deepEqual(t, [ 'a0', 'b1', 'c2', 'd3' ]);
        });

        it('should accept functions in array format2', function () {
            var o = [ 'ab', 'cde' ]
              , t = trans(o).map('.', ['concat', 'ww', 'zz']).value();
            assert.deepEqual(t, [ 'abwwzz', 'cdewwzz' ]);
        });

        it('should map the transformation state - array 1', function () {
            var o = [ { b: 1, c: 3 }, { b: 2, c: 3 } ]
              , t = trans(o).map('.', function(x) { return x.b + x.c; }).value();
            assert.deepEqual(t, [ 4, 5 ] );
        });

        it('should map the transformation state - array1b', function () {
            var o = [ { a: 1 }, { a: 2 }, {a: 3 } ]
              , t = trans(o).map('.', 'a', [add, 1]).value();
            assert.deepEqual(t, [ 2, 3, 4 ]);
        });

        it('should map the transformation state - array1c', function () {
            var o = [ { a: { b: 1 } }, { a: { b: 2 } }, {a: { b: 3 } } ]
              , t = trans(o).map('.', 'a', 'b', [add, 1]).value();
            assert.deepEqual(t, [ 2, 3, 4 ]);
        });

        it('should map the transformation state - array1d', function () {
            var o = [
                    { a: [ { b: 1 }, { b: 2 } ] }
                  , { a: [ { b: 2 }, { b: 2 } ] }
                  , { a: [ { b: 1 }, { b: 3 } ] }
                  , { a: [ { b: 3 }, { b: 4 } ] } ]
              , t = trans(o).map('.', 'a', '.', 'b', [add, 5]).value();
            assert.deepEqual(t, [ [ 6, 7 ], [ 7, 7 ], [ 6, 8 ], [ 8, 9 ] ]);
        });

        it('should map the transformation state - array1e', function () {
            var o = [
                    { a: [ { b: 1 }, { b: 2 } ] }
                  , { a: [ { b: 2 }, { b: 2 } ] }
                  , { a: [ { b: 1 }, { b: 3 } ] }
                  , { a: [ { b: 3 }, { b: 4 } ] } ]
              , t = trans(o).map('.', 'a').value();
            assert.deepEqual(t, [
                [ { b: 1 }, { b: 2 } ]
              , [ { b: 2 }, { b: 2 } ]
              , [ { b: 1 }, { b: 3 } ]
              , [ { b: 3 }, { b: 4 } ] ]);
        });

        it('should map the transformation state - array2', function () {
            var o = [ 'abc', 'de', 'defg' ]
              , t = trans(o).map('length').value();
            assert.deepEqual(t, 3);
        });

        it('should map the transformation state - array2', function () {
            var o = [ 'abc', 'de', 'defg' ]
              , t = trans(o).map('length').value();
            assert.deepEqual(t, 3);
        });

        it('should map the transformation state - array3', function () {
            var o = [ 'abc', 'de', 'defg' ]
              , t = trans(o).map('.', 'length').value();
            assert.deepEqual(t, [ 3, 2, 4 ]);
        });

        it('should apply multiple transformers in the given order', function () {
            var o  = [ 1, 2, 3 ]
              , e1 = trans(o).map('.', square, [add, 1]).value()
              , e2 = trans(o).map('.', [add, 1], square).value();
            assert.deepEqual(e1, [ 2, 5, 10 ]);
            assert.deepEqual(e2, [ 4, 9, 16 ]);
        });

        it('should allow passing field names for transformers', function () {
            var o  = [ 1, 2, 3 ]
              , t = trans(o).map('length', [add, 2]).value();
            assert.strictEqual(t, o.length + 2);
        });

        it('should work with transformers that return null', function () {
            var o = 'abc'
              , t = trans(o).map(function () { return null; }).value();
            assert.strictEqual(t, null);
        });

        it('should collect values from nested arrays', function () {
            var o = [
                    [ { a: { b: 1 } }, { a: { b: 2 } } ]
                  , [ { a: { b: 3 } } ]
                  , [ { a: { b: 4 } }, { a: { b: 5 } } ] ]
              , t = trans(o).map('.', '.', 'a','b', [add, 5]);
            assert.deepEqual(t.value(), [ [ 6, 7 ], [ 8 ], [ 9, 10 ] ]);
            assert.deepEqual(t.map('.', sum).value(), [ 13, 8, 19 ]);
            assert.deepEqual(t.map(sum).value(), 40);
        });

        it('should allow passing hash maps as transformers', function () {
            var o    = [ 1, 2, 3, 4 ]
              , nums = { 1: 'one', 2: 'two', 3: 'three', 4: 'four' }
              , t    = trans(o).map('.', nums).value();
            assert.deepEqual(t, [ 'one', 'two', 'three', 'four' ]);
        });
    });

    describe('mapf', function () {
        it('should map the object at the given field - object', function () {
            var o = { a: 1 }
              , t = trans(o).mapf('a', [add, 1]).value();
            assert.deepEqual(t, { a: 2 });
        });

        it('should behave like map if the specified field is null', function () {
            var o = [ 1, 2 ]
              , t = trans(o).mapf(null, 'length').value();
            assert.strictEqual(t, 2);
        });

        it('should map the object at the given field - array1a', function () {
            var o = { a: { b: [ 1, 2, 3 ] } }
              , t = trans(o).mapf('a.b.', square, [add, 1]).value();
            assert.deepEqual(t, { a: { b: [ 2, 5, 10 ] } });
        });

        it('should map the object at the given field - array1b', function () {
            var o = { a: { b: [ 1, 2, 3 ] } }
              , t = trans(o).mapf('a.b', 'length', [add, 1]).value();
            assert.deepEqual(t, { a: { b: 4 } });
        });

        it('should replace an array with its first element', function () {
            var o = { a: { b: [ 1, 2, 3 ] } }
              , t = trans(o).mapf('a.b', 'shift').value();
            assert.deepEqual(t, { a: { b: 1 } });
        });

        it('should replace an array with its last element', function () {
            var o = { a: { b: [ 1, 2, 3 ] } }
              , t = trans(o).mapf('a.b', 'pop').value();
            assert.deepEqual(t, { a: { b: 3 } });
        });

        it('should take only the first x elements from an array', function () {
            var o = { a: { b: [ 1, 2, 3, 4, 4, 5, 8 ] } }
              , t = trans(o).mapf('a.b', ['slice', 0, 3]).value();
            assert.deepEqual(t, { a: { b: [ 1, 2, 3 ] } });
        });

        it('should map the object at the given field - array2', function () {
            var o = { a: [ { b: 1 }, { b: 2 }, { b: 3 } ] }
              , t = trans(o).mapf('a.b', [add, 1], square).value();
            assert.deepEqual(t, { a: [ { b: 4 }, { b: 9 }, { b: 16 } ] });
        });

        it('should map the object at the given field - array3', function () {
            var o = { a: [ { b: { c: 1 } }, { b: { c: 2 } }, { b: { c: 3 } } ] }
              , t = trans(o).mapf('a.b.c', [add, 1], square).value();
            assert.deepEqual(t, { a: [ { b: { c: 4 } }, { b: { c: 9 } }, { b: { c: 16 } } ] });
        });

        it('should map the object at the given field - array4', function () {
            var o = [ { a: { b: { c: 'abc' } } }, { a: { b: { c: 'def' } } } ]
              , t = trans(o).mapf('a.b.c', 'toUpperCase').value();
            assert.deepEqual(t, [ { a: { b: { c: 'ABC' } } }, { a: { b: { c: 'DEF' } } } ]);
        });

        it('should map the object at the given field - array5', function () {
            var o = [
                    { a: [ { b: { c: 1 } }, { b: { c: 2 } } ] }
                  , { a: [ { b: { c: 2 } }, { b: { c: 3 } } ] } ]
              , t = trans(o).mapf('a.b.c', [add, 1]).value();

            assert.deepEqual(t, [
                { a: [ { b: { c: 2 } }, { b: { c: 3 } } ] }
              , { a: [ { b: { c: 3 } }, { b: { c: 4 } } ] } ]);
        });

        it('should map the object at the given field - array6', function () {
            var o = { a: [ { b: [ 1, 1, 2 ] }, { b: [ 3, 3 ] }, { b: [ 1, 2, 3 ] } ] }
              , t = trans(o).mapf('a.b.', [add, 1]).value();
            assert.deepEqual(t, { a: [ { b: [ 2, 2, 3 ] }, { b: [ 4, 4 ] }, { b: [ 2, 3, 4 ] } ] });
        });

        it('should map the object at the given field - array7', function () {
            var o = { a: [ { b: [ 1, 1, 2 ] }, { b: [ 3, 3 ] }, { b: [ 1, 2, 3 ] } ] }
              , t = trans(o).mapf('a.b', 'length').value();
            assert.deepEqual(t, { a: [ { b: 3 }, { b: 2 }, { b: 3 } ] });
        });

        it('should create missing fields 1', function () {
            var o = [ { a: { b: 1 } }, { a: { } }, { a: { b: 3 } } ]
              , t = trans(o).mapf('a.b', [add, 1]).value();
            assert.deepEqual(t, [ { a: { b: 2 } }, { a: { b: 1 } }, { a: { b: 4 } } ]);
        });

        it('should create missing fields 2', function () {
            var o = { a: { b: {} } }
              , t = trans(o).mapf('a.b.c', [add, 1]).value();
            assert.deepEqual(t, { a: { b: { c: 1 } } });
        });

        it('should work with nested fields', function () {
            var o = { a: { b: { c: 'abc' } } }
              , t = trans(o).mapf('a.b.c', 'toUpperCase').value();
            assert.deepEqual(t, { a: { b: { c: 'ABC' } } });
        });

        it('should work with nested arrays', function () {
            var o = { a: [ [ { b: 1 } ], [ { b: 2 } ] ] }
              , t = trans(o).mapf('a.b', [add, 1]).value();
            assert.deepEqual(t, { a: [ [ { b: 2 } ], [ { b: 3 } ] ] });
        });

        it('should handle empty objects', function () {
            var o = [ {}, {} ]
              , t = trans(o).mapf('b', [ add, 1 ]).value();
            assert.deepEqual(t, [ { b: 1 }, { b: 1 } ]);
        });

        it('should pass the index when iterating arrays 1', function () {
            var o = { a: [
                    { b: [ 'a', 'b', 'c' ] }
                  , { b: [ 'd', 'e' ] }
                  , { b: [ 'f' ] } ] }
              , t = trans(o).mapf('a.b.', function(x) { return x + this.getIndex(); }).value();
            assert.deepEqual(t, { a: [
                { b: [ 'a0', 'b1', 'c2' ] }
              , { b: [ 'd0', 'e1' ] }
              , { b: [ 'f0' ] } ] });
        });

        it('should pass the index when iterating arrays 2', function () {
            var o = [
                    { a: [ { b: [ 'aa', 'ab' ] }, { b: [ 'ac', 'ad', 'ae' ] } ] }
                  , { a: [ { b: [ 'ba', 'bb' ] }, { b: [ 'bc', 'bd', 'be' ] } ] }
                  , { a: [ { b: [ 'ca', 'cb' ] }, { b: [ 'cc', 'cd', 'ce' ] } ] }
                  , { a: [ { b: [ 'da', 'db' ] }, { b: [ 'dc', 'dd', 'de' ] } ] } ]
              , t = trans(o)
                   .map('.', 'a', '.', 'b', '.', function (x) { return x + this.getIndex(); })
                   .value();
            assert.deepEqual(t, [
                [ [ 'aa0', 'ab1' ], [ 'ac0', 'ad1', 'ae2' ] ]
              , [ [ 'ba0', 'bb1' ], [ 'bc0', 'bd1', 'be2' ] ]
              , [ [ 'ca0', 'cb1' ], [ 'cc0', 'cd1', 'ce2' ] ]
              , [ [ 'da0', 'db1' ], [ 'dc0', 'dd1', 'de2' ] ]
            ]);
        });
    });

    describe('mapff', function () {
        it('should map the object at the given field - object', function () {
            var o = { a: 1 }
              , t = trans(o).mapff('a', 'c', [add, 1]).value();
            assert.deepEqual(t, { a: 1, c: 2 });
        });

        it('should iterate the array when there is a final dot in the field name', function () {
            var o = { a: { b: [ 1, 2, 3 ] } }
              , t = trans(o).mapff('a.b.', 'c', square, [add, 1]).value();
            assert.deepEqual(t, { a: { b: [ 1, 2, 3 ] }, c: [ 2, 5, 10 ] });
        });

        it('should not iterate the array when there is no final dot in the field name', function () {
            var o = { a: { b: [ 1, 2, 3 ] } }
              , t = trans(o).mapff('a.b', 'c', 'length', [add, 1], square).value();
            assert.deepEqual(t, { a: { b: [ 1, 2, 3 ] }, c: 16 });
        });

        it('should map the object at the given field - array1c', function () {
            var o = { a: { b: [ 1, 2, 3 ] } }
              , t = trans(o).mapff('a.b.', 'a.b', square, [add, 1]).value();
            assert.deepEqual(t, { a: { b: [ 2, 5, 10 ] } });
        });

        it('should map the object at the given field - array1d', function () {
            var o = { a: { b: [ 1, 2, 3 ] } }
              , t = trans(o).mapff('a.b', 'a.b', sum).value();
            assert.deepEqual(t, { a: { b: 6 } });
        });

        it('should map the object at the given field - array2a', function () {
            var o = { a: [ { b: 1 }, { b: 2 }, { b: 3 } ] }
              , t = trans(o).mapff('a.b', 'a.c', [add, 1], square).value();
            assert.deepEqual(t, { a: [ { b: 1, c: 4 } , { b: 2, c: 9 } , { b: 3, c: 16 } ] });
        });

        it('should map the object at the given field - array2b', function () {
            var o = { a: [ { b: 1 }, { b: 2 }, { b: 3 } ] }
              , t = trans(o).mapff('a.b', 'c', '.', [add, 1], square).value();
            assert.deepEqual(t, { a: [ { b: 1 }, { b: 2 }, { b: 3 } ] , c: [ 4, 9, 16 ] });
        });

        it('should map the object at the given field - array2c', function () {
            var o = { a: [ { b: 1 }, { b: 2 }, { b: 3 } ] }
              , t = trans(o).mapff('a', 'c').value();
            assert.deepEqual(t, {
                a: [ { b: 1 }, { b: 2 }, { b: 3 } ]
              , c: [ { b: 1 }, { b: 2 }, { b: 3 } ] });
        });

        it('should map the correct source to the correct destination', function () {
            var o = { a: [ { b: 1 }, { b: 2 }, { b: 3 } ], e: [ { b: 1 }, { b: 2 } ] }
              , t = trans(o).mapff('a.b', 'e.c').value();
            assert.deepEqual(t, {
                a: [ { b: 1 }, { b: 2 }, { b: 3 } ]
              , e: [ { b: 1, c: [ 1, 2, 3 ] }, { b: 2, c: [ 1, 2, 3 ] } ]
            });
        });

        it('should map the correct source to the correct destination - nested arrays', function () {
            var o = { a: [ { b: 1 }, { b: 2 }, { b: 3 } ], e: [ [ { b: 1 } ], [ { b: 2 } ] ] }
              , t = trans(o).mapff('a.b', 'e.c').value();
            assert.deepEqual(t, {
                a: [ { b: 1 }, { b: 2 }, { b: 3 } ]
              , e: [ [ { b: 1, c: [ 1, 2, 3 ] } ], [ { b: 2, c: [ 1, 2, 3 ] } ] ]
            });
        });

        it('should create a field on the target object(s)', function () {
            var o = { a: [ { b: 1 }, { b: 2 }, { b: 3 } ] }
              , t = trans(o).mapff('a.c', 'a.c', function () { return 'a'; }).value();
            assert.deepEqual(t, { a: [ { b: 1, c: 'a' } , { b: 2, c: 'a' } , { b: 3, c: 'a' } ] });
        });

        it('should work with nested fields within an array', function () {
            var o = { a: [ { b: { c: 1 } }, { b: { c: 2 } }, { b: { c: 3 } } ] }
              , t = trans(o).mapff('a.b.c', 'd', '.', [add, 1], square).value();
            assert.deepEqual(t, {
                a: [ { b: { c: 1 } }, { b: { c: 2 } }, { b: { c: 3 } } ]
              , d: [ 4, 9, 16 ]
            });
        });

        it('should replace nested fields within arrays 1', function () {
            var o = { a: [ { b: { c: 1 } }, { b: { c: 2 } }, { b: { c: 3 } } ] }
              , t = trans(o).mapff('a.b.c', 'a.b', [add, 1], square).value();
            assert.deepEqual(t, { a: [ { b: 4 }, { b: 9 }, { b: 16 } ] });
        });

        it('should replace nested fields within arrays 2', function () {
            var o = [ { a: { b: { c: 'abc' } } }, { a: { b: { c: 'def' } } } ]
              , t = trans(o).mapff('a.b.c', 'a', 'toUpperCase').value();
            assert.deepEqual(t, [ { a: 'ABC' }, { a: 'DEF' } ]);
        });

        it('should map fields within the proper object 1', function () {
            var o = { a: [ { b: { c: 1 } }, { b: { c: 2 } }, { b: { c: 3 } } ] }
              , t = trans(o).mapff('a.b.c', 'a.b.d', [add, 1], square).value();
            assert.deepEqual(t, { a: [
                { b: { c: 1, d: 4 } }
              , { b: { c: 2, d: 9 } }
              , { b: { c: 3, d: 16 } } ] });
        });

        it('should map fields within the proper object 2', function () {
            var o = [
                    { a: { b: { c: 'abc' } } }
                  , { a: { b: { c: 'def' } } } ]
              , t = trans(o).mapff('a.b.c', 'd', 'toUpperCase').value();
            assert.deepEqual(t, [
                { a: { b: { c: 'abc' } }, d: 'ABC' }
              , { a: { b: { c: 'def' } }, d: 'DEF' }
            ]);
        });

        it('should map fields within the proper object 3', function () {
            var o = [
                    { a: [ { b: { c: 1 } }, { b: { c: 2 } } ] }
                  , { a: [ { b: { c: 2 } }, { b: { c: 3 } } ] } ]
              , t = trans(o).mapff('a.b.c', 'd', '.', [add, 1], square).value();
            assert.deepEqual(t, [
                { a: [ { b: { c: 1 } }, { b: { c: 2 } } ], d: [ 4, 9 ] }
              , { a: [ { b: { c: 2 } }, { b: { c: 3 } } ], d: [ 9, 16 ] } ]);
        });

        it('should map fields within the proper object 4', function () {
            var o = [
                    { a: [ { b: { c: 1 } }, { b: { c: 2 } } ] }
                  , { a: [ { b: { c: 2 } }, { b: { c: 3 } } ] } ]
              , t = trans(o).mapff('a.b.c', 'a.b', [add, 1], square).value();
            assert.deepEqual(t, [
                { a: [ { b: 4 }, { b: 9 } ] }
              , { a: [ { b: 9 }, { b: 16 } ] } ]);
        });

        it('should map fields within the proper object 5', function () {
            var o = [
                    { a: [ { b: { c: 1 } }, { b: { c: 2 } } ] }
                  , { a: [ { b: { c: 2 } }, { b: { c: 3 } } ] } ]
              , t = trans(o).mapff('a.b.c', 'a', '.', [add, 1], square).value();
            assert.deepEqual(t, [
                { a: [ 4, 9 ] }
              , { a: [ 9, 16 ] } ]);
        });

        it('should map fields within the proper object 6', function () {
            var o = [
                    { a: [ { b: { c: 1 } }, { b: { c: 2 } } ] }
                  , { a: [ { b: { c: 2 } }, { b: { c: 3 } } ] } ]
              , t = trans(o).mapff('a.b.c', 'a.b.d', [add, 1], square).value();
            assert.deepEqual(t, [
                { a: [ { b: { c: 1, d: 4 } }, { b: { c: 2, d: 9 } } ] }
              , { a: [ { b: { c: 2, d: 9 } }, { b: { c: 3, d: 16 } } ] } ]);
        });

        it('should map fields within the proper object 7', function () {
            var o = [ { a: [ { b: { c: 1 } }, { b: { c: 2 } } ] }, { a: [ { b: { c: 3 } } ] } ]
              , t = trans(o).mapff('a.b.c', 'e', sum).value();
            assert.deepEqual(t, [
                { a: [ { b: { c: 1 } }, { b: { c: 2 } } ], e: 3 }
              , { a: [ { b: { c: 3 } } ], e: 3 } ]);
        });

        it('should not skip missing fields 1', function () {
            var o = [ { a: { b: 1 } }, { a: { } }, { a: { b: 3 } } ]
              , t = trans(o).mapff('a.b', 'c', [add, 1]).value();
            assert.deepEqual(t, [
                { a: { b: 1 }, c: 2 }
              , { a: { },      c: 1 }
              , { a: { b: 3 }, c: 4 }
            ]);
        });

        it('should not skip missing fields 2', function () {
            var o = { a: { b: {} } }
              , t = trans(o).mapff('a.b.c', 'd', [add, 1]).value();
            assert.deepEqual(t, { a: { b: {} }, d: 1 });
        });

        it('should not skip missing fields 3', function () {
            var o = [ { a: { b: 1 } }, { a: { b: 2 } }, { a: {} }, { a: {} } ]
              , t = trans(o)
                   .mapff('a.b', 'a.b', function (x) { return x || 100; })
                   .value();
            assert.deepEqual(t, [
                { a: { b: 1 } }
              , { a: { b: 2 } }
              , { a: { b: 100 } }
              , { a: { b: 100 } } ]);
        });

        it('should allow nested fields', function () {
            var o = { a: { b: { c: 'abcde' } } }
              , t = trans(o)
                   .mapff('a.b.c', 'a.d', 'toUpperCase', util.truncate)
                   .value();
            assert.deepEqual(t, { a: { b: { c: 'abcde' }, d: 'ABC' } });
        });

        it('should override fields with the same name 1', function () {
            var o = { a: { b: 3 } }
              , t = trans(o).mapff('a.b', 'a').value();
            assert.deepEqual(t, { a: 3 });
        });

        it('should override fields with the same name 2', function () {
            var o = {
                    a: [ { b: 1 }, { b: 2 }, { b: 3 } ]
                  , e: [ { b: 1, c: 'a' }, { b: 2, c: 'b' } ] }
              , t = trans(o).mapff('a.b', 'e.c').value();
            assert.deepEqual(t, {
                a: [ { b: 1 }, { b: 2 }, { b: 3 } ]
              , e: [ { b: 1, c: [ 1, 2, 3 ] }, { b: 2, c: [ 1, 2, 3 ] } ]
            });
        });

        it('should override fields with the same name 3', function () {
            var o = {
                    a: [ { b: '1' }, { b: '2' }, { b: '3' } ]
                  , e: [ { b: 1, c: 'a' }, { b: 2, c: 'b' } ] }
              , t = trans(o).mapff('a.b', 'e.c', '.', function (x) { return x + ':' + this.getIndex(); }).value();
            assert.deepEqual(t, {
                a: [ { b: '1' }, { b: '2' }, { b: '3' } ]
              , e: [
                    { b: 1, c: [ '1:0', '2:1', '3:2' ] }
                  , { b: 2, c: [ '1:0', '2:1', '3:2' ] }
                ]
            });
        });

        it('should work with nested arrays 1', function () {
            var o = [ [ { a: { b: 1 } }, { a: { b: 2 } } ], [ { a: { b: 3 } } ] ]
              , t = trans(o).mapff('a.b', 'a.c', [add, 2]).value();
            assert.deepEqual(t, [
                [ { a: { b: 1, c: 3 } }, { a: { b: 2, c: 4 } } ]
              , [ { a: { b: 3, c: 5 } } ]
            ]);
        });

        it('should work with nested arrays 2', function () {
            var o = [ [ { a: { b: 1 } }, { a: { b: 2 } } ], [ { a: { b: 3 } } ] ]
              , t = trans(o).mapff('a.b', 'c', [add, 2]).value();
            assert.deepEqual(t, [
                [ { a: { b: 1 }, c: 3 }, { a: { b: 2 }, c: 4 } ]
              , [ { a: { b: 3 }, c: 5 } ]
            ]);
        });

        it('should make all array indexes available', function () {
            var o = [
                    { a: { b: [ { c: [ 'a', 'b' ] }, { c: [ 'c', 'd', 'e' ] } ] } }
                  , { a: { b: [ { c: [ 'f', 'g', 'k' ] }, { c: [ 'l', 'm', 'n', 'o' ] }, { c: [ 'r', 's' ] } ] } }
                  , { a: { b: [ { c: [ 't', 'u', 'v', 'w' ] } ] } }
                ]
              , t = trans(o).mapff('a.b.c.', null, '.', function (x) {
                    return x + ':' + this.getIndexes() + ':' + this.getIndex();
                }).value();
            assert.deepEqual(t, [
                [ [ 'a:0,0,0:0', 'b:1,0,0:1' ], [ 'c:0,1,0:0', 'd:1,1,0:1', 'e:2,1,0:2' ] ]
              , [
                    [ 'f:0,0,1:0', 'g:1,0,1:1', 'k:2,0,1:2' ]
                  , [ 'l:0,1,1:0', 'm:1,1,1:1', 'n:2,1,1:2', 'o:3,1,1:3' ]
                  , [ 'r:0,2,1:0', 's:1,2,1:1' ]
                ]
              , [ [ 't:0,0,2:0', 'u:1,0,2:1', 'v:2,0,2:2', 'w:3,0,2:3' ] ] ]);
        });

        it('should parse field paths properly', function () {
            var o = [ { names: { taught: [ 1, 2, 4 ] } }, { names: { taught: [ 1 ] } } ]
              , t = trans(o).mapff('names.taught', 'names.taughtCount', 'length').value();
            assert.deepEqual(t, [
                { names: { taught: [ 1, 2, 4 ], taughtCount: 3 } }
              , { names: { taught: [ 1 ], taughtCount: 1 } }
            ]);
        });

        it('should replace the whole object when the destination field is null 1', function () {
            var o = [ 1, 2, 3 ]
              , t = trans(o).mapff(null, null, 'length').value();
            assert.strictEqual(t, 3);
        });

        it('should replace the whole object when the destination field is null 2', function () {
            var o = [ 1, 2, 3 ]
              , t = trans(o).mapff('.', null, [add, 1]).value();
            assert.deepEqual(t, [2, 3, 4]);
        });

        it('should replace the whole object when the destination field is null 3', function () {
            var o = [ { a: { b: [ 1, 2 ] } }, { a: { b: [ 4 ] } }, { a: { b: [ 6, 7 ,8 ] } } ]
              , t = trans(o).mapff('a.b').value();
            assert.deepEqual(t, [ [ 1, 2 ], [ 4 ], [ 6, 7, 8 ] ]);
        });

        it('should replace the whole object when the destination field is null 3b', function () {
            var o = [ { a: { b: [ 'a', 'b' ] } }, { a: { b: [ 'c' ] } }, { a: { b: [ 'd', 'e' ,'f' ] } } ]
              , t = trans(o).mapff('a.b.', null, function (x) { return x + this.getIndex(); }).value();
            assert.deepEqual(t, [ [ 'a0', 'b1' ], [ 'c0' ], [ 'd0', 'e1', 'f2' ] ]);
        });

        it('should replace the whole object when the destination field is null 4', function () {
            var o = [
                    { a: [ { b: [ 1, 2 ] }, { b: [ 3, 4 ] } ] }
                  , { a: [ { b: [ 4 ] }, { b: [ 11, 22 ] }, { b: [ 199 ] } ] }
                  , { a: [ { b: [ 6, 7 ,8 ] } ] } ]
              , t = trans(o).mapff('a.b').value();
            assert.deepEqual(t, [
                [ [ 1, 2 ], [ 3, 4 ] ]
              , [ [ 4 ], [ 11, 22 ], [ 199 ] ]
              , [ [ 6, 7, 8 ] ]
            ]);
        });

        it('should handle falsy values 1', function () {
            var o = { a: 0 }
              , t = trans(o).mapff('a', 'b', square).value();
            assert.deepEqual(t, { a: 0, b: 0 });
        });

        it('should handle falsy values 2', function () {
            var o = { a: { b: 0 } }
              , t = trans(o).mapff('a.b', 'a.c', square).value();
            assert.deepEqual(t, { a: { b: 0, c: 0 }});
        });

        it('should handle falsy values 3', function () {
            var t = trans(0).mapff(null, null, square).value();
            assert.strictEqual(t, 0);
        });

        it('should handle empty arrays', function () {
            var t = trans([]).mapff('a.b', 'a.c', [ add, 1 ]).value();
            assert.deepEqual(t, []);
        });

        it('should handle empty objects', function () {
            var o = [ {}, {} ]
              , t = trans(o).mapff('a', 'b', [ add, 1 ]).value();
            assert.deepEqual(t, [ { b: 1 }, { b: 1 } ]);
        });

        it('should replace the whole object when the destination field is null 5', function () {
            var o = [ { a: { b: 1 } }, { a: { b: 2 } }, { a: {} }, { a: {} } ]
              , t = trans(o)
                   .mapff('a.b', null, function (x) { return x || 100; }, [add, 2])
                   .value();
            assert.deepEqual(t, [ 3, 4, 102, 102 ]);
        });

        it('should allow setting a field on the source object 1', function () {
            var o = { a: { b: 1, c: 2 } }
              , t = trans(o).mapff('a', 'a.d', function (x) { return x.b + x.c; }).value();
            assert.deepEqual(t, { a: { b: 1, c: 2, d: 3 } });
        });

        it('should allow setting a field on the source object 2', function () {
            var o = { a: [ { b: 1 }, { b: 2 } ] }
              , t = trans(o).mapff('a', 'a.c', 'b', [ add, 1 ]).value();
            assert.deepEqual(t, { a: [ { b: 1, c: 2 }, { b: 2, c: 3 } ] });
        });

        it('should allow setting a field on the source object 3', function () {
            var o = [ { a: [ { b: 1 }, { b: 2 } ] }, { a: [ { b: 2 } ] } ]
              , t = trans(o).mapff(null, 'a.c', 'a', 'length').value();
            assert.deepEqual(t, [
                { a: [ { b: 1, c: 2 }, { b: 2, c: 2 } ] }
              , { a: [ { b: 2, c: 1 } ] } ]);
        });

        it('should allow setting a field on the source object 4', function () {
            var o = [ { a: [ { b: { c: 1 } }, { b: { c: 2 } } ] }, { a: [ { b: { c: 3 } } ] } ]
              , t = trans(o).mapff(null, 'a.b.d', 'a', 'length').value();
            assert.deepEqual(t, [
                { a: [ { b: { c: 1, d: 2 } }, { b: { c: 2, d: 2 } } ] }
              , { a: [ { b: { c: 3, d: 1 } } ] } ]);
        });

        it('should allow setting a field on the source object 5', function () {
            var o = [ { a: [ { b: { c: 1 } }, { b: { c: 2 } } ] }, { a: [ { b: { c: 3 } } ] } ]
              , t = trans(o).mapff('a.b', 'a.b.d', function (x) { return x.c + 1; }).value();
            assert.deepEqual(t, [
                { a: [ { b: { c: 1, d: 2 } }, { b: { c: 2, d: 3 } } ] }
              , { a: [ { b: { c: 3, d: 4 } } ] } ]);
        });

        it('should allow setting a field on the source object 6', function () {
            var o = { a: 1, b: 2 }
              , t = trans(o).mapff(null, 'c', function (x) { return x.a + x.b; }).value();
            assert.deepEqual(t, { a: 1, b: 2, c: 3 });
        });

        it('should allow setting a field on the source object 7', function () {
            var o = [ { b: 1, c: 3 }, { b: 2, c: 3 } ]
              , t = trans(o).mapff(null, 'd', function(x) { return x.b + x.c; }).value();
            assert.deepEqual(t, [ { b: 1, c: 3, d: 4 }, { b: 2, c: 3, d: 5 } ]);
        });

        it('should allow setting a field on the source object 8', function () {
            var o = { a: [ { b: 1, c: 3 }, { b: 2, c: 3 } ] }
              , t = trans(o).mapff('a', 'a.d', function(x) { return x.b + x.c; }).value();
            assert.deepEqual(t, { a: [ { b: 1, c: 3, d: 4 }, { b: 2, c: 3, d: 5 } ] });
        });

        it('should allow setting a field on the source object 9', function () {
            var o = { a: [ { b: 1, c: 3 }, { b: 2, c: 3 } ] }
              , t = trans(o).mapff('a', 'd', '.', function(x) { return x.b + x.c; }).value();
            assert.deepEqual(t, { a: [ { b: 1, c: 3 }, { b: 2, c: 3 } ], d: [ 4, 5 ] });
        });

        it('should allow setting a field on the source object 10', function () {
              var o = [
                    { a: [ { b: 1, c: 3 }, { b: 2, c: 3 } ] },
                    { a: [ { b: 5, c: 3 }, { b: 7, c: 3 } ] } ]
              , t = trans(o).mapff('a', 'a.d', function(x) { return x.b + x.c; }).value();
            assert.deepEqual(t, [
              { a: [ { b: 1, c: 3, d: 4 }, { b: 2, c: 3, d: 5 } ] },
              { a: [ { b: 5, c: 3, d: 8 }, { b: 7, c: 3, d: 10 } ] }
            ]);
        });

        it('should allow setting a field on the source object - nested arrays', function () {
            var o = [
                    [ { a: { b: 1, c: 10 } }, { a: { b: 2, c: 20 } } ]
                  , [ { a: { b: 3, c: 30 } } ] ]
              , t = trans(o).mapff('a', 'a.e', function (x) { return x.b + x.c; }).value();
            assert.deepEqual(t, [
                [ { a: { b: 1, c: 10, e: 11 } }, { a: { b: 2, c: 20, e: 22 } } ]
              , [ { a: { b: 3, c: 30, e: 33 } } ]
            ]);
        });

        it('should fail when the destination field is not on an object', function () {
            assert.throws(function () {
                trans({ a: { b: 1 }, c: { d: 1 } }).mapff('a.b', 'c.d.e');
            }, Error);
        });
    });
};
