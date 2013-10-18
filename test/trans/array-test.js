module.exports = function (util) {
    var trans  = util.trans
      , assert = util.assert
      , add    = util.add
      , sum    = util.sum
      , square = util.square;

    describe('array', function () {
        it('should turn an object into an array', function () {
            var o = { a: 1, b: 2, c: 3 }
              , t = trans(o).array().value();
            assert.deepEqual(t, [
                { key: 'a', value: 1 }
              , { key: 'b', value: 2 }
              , { key: 'c', value: 3 }
            ]);
        });

        it('should be able to specify the key and value names', function () {
            var o = { a: { b: 'A' }, c: { b: 'C' }, d: { b: 'D' } }
              , t = trans(o).array('letter', 'obj').value();
            assert.deepEqual(t, [
                { letter: 'a', obj: { b: 'A' } }
              , { letter: 'c', obj: { b: 'C' } }
              , { letter: 'd', obj: { b: 'D' } }
            ]);
        });

        it('should be able to get only keys', function () {
            var o = { a: 1, b: 2, c: 3 }
              , t = trans(o).array().map('.', 'key').value();
            assert.deepEqual(t, [ 'a', 'b', 'c' ]);
        });

        it('should be able to get only values', function () {
            var o = { a: 1, b: 2, c: 3 }
              , t = trans(o).array().map('.', 'value').value();
            assert.deepEqual(t, [ 1, 2, 3 ]);
        });

        it('should arrayify every object in an array', function () {
            var o = [ { a: 1, b: 2 }, { a: 3, b: 4, c: 5 }, { d: 6 } ]
              , t = trans(o).array().value();
            assert.deepEqual(t, [
                [ { key: 'a', value: 1 }, { key: 'b', value: 2 } ]
              , [ { key: 'a', value: 3 }, { key: 'b', value: 4 }, { key: 'c', value: 5 } ]
              , [ { key: 'd', value: 6 } ]
            ]);
        });

        it('should work with nested arrays', function () {
            var o = [ [ { a: 1, c: 3 }, { a: 1 } ], [ { a: 1, b: 2 }, { c: 3 } ] ]
              , t = trans(o).array('k', 'v').value();
            assert.deepEqual(t, [
                [ [ { k: 'a', v: 1 }, { k: 'c', v: 3 } ], [ { k: 'a', v: 1 } ] ]
              , [ [ { k: 'a', v: 1 }, { k: 'b', v: 2 } ], [ { k: 'c', v: 3 } ] ]
            ]);
        });

        it('should be reversible with object', function () {
            var o = { a: 1, b: 2, c: 3 }
              , t = trans(o).array().object('key', 'value').value();
            assert.deepEqual(t, o);
        });

        it('should throw if the target is not an object 1', function () {
            assert.throws(function () {
                trans('bad').array();
            }, /object expected/i);
        });

        it('should throw if the target is not an object 2', function () {
            assert.throws(function () {
                trans([ 'abc', 'def' ]).array();
            }, /object expected/i);
        });
    });

    describe('arrayf', function () {
        it('should arrayify the object at the given field', function () {
            var o = { a: { d: { b: 1, c: 2 } } }
              , t = trans(o).arrayf('a.d', 'k', 'v').value();
            assert.deepEqual(t, {
                a: { d: [ { k: 'b', v: 1 }, { k: 'c', v: 2 } ] }
            });
        });
    });

    describe('arrayff', function () {
        it('should arrayify the source object and set it on the destination', function () {
            var o = { a: { b: { c: 1, d: 2 } }, c: 'ready' }
              , t = trans(o).arrayff('a.b', 'c', 'k', 'v').value();
            assert.deepEqual(t, {
                a: { b: { c: 1, d: 2 } }, c: [ { k: 'c', v: 1 }, { k: 'd', v: 2 } ]
            });
        });
    });
};
