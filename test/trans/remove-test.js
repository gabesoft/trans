module.exports = function (util) {
    var trans  = util.trans
      , assert = util.assert
      , square = util.square
      , mod    = util.mod
      , sum    = util.sum
      , add    = util.add;

    describe('remove', function () {
        it('should remove the specified fields', function () {
            var o = {
                    a: {
                        b: 1
                      , c: 2
                      , p: { d: 3, e: 4 }
                      , q: { g: 5, h: 6, f: { k: 8, l: 10, r: 22  } }
                    }
                  , m: { n: 11 }
                }
              , t = trans(o).remove('a.b', 'a.p.e', 'a.q.g', 'a.q.f.r', 'm').value();
            assert.deepEqual(t, {
                a: {
                    c: 2
                  , p: { d: 3 }
                  , q: { h: 6, f: { k: 8, l: 10 } }
                }
            });
        });

        it('should not remove null fields if not specified', function () {
            var o = { a: 1, b: { c: 'a', d: null, e: 2 } }
              , t = trans(o).remove('b.c').value();
            assert.deepEqual(t, { a: 1, b: { d: null, e: 2 } });
        });

        it('should not change the object if no fields are specified', function () {
            var o = {
                    a: {
                        b: 1
                      , c: 2
                      , p: { d: 3, e: 4 }
                      , q: { g: 5, h: 6, f: { k: 8, l: 10, r: 22  } }
                      , r: [ { s: { t: [ 1 ] } }, { s: { t: [ 2, 3, 4 ] } } ]
                    }
                  , m: { n: 11 }
                }
              , t = trans(o).remove().value();
            assert.deepEqual(t, o);
            assert.strictEqual(t, o);
        });

        it('should remove all the specified fields in place', function () {
            var o = {
                    a: {
                        b: 1
                      , c: 2
                      , p: { d: 3, e: 4 }
                      , q: { g: 5, h: 6, f: { k: 8, l: 10, r: 22  } }
                      , r: [ { s: { t: [ 1 ] } }, { s: { t: [ 2, 3, 4 ] } } ]
                    }
                  , m: { n: 11 }
                }
              , t = trans(o).remove('a.c', 'a.p.e', 'a.q.f.k', 'a.r.s.t').value();
            assert.deepEqual(o, {
                a: {
                    b: 1
                  , p: { d: 3 }
                  , q: { g: 5, h: 6, f: { l: 10, r: 22  } }
                  , r: [ { s: {} }, { s: {} } ]
                }
              , m: { n: 11 }
            });
            assert.deepEqual(t, o);
            assert.strictEqual(t, o);
        });

        it('should remove the specified fields on all objects in an array', function () {
            var o = [
                    { a: { b: 'a', c: 'b' }, d: { e: 1, f: 2 } }
                  , { a: { b: 'b', c: 'e' }, d: { e: 2, f: 3 } }
                  , { a: { b: 'c', c: 'f' }, d: { e: 3, f: 4 } }
                  , { a: { b: 'd', c: 'g' }, d: { e: 4, f: 5 } }
                ]
              , t = trans(o).remove('a', 'd.f').value();
            assert.deepEqual(t, [
                { d: { e: 1 } }
              , { d: { e: 2 } }
              , { d: { e: 3 } }
              , { d: { e: 4 } }
            ]);
        });

        it('should handle missing keys', function () {
            var o = [ { a: { b: 1, c: 2 } }, { a: { c: 3 } }, {} ]
              , t = trans(o).remove('a.c').value();
            assert.deepEqual(t, [ { a: { b: 1 } }, { a: {} }, {} ]);
        });

        it('should handle functions', function () {
            var o = { a: { b: 1, c: function () { return 1; } }, e: 2, f: 3 }
              , t = trans(o).remove('a.b', 'e').value();
            assert.strictEqual(
                util.stringify(t)
              , util.stringify({ a: { c: function () { return 1; } }, f: 3  }));
        });

        it('should remove an array field', function () {
          var o = { a: 1, b: [ 1, 2, 4 ] }
            , t = trans(o).remove('b').value();
          assert.deepEqual(t, { a: 1 });
        });

        it('should work with nested arrays 1', function () {
            var o = [
                    { a: { b: [ { c: 10, d: 10 }, { c: 20, d: 20 } ], d: 'a', e: [ { f: 2 } ] } }
                  , { a: { b: [ { c: 11, d: 11 }, { c: 12, d: 12 } ], d: 'b', e: [ { f: 2 } ] } }
                  , { a: { b: [ { c: 21, d: 21 }, { c: 22, d: 22 } ], d: 'c', e: [ { f: 2 } ] } }
                ]
              , t = trans(o).remove('a.b.c', 'a.e').value();
            assert.deepEqual(t, [
                { a: { b: [ { d: 10 }, { d: 20 } ], d: 'a' } }
              , { a: { b: [ { d: 11 }, { d: 12 } ], d: 'b' } }
              , { a: { b: [ { d: 21 }, { d: 22 } ], d: 'c' } }
            ]);
        });

        it('should handle primitives', function () {
            var o = { a: { b: 1 } }
              , t = trans(o).remove('a.b.c').value();
            assert.deepEqual(t, o);
        });

        it('should work with nested arrays 2', function () {
            var o = [ [
                    { a: [
                        { b: 1, c: [
                            { d: 1, e: 2, f: { g: 1, h: 2 } }, { d: 1, e: 2, f: { g: 1, h: 2 } } ]
                        }
                      , { b: 2, c: [
                            { d: 2, e: 3, f: { g: 2, h: 3 } }, { d: 2, e: 3, f: { g: 2, h: 3 } } ]
                        }
                      , { b: 2, c: [
                            { d: 2, e: 3, f: { g: 2, h: 3 } }, { d: 2, e: 3, f: { g: 2, h: 3 } } ]
                        } ]
                    , b: 4
                    }
                  , { a: [
                        { b: 1, c: [
                            { d: 1, e: 2, f: { g: 1, h: 2 } }, { d: 1, e: 2, f: { g: 1, h: 2 } } ]
                        }
                      , { b: 2, c: [
                            { d: 2, e: 3, f: { g: 2, h: 3 } }, { d: 2, e: 3, f: { g: 2, h: 3 } } ]
                        }
                      , { b: 2, c: [
                            { d: 2, e: 3, f: { g: 2, h: 3 } }, { d: 2, e: 3, f: { g: 2, h: 3 } } ]
                        } ]
                  , b: 4
                    }]
              , [
                    { a: [
                        { b: 1, c: [
                            { d: 1, e: 2, f: { g: 1, h: 2 } }, { d: 1, e: 2, f: { g: 1, h: 2 } } ]
                        }
                      , { b: 2, c: [
                            { d: 2, e: 3, f: { g: 2, h: 3 } }, { d: 2, e: 3, f: { g: 2, h: 3 } } ]
                        }
                      , { b: 2, c: [
                            { d: 2, e: 3, f: { g: 2, h: 3 } }, { d: 2, e: 3, f: { g: 2, h: 3 } } ]
                        } ]
                    , b: 4
                    }
                  , { a: [
                        { b: 1, c: [
                            { d: 1, e: 2, f: { g: 1, h: 2 } }, { d: 1, e: 2, f: { g: 1, h: 2 } } ]
                        }
                      , { b: 2, c: [
                            { d: 2, e: 3, f: { g: 2, h: 3 } }, { d: 2, e: 3, f: { g: 2, h: 3 } } ]
                        }
                      , { b: 2, c: [
                            { d: 2, e: 3, f: { g: 2, h: 3 } }, { d: 2, e: 3, f: { g: 2, h: 3 } } ]
                        } ]
                  , b: 4
                    }]]
              , t = trans(o).remove('b', 'a.b', 'a.c.d', 'a.c.f.g').value();
            assert.deepEqual(t, [
                [
                    { a: [
                        { c: [ { e: 2, f: { h: 2 } }, { e: 2, f: { h: 2 } } ] }
                      , { c: [ { e: 3, f: { h: 3 } }, { e: 3, f: { h: 3 } } ] }
                      , { c: [ { e: 3, f: { h: 3 } }, { e: 3, f: { h: 3 } } ] } ]
                    }
                  , { a: [
                        { c: [ { e: 2, f: { h: 2 } }, { e: 2, f: { h: 2 } } ] }
                      , { c: [ { e: 3, f: { h: 3 } }, { e: 3, f: { h: 3 } } ] }
                      , { c: [ { e: 3, f: { h: 3 } }, { e: 3, f: { h: 3 } } ] } ]
                    }
                ]
              , [
                    { a: [
                        { c: [ { e: 2, f: { h: 2 } }, { e: 2, f: { h: 2 } } ] }
                      , { c: [ { e: 3, f: { h: 3 } }, { e: 3, f: { h: 3 } } ] }
                      , { c: [ { e: 3, f: { h: 3 } }, { e: 3, f: { h: 3 } } ] } ]
                    }
                  , { a: [
                        { c: [ { e: 2, f: { h: 2 } }, { e: 2, f: { h: 2 } } ] }
                      , { c: [ { e: 3, f: { h: 3 } }, { e: 3, f: { h: 3 } } ] }
                      , { c: [ { e: 3, f: { h: 3 } }, { e: 3, f: { h: 3 } } ] } ]
                    }
                ] ]);
        });
    });
};
