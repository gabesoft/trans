module.exports = function (util) {
  var trans  = util.trans
    , assert = util.assert;

  describe('flatten', function () {
      it('should flatten an array - shallow', function () {
          var o = [ [ [ 1 ], [ 2 ] ], [ [ 1, 2, 3 ], [ 4 ] ] ]
            , t = trans(o).flatten().value();
          assert.deepEqual(t, [ [ 1 ], [ 2 ], [ 1, 2, 3 ], [ 4 ] ]);
      });

      it('should flatten an array - deep', function () {
          var o = [ [ [ 1 ], [ 2 ] ], [ [ 1, 2, 3 ], [ 4 ] ] ]
            , t = trans(o).flatten(true).value();
          assert.deepEqual(t, [ 1, 2, 1, 2, 3, 4 ]);
      });

      it('should leave the object unchanged if not an array', function () {
          var o = { a: 1 }
            , t = trans(o).flatten().value();
          assert.strictEqual(t, o);
      });
  });

  describe('flattenf', function () {
      it('should flatten the array at the given field', function () {
          var o = { a: { b: 1 }, c: { d: [ [ 'a', 'b' ], [ 'c', 'd', 'e' ], [ 'f' ] ] } }
            , t = trans(o).flattenf('c.d').value();
          assert.deepEqual(t, { a: { b: 1 }, c: { d: [ 'a', 'b', 'c', 'd', 'e', 'f' ] } });
      });
  });

  describe('flattenff', function () {
      it('should flatten the target value and set it on the destination field', function () {
          var o = { a: { b: [ [ 1 ], [ [ 2 ], 3 ], [ [ [ 4 ] ], [ 5 ] ] ] } }
            , t = trans(o).flattenff('a.b', 'c', true).value();
          assert.deepEqual(t, {
              a: { b: [ [ 1 ], [ [ 2 ], 3 ], [ [ [ 4 ] ], [ 5 ] ] ] }
            , c: [ 1, 2, 3, 4, 5 ]
          });
      });
  });
};
