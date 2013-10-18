module.exports = function (util) {
    var trans  = util.trans
      , assert = util.assert
      , square = util.square
      , mod    = util.mod
      , sum    = util.sum
      , add    = util.add;

    describe('pick', function () {
        it('should keep only the specified fields', function () {
            var o = {
                    a: {
                        b: 1
                      , c: 2
                      , p: { d: 3, e: 4 }
                      , q: { g: 5, h: 6, f: { k: 8, l: 10, r: 22  } }
                    }
                  , m: { n: 11 }
                }
              , t = trans(o).pick('a.c', 'a.p.d', 'a.q.h', 'a.q.f.k', 'a.q.f.l').value();
            assert.deepEqual(t, {
                a: {
                    c: 2
                  , p: { d: 3 }
                  , q: { h: 6, f: { k: 8, l: 10 } }
                }
            });
        });

        it('should keep only the specified field on all objects in an array', function () {
            var o = [
                    { a: { b: 'a', c: 'b' }, d: { e: 1, f: 2 } }
                  , { a: { b: 'b', c: 'e' }, d: { e: 2, f: 3 } }
                  , { a: { b: 'c', c: 'f' }, d: { e: 3, f: 4 } }
                  , { a: { b: 'd', c: 'g' }, d: { e: 4, f: 5 } }
                ]
              , t = trans(o).pick('d.e').value();
            assert.deepEqual(t, [
                { d: { e: 1 } }
              , { d: { e: 2 } }
              , { d: { e: 3 } }
              , { d: { e: 4 } }
            ]);
        });

        it('should handle missing keys', function () {
            var o = [ { a: { b: 1, c: 2 } }, { a: { c: 3 } }, {} ]
              , t = trans(o).pick('a.b').value();
            assert.deepEqual(t, [ { a: { b: 1 } }, { a: {} }, {} ]);
        });

        it('should handle functions', function () {
            var o = { a: { b: 1, c: function () { return 1; } }, e: 2, f: 3 }
              , t = trans(o).pick('a.c', 'f').value();
            assert.strictEqual(
                util.stringify(t)
              , util.stringify({ a: { c: function () { return 1; } }, f: 3  }));
        });

        it('should work with nested arrays 1', function () {
            var o = [
                    { a: { b: [ { c: 10, d: 10 }, { c: 20, d: 20 } ], d: 'a', e: [ { f: 2 } ] } }
                  , { a: { b: [ { c: 11, d: 11 }, { c: 12, d: 12 } ], d: 'b', e: [ { f: 2 } ] } }
                  , { a: { b: [ { c: 21, d: 21 }, { c: 22, d: 22 } ], d: 'c', e: [ { f: 2 } ] } }
                ]
              , t = trans(o).pick('a.b.d', 'a.d').value();
            assert.deepEqual(t, [
                { a: { b: [ { d: 10 }, { d: 20 } ], d: 'a' } }
              , { a: { b: [ { d: 11 }, { d: 12 } ], d: 'b' } }
              , { a: { b: [ { d: 21 }, { d: 22 } ], d: 'c' } }
            ]);
        });

        it('should handle primitives', function () {
            var o = { a: { b: 1 } }
              , t = trans(o).pick('a.b.c').value();
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
              , t = trans(o).pick('a.c.e', 'a.c.f.h').value();
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

    describe('pickf', function () {
        it('should apply pick at the given field 1', function () {
            var o = { a: 1, b: { c: [ { d: 1, e: 2 }, { d: 3, e: 4 } ], f: 'b' }, g: 'c' }
              , t = trans(o).pickf('b.c', 'd').value();
            assert.deepEqual(t, { a: 1, b: { c: [ { d: 1 }, { d: 3 } ], f: 'b' }, g: 'c' });
        });

        it('should apply pick at the given field 2', function () {
            var o = { a: 1, b: { c: [ { d: 1, e: 2 }, { d: 3, e: 4 } ], f: 'b' }, g: 'c' }
              , t = trans(o).pickf('b', 'c.d').value();
            assert.deepEqual(t, { a: 1, b: { c: [ { d: 1 }, { d: 3 } ] }, g: 'c' });
        });
    });

    describe('pickff', function () {
        it('should apply pick on the target and set it on the destination', function () {
            var o = { a: 1, b: { c: [ { d: 1, e: 2 }, { d: 3, e: 4 } ], f: 'b' }, g: 'c' }
              , t = trans(o).pickff('b.c', 'b.p', 'd').value();
            assert.deepEqual(t, {
                a: 1
              , b: {
                    c: [ { d: 1, e: 2 }, { d: 3, e: 4 } ]
                  , p: [ { d: 1 }, { d: 3 } ]
                  , f: 'b'
                }
              , g: 'c'
            });
        });
    });
};
