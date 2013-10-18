exports.trans     = require('../lib');
exports.eyes      = require('eyes');
exports.assert    = require('assert');
exports.truncate  = function (x, len) { return x.substring(0, len || 3); };
exports.inspect   = function (obj) { exports.eyes.inspect(obj); };
exports.sum       = function (xs) { return xs.reduce(function (acc, x) { return x + acc; }, 0); };
exports.mod       = function (x, y) { return x % y; };
exports.add       = function (x, y) { return x + y; };
exports.gt        = function (x, y) { return x > y; };
exports.lt        = function (x, y) { return x < y; };
exports.square    = function (x) { return x * x; };
exports.stringify = function (obj) {
    return JSON.stringify(obj, function (key, val) {
        return (typeof val === 'function') ? val + '' : val;
    });
};

exports.eyes.defaults.maxLength = 8192;
