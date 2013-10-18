```
  __                               
_/  |_____________    ____   ______
\   __\_  __ \__  \  /    \ /  ___/
 |  |  |  | \// __ \|   |  \\___ \ 
 |__|  |__|  (____  /___|  /____  >
                  \/     \/     \/ 
```

*The ultimate object transformer*

### Overview

### Motivation

### Quickstart

Here's a quick taste. Assuming we have an object that looks like this  

``` javascript
var data = [ 
      { a: { b: 'abc' }, { c: 1 } }
    , { a: { b: 'ade' }, { c: 2 } }
    , { a: { b: 'def' }, { c: 3 } }
    , { a: { b: 'ghk' }, { c: 4 } }
    ];
```

We can use trans to group by the first letter capitalized of the a.b field  
and set the group value to a.c as follows  

``` javascript

var trans = require('trans');
var value = trans(data)
    .group('a.b', 'c', ['charAt', 0], 'toUpperCase')
    .value();

```

Now value looks like this  

``` javascript
  [ { key; 'A', value: [ 1, 2 ] }, { key: 'D', value: [ 3 ] }, { key: 'G', value: [ 4 ] } ];
```

### Metods
