module.exports = function (util) {
    var trans  = util.trans
      , assert = util.assert
      , square = util.square
      , gt     = util.gt
      , lt     = util.lt
      , mod    = util.mod
      , sum    = util.sum
      , add    = util.add;

    describe('filter', function () {
        it('should filter by the specified field', function () {
            var o = [ { a: { b: 1 } }, { a: { b: 0 } }, { a: { b: 3 } } ]
              , t = trans(o).filter('a.b').value();
            assert.deepEqual(t, [ { a: { b: 1 } }, { a: { b: 3 } }  ]);
        });

        it('should filter by the specified field and predicate', function () {
            var o = [ { a: [ 1, 2 ] }, { a: [ 3, 6 ] }, { a: [ 1, 4 ] }, { a: [ 1, 5 ] } ]
              , t = trans(o).filter('a', sum, [mod, 3], Boolean).value();
            assert.deepEqual(t, [ { a: [ 1, 4 ] } ]); });

        it('should handle nested arrays 1', function () {
            var o = [
                    { a: { b: [ { c: 1 }, { c: 2 }, { c: 3 } ] } }
                  , { a: { b: [ { c: 5 }, { c: 10 }, { c: 15 } ] } }
                  , { a: { b: [ { c: 100 }, { c: 200 }, { c: 300 } ] } }
                  , { a: { b: [ { c: 7 }, { c: 13 }, { c: 19 } ] } } ]
              , t = trans(o).filter('a.b.c', sum, [gt, 35]).value();
            assert.deepEqual(t, [
                { a: { b: [ { c: 100 }, { c: 200 }, { c: 300 } ] } }
              , { a: { b: [ { c: 7 }, { c: 13 }, { c: 19 } ] } } ]);
        });

        it('should handle nested arrays 2', function () {
            var o = [
                    [ { a: [ { b: 'a' }, { b: 'c' } ] }, { a: [ { b: 'b' } ] }, { a: [ { b: 'c1' }, { b: 'c2' }, { b: 'c3' } ] } ]
                  , [ { a: [ { b: 'u' } ] }, { a: [ { b: 's' }, { b: 'q' } ] }, { a: [ { b: 't' } ] } ]
                  , [ { a: [ { b: 'p' } ] }, { a: [ { b: 'q' } ] }, { a: [ { b: 'r' } ] } ]
                  , [ { a: [ { b: 'x' } ] }, { a: [ { b: 'y' }, { b: 'yy' }, { b: 'yyy' } ] }, { a: [ { b: 'z' } ] } ]
                ]
              , t = trans(o).filter('a.b', trans
                  , 'flatten', 'value', ['join', ''], ['match', /cbc1|yyyz/]).value();
            assert.deepEqual(t, [
                [ { a: [ { b: 'a' }, { b: 'c' } ] }, { a: [ { b: 'b' } ] }, { a: [ { b: 'c1' }, { b: 'c2' }, { b: 'c3' } ] } ]
              , [ { a: [ { b: 'x' } ] }, { a: [ { b: 'y' }, { b: 'yy' }, { b: 'yyy' } ] }, { a: [ { b: 'z' } ] } ]
            ]);
        });

        it('should handle nested arrays 3', function () {
            var o = [
                    [ { a: [ { b: [ 1 ] }, { b: [ 2, 3 ] }, ] }, { a: [ { b: [ 5 ] } ] } ]
                  , [ { a: [ { b: [ 10, 11, 23, 35 ] }, { b: [ 25, 3 ] }, ] }, { a: [ { b: [ 13 ] } ] } ]
                  , [ { a: [ { b: [ 36 ] }, { b: [ 2, 3 ] }, ] }, { a: [ { b: [ 18, 19, 20 ] } ] } ]
                  , [ { a: [ { b: [ 100, 99, 98 ] }, { b: [ 2, 3 ] }, ] }, { a: [ { b: [ 28, 19, 20 ] } ] } ]
                ]
                , t = trans(o).filter('a.b', trans, ['flatten', true], 'value', sum, [lt, 100]).value();
            assert.deepEqual(t, [
                [ { a: [ { b: [ 1 ] }, { b: [ 2, 3 ] }, ] }, { a: [ { b: [ 5 ] } ] } ]
              , [ { a: [ { b: [ 36 ] }, { b: [ 2, 3 ] }, ] }, { a: [ { b: [ 18, 19, 20 ] } ] } ]
            ]);
        });

        it('should make the array index available to the predicate', function () {
            var o = [ 1, 2, 3, 4, 5, 6, 7, 7 ]
              , t = trans(o).filter(null, function (x) { return this.index % 2 === 1; }).value();
            assert.deepEqual(t, [ 2, 4, 6, 7 ]);
        });

        it('should throw if the filter target is not an array', function () {
            assert.throws(function() {
                trans({ a: 1 }).filter('a');
            }, /the filter target is not an array/i);
        });
    });

    describe('filterf', function () {
        it('should filter the array at the given field', function () {
            var o = { a: [ 1, 2, 1, 1, 4, 5 ] }
              , t = trans(o).filterf('a', null, [mod, 2]).value();
            assert.deepEqual(t, { a: [ 1, 1, 1, 5 ] });
        });
    });

    describe('filterff', function () {
        it('should filter the array at the source field and set it on the destination', function () {
            var o = { a: [ 1, 2, 1, 1, 4, 5 ] }
              , t = trans(o).filterff('a', 'b', null, [mod, 2]).value();
            assert.deepEqual(t, { a: [ 1, 2, 1, 1, 4, 5 ], b: [ 1, 1, 1, 5 ] });
        });
    });
};
