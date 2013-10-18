
function Context (data) {
    data         = data || {};
    this.indexes = data.indexes || [];
    this.index   = data.index || 0;
}

exports.Context = Context;

Context.prototype.pushIndex = function() {
    this.indexes.unshift(this.index);
};

Context.prototype.popIndex = function() {
    this.index = this.indexes.shift();
};

Context.prototype.setIndex = function(index) {
    this.index = index;
};

Context.prototype.getIndex = function() {
    return this.index;
};

Context.prototype.getIndexes = function() {
    return [this.index].concat(this.indexes.slice(0, this.indexes.length - 1));
};
