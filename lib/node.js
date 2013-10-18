var util        = require('./util')
  , ensure      = util.ensure
  , fail        = util.fail
  , isUndefined = util.isUndefined
  , isObject    = util.isObject
  , isString    = util.isString;

function addField (obj, field, value) {
    ensure(field, 'No field specified', obj);
    ensure(isObject(obj), 'Could not create field ' + field + ' on', obj);
    obj[field] = value;
}

function Node (parent, field) {
    this.parent = parent;
    this.field  = field;
}

exports.Node = Node;

Node.prototype.getValue = function() {
    var val = this.parent[this.field];
    return isUndefined(val) ? null : val;
};

Node.prototype.setValue = function (value) {
    addField(this.parent, this.field, value);
};

Node.prototype.getValueOrParent = function() {
    return this.field ? this.parent[this.field] : this.parent;
};
