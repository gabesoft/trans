var END_DOT = /\.$/
  , DOT     = '.'
  , COL     = ':'
  , util    = require('./util')
  , isArray = util.isArray;

function Path (name, iter) {
    var parts = null;

    this.full = '';
    this.path = [];
    this.iter = iter;
    this.meta = [];

    if (isArray(name)) {
        this.full = name.join(DOT);
        this.path = name;
    } else if (name) {
        parts     = name.split(COL);
        this.full = parts[0].replace(END_DOT, '');
        this.path = this.full.split(DOT).filter(Boolean);
        this.iter = END_DOT.test(parts[0]);
        this.meta = parts.slice(1);
    }

    this.nil     = this.path.length === 0;
    this.exists  = !this.nil;
    this._isPath = true;
}

exports.ITER = DOT;

function parse (name) {
    return (name || {})._isPath ? name : new Path(name);
}

exports.parse = parse;

exports.join = function (p1, p2) {
    p1 = parse(p1);
    p2 = parse(p2);
    return new Path(p1.path.concat(p2.path), p2.iter);
};

exports.root = function (src, dst) {
    src = parse(src);
    dst = parse(dst);

    var len = Math.min(src.path.length, dst.path.length)
      , i   = 0
      , r   = [];

    for (i = 0; i < len; i++) {
        if (src.path[i] === dst.path[i]) {
            r.push(src.path[i]);
        } else {
            break;
        }
    }

    return {
        root : new Path(r)
      , src  : new Path(src.path.slice(i))
      , dst  : new Path(dst.path.slice(i))
    };
};
