var util = require('../util')
  , path = require('path');

describe('trans', function () {
    [
        'basic-test'
      , 'map-test'
      , 'group-test'
      , 'flatten-test'
      , 'sort-test'
      , 'pick-test'
      , 'omit-test'
      , 'remove-test'
      , 'list-test'
      , 'object-test'
      , 'array-test'
      , 'default-test'
      , 'filter-test'
    ].forEach(function (name) {
        require(path.join(process.cwd(), 'test', 'trans', name))(util);
    });
});
