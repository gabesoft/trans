var util        = require('./util')
  , ensure      = util.ensure
  , fail        = util.fail
  , isArray     = util.isArray
  , isFunction  = util.isFunction
  , isUndefined = util.isUndefined
  , isObject    = util.isObject
  , isString    = util.isString
  , toArray     = util.toArray;

function Invoker (context) {
    this.context = context;
}

exports.Invoker = Invoker;

Invoker.prototype.run = function() {
    var args    = toArray(arguments)
      , context = this.context
      , target  = args[0]
      , fn      = args[1]
      , rest    = args.slice(2);

    if (isFunction(fn)) {
        return fn.apply(context, [target].concat(rest));
    }
    if (isArray(fn)) {
        return this.run.apply(this, [target].concat(fn));
    }
    if (isObject(fn)) {
        return fn[target];
    }
    if (!isString(fn)) {
        fail('String expected but got', fn || null);
    }

    fn = target[fn];

    return isFunction(fn) ? fn.apply(target, rest) : fn;
};
