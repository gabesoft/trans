var util        = require('./util')
  , opath       = require('./opath')
  , Invoker     = require('./invoker').Invoker
  , Node        = require('./node').Node
  , ensure      = util.ensure
  , fail        = util.fail
  , isArray     = util.isArray
  , isFunction  = util.isFunction
  , isUndefined = util.isUndefined
  , isObject    = util.isObject
  , isString    = util.isString
  , toArray     = util.toArray
  , trueFn      = util.trueFn
  , idFn        = util.idFn;

function addField (obj, field, value) {
    ensure(field, 'No field specified', obj);
    ensure(isObject(obj), 'Could not create field ' + field + ' on', obj);
    obj[field] = value;
}

function Trav (context) {
    this.context = context;
    this.invoker = new Invoker(context);
}

exports.Trav = Trav;

Trav.prototype.loop = function(obj, fnAdd, fnMap) {
    var context = this.context
      , objects = Object(obj)
      , self    = this
      , result  = []
      , i       = 0
      , len     = obj.length >>> 0;

    ensure(isArray(obj), 'Array expected but got', obj || null);

    context.pushIndex();
    for (i = 0; i < len; i++) {
        if (i in objects) {
            context.setIndex(i);

            if (fnAdd(objects[i], i)) {
                result.push(fnMap(objects[i], i));
            }
        }
    }
    context.popIndex();

    return result;
};

Trav.prototype.map = function(obj, fn) {
    return this.loop(obj, trueFn, fn);
};

Trav.prototype.filter = function(obj, fn) {
    return this.loop(obj, fn, idFn);
};

Trav.prototype.walkValue = function(obj, fields, create) {
    return this.walk(obj, fields, create, function (node) {
        return node.getValue();
    });
};

Trav.prototype.walk = function(obj, fields, create, fn) {
    if (!obj) { return null; }

    var self = this;

    if (isArray(obj)) {
        return self.map(obj, function (o) { return self.walk(o, fields, create, fn); });
    }
    if (!fields || fields.length === 0) {
        return fn(new Node(obj, null));
    }
    if (fields.length === 1) {
        return fn(new Node(obj, fields[0]));
    }

    if (create && !obj.hasOwnProperty(fields[0])) {
        addField(obj, fields[0], {});
    }

    if (obj.hasOwnProperty(fields[0])) {
        return self.walk(obj[fields[0]], fields.slice(1), create, fn);
    }

    return null;
};

Trav.prototype.transform = function(obj, funs) {
    if (!funs || funs.length === 0) { return obj; }

    var next    = funs[0]
      , rest    = funs.slice(1)
      , self    = this
      , invoker = this.invoker
      , result  = null;

    if (next === opath.ITER) {
        result = self.map(obj, function (o) {
            return self.transform(o, rest);
        });
    } else {
        obj    = invoker.run(obj, next);
        result = self.transform(obj, rest);
    }

    return result;
};
