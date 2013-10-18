var util = require('../util')
  , path = require('path');

describe('trans performance', function () {
    [ 'perf-test' ].forEach(function (name) {
        require(path.join(process.cwd(), 'test', 'perf', name))(util);
    });
});
