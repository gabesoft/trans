var slice       = Array.prototype.slice
  , util        = require('util')
  , isArray     = util.isArray
  , isFunction  = function (x) { return typeof x === 'function'; }
  , isUndefined = function (x) { return x === void 0; }
  , isObject    = function (x) { return Object(x) === x && !isArray(x) && !isFunction(x); }
  , isString    = function (x) { return typeof x === 'string'; }
  , toArray     = function (x) { return slice.call(x); };

function ensure (cond, msg, obj) {
    if (!cond) {
        fail(msg, obj);
    }
}

function fail (msg, obj) {
    if (!isUndefined(obj)) {
        if (obj === null) {
            msg += ' null';
        } else if (isFunction(obj)) {
            msg += ' ' + obj;
        } else {
            try {
                msg += ' ';
                msg += JSON.stringify(obj);
            } catch (e) {
                msg += ' ';
                msg += obj;
            }
        }
    }
    throw new Error(msg);
}

exports.ensure      = ensure;
exports.fail        = fail;
exports.isArray     = util.isArray;
exports.isFunction  = isFunction;
exports.isUndefined = isUndefined;
exports.isObject    = isObject;
exports.isString    = isString;
exports.toArray     = toArray;
exports.default     = function (obj, val) { return isUndefined(obj) ? val : obj; };
exports.trueFn      = function () { return true; };
exports.idFn        = function (o) { return o; };

exports.inspect     = function (obj) {
    var eyes = require('eyes');
    eyes.defaults.maxLength = 8192;
    eyes.inspect(obj);
};
