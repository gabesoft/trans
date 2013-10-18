module.exports = function (util) {
    var trans  = util.trans
      , assert = util.assert
      , square = util.square
      , mod    = util.mod
      , sum    = util.sum
      , add    = util.add;

    describe('value', function () {
        it('should return the transformation state', function () {
            var o = { a: 1 };
            assert.strictEqual(trans(o).value(), o);
        });
    });

    describe('get', function () {
        it('should get the transformation state', function () {
            var o = { a: 1 };
            trans(o).get(function (e) { assert.strictEqual(e, o); });
        });

        it('should allow further chaining', function () {
            var o = { a: 1 }
              , e = trans(o).get().value();
              assert.strictEqual(e, o);
        });
    });
};
