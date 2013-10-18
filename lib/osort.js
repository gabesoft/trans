
exports.createComparer = function(fn, descending) {
    if (fn) {
        return function (x, y) {
            var val = fn(x.criteria, y.criteria);
            return val === 0 ? x.index - y.index : val;
        };
    } else if (descending) {
        return function (x, y) {
            var cx = x.criteria
              , cy = y.criteria;

            if (cx !== cy) {
                if (cx > cy || cx === void 0) { return -1; }
                if (cx < cy || cy === void 0) { return  1; }
            }

            return x.index - y.index;
        };
    } else {
        return function (x, y) {
            var cx = x.criteria
              , cy = y.criteria;

            if (cx !== cy) {
                if (cx > cy || cx === void 0) { return  1; }
                if (cx < cy || cy === void 0) { return -1; }
            }

            return x.index - y.index;
        };
    }
};
