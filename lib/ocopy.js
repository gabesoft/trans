var util        = require('./util')
  , opath       = require('./opath')
  , ensure      = util.ensure
  , fail        = util.fail
  , isArray     = util.isArray
  , isFunction  = util.isFunction
  , isDate      = util.isDate
  , isUndefined = util.isUndefined
  , isObject    = util.isObject
  , isString    = util.isString
  , toArray     = util.toArray;

function fieldTree (fields) {
    var root = {};

    fields.forEach(function (field) {
        var r = root
          , p = opath.parse(field);
        p.path.forEach(function (part) {
            if (!r[part]) {
                r[part] = { _end_: true };
            }
            if (r._end_) {
                r._end_ = false;
            }
            r = r[part];
        });
    });

    return root;
}

function removeFields (obj, removelist) {
    var keys = Object.keys(removelist)
      , i    = 0
      , key  = null
      , len  = keys.length;

    for (i = 0; i < len; i++) {
        key = keys[i];

        if (!(key in obj)) {
            continue;
        }

        if (removelist[key]._end_) {
            delete obj[key];
        } else if (removelist[key]) {
            copyObject(removeFields, obj[key], removelist[key]);
        }
    }
}

function copyBlack (obj, blacklist, parents) {
    blacklist = blacklist || {};

    var clone  = {}
      , keys   = Object.keys(obj)
      , i      = 0
      , key    = null
      , end    = null
      , len    = keys.length;

    parents.push(obj);
    for (i = 0; i < len; i++) {
        key = keys[i];
        end = blacklist[key] && blacklist[key]._end_;

        if (end || parents.indexOf(obj[key]) !== -1) {
            continue;
        }

        clone[key] = copyObject(copyBlack, obj[key], blacklist[key], parents);
    }
    parents.pop(obj);

    return clone;
}

function copyWhite (obj, whitelist) {
    var keys  = Object.keys(whitelist)
      , clone = {}
      , i     = 0
      , key   = null
      , len   = keys.length;

    for (i = 0; i < len; i++) {
        key = keys[i];

        if(!(key in obj)) {
            continue;
        }

        clone[key] = copyObject(copyWhite, obj[key], whitelist[key]);
    }

    return clone;
}

function copyObject (copyFn, obj, fields, parents) {
    if (isArray(obj)) {
        return obj.map(function (o) { return copyObject(copyFn, o, fields, parents); });
    } else if (isDate(obj)) {
        return new Date(obj.getTime());
    } else if (isObject(obj)) {
        return copyFn(obj, fields, parents);
    } else {
        return obj;
    }
}

exports.copyWhite = function (obj, fields) {
    return copyObject(copyWhite, obj, fieldTree(fields));
};

exports.copyBlack = function (obj, fields) {
    return copyObject(copyBlack, obj, fieldTree(fields), []);
};

exports.removeFields = function (obj, fields) {
    return copyObject(removeFields, obj, fieldTree(fields));
};
