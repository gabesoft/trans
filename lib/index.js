var slice       = Array.prototype.slice
  , concat      = Array.prototype.concat
  , all         = Array.prototype.every
  , any         = Array.prototype.some
  , Context     = require('./context').Context
  , Trav        = require('./trav').Trav
  , util        = require('./util')
  , opath       = require('./opath')
  , ocopy       = require('./ocopy')
  , osort       = require('./osort')
  , ensure      = util.ensure
  , fail        = util.fail
  , isArray     = util.isArray
  , isFunction  = util.isFunction
  , isUndefined = util.isUndefined
  , isObject    = util.isObject
  , isString    = util.isString
  , toArray     = util.toArray;

function Trans (obj, options, context) {
    this._state_   = obj;
    this._context_ = new Context(context);
    this._trav_    = new Trav(this._context_);
}

function flatten (list, shallow) {
    if (!isArray(list)) { return list; }
    if (shallow && all.call(list, isArray)) { return concat.apply([], list); }

    var i    = 0
      , len  = list.length
      , out  = []
      , item = null;

    for (i = 0; i < len; i++) {
        item = list[i];
        if (!isArray(item)) {
            out.push(item);
        } else if (shallow) {
            out = out.concat(item);
        } else {
            out = out.concat(flatten(item, false));
        }
    }

    return out;
}

function objToArray (obj, k, v) {
    return Object.keys(obj).map(function (key) {
        var pair = {};
        pair[k] = key;
        pair[v] = obj[key];
        return pair;
    });
}

module.exports =  function (obj) {
    return new Trans(obj);
};

Trans.prototype.value = function() {
    return this._state_;
};

Trans.prototype.count = function () {
    return isArray(this._state_) ? this._state_.length : 1;
};

Trans.prototype.get = function(cb) {
    if (isFunction(cb)) {
        cb(this._state_);
    }
    return this;
};

Trans.prototype._create_ = function(obj) {
    return new Trans(obj, null, this._context_);
};

Trans.prototype.skip = function(n) {
    return this.map(['slice', n]);
};

Trans.prototype.take = function(n) {
    return this.map(['slice', 0, n]);
};

Trans.prototype.first = function() {
    return this.map(['slice', 0, 1], 'shift', [util.default, null]);
};

Trans.prototype.last = function() {
    return this.map(['slice', -1], 'pop', [util.default, null]);
};

Trans.prototype.uniq = function() {
    var seen = {}
      , args = toArray(arguments);

    if (args.length === 0) {
        args.push(null);
    }

    args.push(function (value) {
        var key = value + typeof value;

        if (value === null || isUndefined(value)) {
            return true;
        } else if (seen[key]) {
            return false;
        } else {
            seen[key] = true;
            return true;
        }
    });

    return this.filter.apply(this, args);
};

Trans.prototype.copy = function() {
    return this.omit();
};

Trans.prototype.remove = function() {
    var fields = toArray(arguments);
    if (fields.length > 0) {
        ocopy.removeFields(this._state_, fields);
    }
    return this;
};

Trans.prototype.omit = function() {
    this._state_ = ocopy.copyBlack(this._state_, toArray(arguments));
    return this;
};

Trans.prototype.pick = function() {
    var fields = toArray(arguments);
    if (fields.length > 0) {
        this._state_ = ocopy.copyWhite(this._state_, fields);
    }
    return this;
};

Trans.prototype.sort = function() {
    var args  = toArray(arguments)
      , self  = this
      , state = this._state_
      , trav  = this._trav_
      , field = opath.parse(args[0])
      , desc  = /desc|dsc/i.test(field.meta[0])
      , funs  = args.slice(1)
      , last  = funs[funs.length - 1]
      , comp  = null;

    if (!state) { return this; }

    ensure(isArray(state), 'The sort target is not an array');

    if (last && isFunction(last) && last.length === 2) {
        comp = osort.createComparer(last);
        funs.pop();
    }
    if (comp === null) {
        comp = osort.createComparer(null, desc);
    }

    state = trav.map(state, function (val, index) {
        var criteria = val, t = null;

        if (field.exists) {
            criteria = trav.walkValue(val, field.path, false);
        }
        if (funs.length > 0) {
            t = self._create_(criteria);
            criteria = t.map.apply(t, funs).value();
        }

        return {
            index    : index
          , value    : val
          , criteria : criteria
        };
    });

    state.sort(comp);

    this._state_ = state.map(function (n) { return n.value; });

    return this;
};

Trans.prototype.flatten = function(deep) {
    return this.map([flatten, !deep]);
};

Trans.prototype.default = function() {
    var args = toArray(arguments)
      , key  = null
      , val  = null
      , i    = 0
      , len  = args.length
      , set  = function (obj, val) {
            return isUndefined(obj) || obj === null ? val : obj;
        };

    ensure(len % 2 === 0, 'An even number of arguments was expected');

    for (i = 0; i < len - 1; i += 2) {
        key = args[i];
        val = args[i + 1];
        this.mapf(key, [set, val]);
    }

    return this;
};

Trans.prototype.array = function(keyName, valName) {
    var trav   = this._trav_
      , state  = this._state_
      , result = [];

    keyName = keyName || 'key';
    valName = valName || 'value';

    if (isUndefined(state) || state === null) {
        result = [];
    } else if (isArray(state)) {
        result = trav.walk(state, null, false, function (node) {
            var obj = node.parent;
            ensure(isObject(obj), 'Object expected but got', obj);
            return objToArray(obj, keyName, valName);
        });
    } else if (isObject(state)) {
        result = objToArray(state, keyName, valName);
    } else {
        fail('Object expected but got', state);
    }

    this._state_ = result;
    return this;
};

Trans.prototype.object = function() {
    var args     = toArray(arguments)
      , state    = this._state_
      , self     = this
      , trav     = this._trav_
      , keyField = opath.parse(args[0])
      , valField = opath.parse(args[1])
      , funs     = args.slice(2)
      , res      = {};

    var addPair = function (key, val) {
            var t = null;

            if (funs.length > 0) {
                t = self._create_(key);
                key = t.map.apply(t, funs).value();
            }

            key = isUndefined(key) ? null : key;
            res[key] = val;
        };

    if (!state) { return this; }

    ensure(isArray(state), 'The object target is not an array');

    trav.map(state, function (obj) {
        var key = obj
          , val  = obj;

        if (keyField.exists) {
            key = trav.walkValue(obj, keyField.path, false);
        }
        if (valField.exists) {
            val = trav.walkValue(obj, valField.path, false);
        }

        if (keyField.iter) {
            trav.map(key, function (k) { addPair(k, val); });
        } else {
            addPair(key, val);
        }
    });

    this._state_ = res;
    return this;
};

Trans.prototype.filter = function() {
    var args   = toArray(arguments)
      , self   = this
      , trav   = this._trav_
      , field  = opath.parse(args[0])
      , invert = field.meta[0] === 'invert'
      , funs   = args.slice(1);

    if (!this._state_) { return this; }

    ensure(isArray(this._state_), 'The filter target is not an array');

    this._state_ = trav.filter(this._state_, function (obj) {
        var val  = obj
          , bval = null
          , t    = null;

        if (field.exists) {
            val = trav.walkValue(val, field.path, false);
        }

        if (funs.length > 0) {
            t   = self._create_(val);
            val = t.map.apply(t, funs).value();
        }

        bval = Boolean(val);
        return invert ? !bval : bval;
    });

    return this;
};

Trans.prototype.group = function() {
    var args     = toArray(arguments)
      , self     = this
      , trav     = this._trav_
      , state    = this._state_
      , keyField = opath.parse(args[0])
      , valField = opath.parse(args[1])
      , keyName  = keyField.meta[0] || 'key'
      , valName  = keyField.meta[1] || 'value'
      , funs     = args.slice(2)
      , map      = {}
      , res      = [];

    var addPair = function (key, val, seen) {
            var t = null, obj = null;

            if (funs.length > 0) {
                t   = self._create_(key);
                key = t.map.apply(t, funs).value();
            }

            key = isUndefined(key) ? null : key;

            if (!seen[key]) {
                seen[key] = true;

                if (!map[key]) {
                    map[key]     = [];
                    obj          = {};
                    obj[keyName] = key;
                    obj[valName] = map[key];
                    res.push(obj);
                }

                map[key].push(val);
            }
        };

    if (!state) { return this; }

    ensure(isArray(state), 'The group target is not an array');

    trav.map(state, function (val) {
        var key  = val
          , seen = {};

        if (keyField.exists) {
            key = trav.walkValue(val, keyField.path, false);
        }
        if (valField.exists) {
            val = trav.walkValue(val, valField.path, false);
        }

        if (keyField.iter) {
            trav.map(key, function (k) { addPair(k, val, seen); });
        } else {
            addPair(key, val, seen);
        }
    });

    this._state_ = res;
    return this;
};

Trans.prototype.pluck = function() {
    var args  = toArray(arguments);
    args.splice(1, 0, null);
    return this.mapff.apply(this, args);
};

Trans.prototype.mapff = function() {
    var args    = toArray(arguments)
      , self    = this
      , funs    = args.slice(2)
      , srcPath = opath.parse(args[0])
      , dstPath = opath.parse(args[1])
      , paths   = opath.root(srcPath, dstPath)
      , trav    = self._trav_
      , result  = null
      , walk    = function (obj, fn) {
            return trav.walk(obj, paths.root.path, false, function (node) {
                if (paths.dst.exists) {
                    return trav.walk(node.getValueOrParent(), null, false, fn);
                } else {
                    return fn(node);
                }
            });
        };

    if (srcPath.iter) { funs.unshift(opath.ITER); }

    if (paths.root.nil && paths.src.nil && paths.dst.nil) {
        this.map.apply(this, funs);
    } else {
        result = walk(self._state_, function (node) {
            var srcField = opath.join(node.field, paths.src)
              , dstField = opath.join(node.field, paths.dst)
              , t        = null
              , val      = node.getValueOrParent();

            if (srcField.exists) {
                val = trav.walk(node.parent, srcField.path, false, function (srcNode) {
                    return srcNode.getValueOrParent();
                });
            }

            t   = self._create_(val);
            val = t.map.apply(t, funs).value();

            if (dstField.exists) {
                trav.walk(node.parent, dstField.path, true, function (dstNode) {
                    dstNode.setValue(val);
                });
            }

            return val;
        });

        if (dstPath.nil) {
            this._state_ = result;
        }
    }

    return this;
};

Trans.prototype.mapf = function() {
    var args  = toArray(arguments)
      , self  = this
      , field = opath.parse(args[0])
      , funs  = args.slice(1);

    if (field.iter) {
        funs.unshift(opath.ITER);
    }
    if (field.nil) {
        return this.map.apply(this, funs);
    }

    self._trav_.walk(self._state_, field.path, true, function (node) {
        var t = null, val = node.getValue();

        t = self._create_(val);
        t.map.apply(t, funs);
        node.setValue(t.value());
    });

    return this;
};

Trans.prototype.map = function() {
    this._state_ = this._trav_.transform(this._state_, toArray(arguments));
    return this;
};

[
    'group'
  , 'flatten'
  , 'filter'
  , 'sort'
  , 'pick'
  , 'omit'
  , 'uniq'
  , 'take'
  , 'skip'
  , 'first'
  , 'last'
  , 'copy'
  , 'pluck'
  , 'object'
  , 'array'
  , 'default' ].forEach(function (name) {
    Trans.prototype[name + 'f'] = function () {
        var args  = toArray(arguments)
          , self  = this
          , field = args[0]
          , rest  = args.slice(1);

        return this.mapf(field, function (target) {
            var t = self._create_(target);
            return t[name].apply(t, rest).value();
        });
    };

    Trans.prototype[name + 'ff'] = function () {
        var args = toArray(arguments)
          , self = this
          , src  = args[0]
          , dst  = args[1]
          , rest = args.slice(2);

        return this.mapff(src, dst, function (target) {
            var t = self._create_(target);
            return t[name].apply(t, rest).value();
        });
    };
});
