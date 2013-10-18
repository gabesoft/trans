module.exports = function (util) {
    var trans  = util.trans
      , assert = util.assert
      , square = util.square
      , mod    = util.mod
      , sum    = util.sum
      , add    = util.add;

    describe('omit', function () {
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
              , t = trans(o).omit('a.b', 'a.p.e', 'a.q.g', 'a.q.f.r', 'm').value();
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
              , t = trans(o).omit('b.c').value();
            assert.deepEqual(t, { a: 1, b: { d: null, e: 2 } });
        });

        it('should create a deep copy if no fields are specified', function () {
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
              , t = trans(o).omit().value();
            assert.deepEqual(t, o);

            delete t.a.r[0].s;
            delete t.a.p.q;
            t.a.r[1].s.t.push(100);

            assert.deepEqual(o, {
                a: {
                    b: 1
                  , c: 2
                  , p: { d: 3, e: 4 }
                  , q: { g: 5, h: 6, f: { k: 8, l: 10, r: 22  } }
                  , r: [ { s: { t: [ 1 ] } }, { s: { t: [ 2, 3, 4 ] } } ]
                }
              , m: { n: 11 }
            });
        });

        it('should handle circular references', function () {
            var o = { a: { b: [ { c: 1, d: 2 }, { c: 3, d: 4 } ] } }
              , t = null;

            o   = trans(o).mapf('a.b.c', function () { return o; }).value();
            o.e = o;
            t   = trans(o).omit().value();
        });

        it('should not modify the original object', function () {
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
              , t = trans(o).omit('a.b', 'a.p.d', 'a.r.s.t').value();
            assert.deepEqual(o, {
                a: {
                    b: 1
                  , c: 2
                  , p: { d: 3, e: 4 }
                  , q: { g: 5, h: 6, f: { k: 8, l: 10, r: 22  } }
                  , r: [ { s: { t: [ 1 ] } }, { s: { t: [ 2, 3, 4 ] } } ]
                }
              , m: { n: 11 }
            });
        });

        it('should remove the specified fields on all objects in an array', function () {
            var o = [
                    { a: { b: 'a', c: 'b' }, d: { e: 1, f: 2 } }
                  , { a: { b: 'b', c: 'e' }, d: { e: 2, f: 3 } }
                  , { a: { b: 'c', c: 'f' }, d: { e: 3, f: 4 } }
                  , { a: { b: 'd', c: 'g' }, d: { e: 4, f: 5 } }
                ]
              , t = trans(o).omit('a', 'd.f').value();
            assert.deepEqual(t, [
                { d: { e: 1 } }
              , { d: { e: 2 } }
              , { d: { e: 3 } }
              , { d: { e: 4 } }
            ]);
        });

        it('should handle missing keys', function () {
            var o = [ { a: { b: 1, c: 2 } }, { a: { c: 3 } }, {} ]
              , t = trans(o).omit('a.c').value();
            assert.deepEqual(t, [ { a: { b: 1 } }, { a: {} }, {} ]);
        });

        it('should handle functions', function () {
            var o = { a: { b: 1, c: function () { return 1; } }, e: 2, f: 3 }
              , t = trans(o).omit('a.b', 'e').value();
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
              , t = trans(o).omit('a.b.c', 'a.e').value();
            assert.deepEqual(t, [
                { a: { b: [ { d: 10 }, { d: 20 } ], d: 'a' } }
              , { a: { b: [ { d: 11 }, { d: 12 } ], d: 'b' } }
              , { a: { b: [ { d: 21 }, { d: 22 } ], d: 'c' } }
            ]);
        });

        it('should handle primitives', function () {
            var o = { a: { b: 1 } }
              , t = trans(o).omit('a.b.c').value();
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
              , t = trans(o).omit('b', 'a.b', 'a.c.d', 'a.c.f.g').value();
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

    describe('omitf', function () {
        it('should apply omit at the given field 1', function () {
            var o = { a: 1, b: { c: [ { d: 1, e: 2 }, { d: 3, e: 4 } ], f: 'b' }, g: 'c' }
              , t = trans(o).omitf('b.c', 'e').value();
            assert.deepEqual(t, { a: 1, b: { c: [ { d: 1 }, { d: 3 } ], f: 'b' }, g: 'c' });
        });

        it('should apply omit at the given field 2', function () {
            var o = { a: 1, b: { c: [ { d: 1, e: 2 }, { d: 3, e: 4 } ], f: 'b' }, g: 'c' }
              , t = trans(o).omitf('b', 'c.e', 'f').value();
            assert.deepEqual(t, { a: 1, b: { c: [ { d: 1 }, { d: 3 } ] }, g: 'c' });
        });
    });

    describe('omitff', function () {
        it('should apply omit on the target and set it on the destination', function () {
            var o = { a: 1, b: { c: [ { d: 1, e: 2 }, { d: 3, e: 4 } ], f: 'b' }, g: 'c' }
              , t = trans(o).omitff('b.c', 'b.p', 'e').value();
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
