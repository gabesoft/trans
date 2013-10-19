```
  __                               
_/  |_____________    ____   ______
\   __\_  __ \__  \  /    \ /  ___/
 |  |  |  | \// __ \|   |  \\___ \ 
 |__|  |__|  (____  /___|  /____  >
                  \/     \/     \/ 
```

*The ultimate object transformer*

## Overview

####The purpose of trans is to make it super easy to transform complex json objects
  
Trans allows specifying composite field names such as ``a.b.c`` and it does the 
right thing even across multiple arrays.  
For example, the field above could be used to modify or extract a value from an object 
that looks like this

``` javascript 
{ a: { b: { c: 1 } } }
```
but also if the object looks like this 
``` javascript
{ a: [ { b: { c: 1 } }, { b: { c: 2 } } ] }
```
or like this
``` javascript
[ { a: { b: [ { c: 1 }, { c: 2 } ] } } ]
```

There are three types of transformation methods:  
- ``map(*transformers)`` transforms the entire object
- ``mapf(field, *transformers)``  transforms the value of a field
- ``mapff(source, destination, *transformers)`` transforms the value of a field and
sets it onto another field

The transformers specified as parameters to the transformation methods can be functions, 
field names, or even objects (which will be used as hash maps). The functions that are not properties
on the object being transformed are assumed to take that object as the first parameter. But, they can 
take additional parameters as well. In those case the function should be specified as an array. 
When multiple transformers are specified the result of each one is piped over to the next one.
  
Here are a couple of examples which result in an identical outcome:
``` javascript
trans({ a: [ 1, 2 ] }).mapf('a', 'length', [add, 5], [mul, 10], square);
```
``` javascript
trans({ a: [ 1, 2 ] }).mapf('a', function(obj) {
    return square(mul(add(obj.length, 5), 10));
});
```
The result in both cases is:
``` javascript
{ a: 4900 }
```

## Quickstart

Using trans is easy, first wrap the data to be transformed by calling ``trans(data)``,  
as below, and then call transformation methods on the wrapper. Multiple transformation  
methods can be chained. When done call ``value()`` to get back the raw data that has been transformed.

Here's a quick taste. Assuming we have an object that looks like this  

``` javascript
var data = [ 
      { a: { b: 'fbc' }, c: 1 }
    , { a: { b: 'foo' }, c: 3 }
    , { a: { b: 'fde' }, c: 2 }
    , { a: { b: 'def' }, c: 3 }
    , { a: { b: 'ghk' }, c: 4 } ];
```

We can use trans to group the data array by the first letter capitalized of the ``a.b`` field  
and set the group value to ``c``, then sort the value array, and finally sort the 
entire result array by the group key as follows  

``` javascript
var trans = require('trans');
var result = trans(data)
    .group('a.b', 'c', ['charAt', 0], 'toUpperCase')
    .sortf('value')
    .sort('key')
    .value();

```

After running the above code ``result`` will have the following value 

``` javascript
[ { key: 'D', value: [ 3 ] }, { key: 'F', value: [ 1, 2, 3 ] }, { key: 'G', value: [ 4 ] } ]
```

## Methods

* [map(*transformers)](#mapfn)
* [mapf(field, *transformers)](#mapffn)
* [mapff(source, destination, *transfORmers)](#mapfffn)
* [group(groupField, valueField, *key-transformers)](#groupfn)

  

``` javascript
var trans = require('trans');
```

### trans(data)
This function creates a transformation wrapper around the specified data. 
Further transformation methods can be chained on the trans wrapper.

### value()
This should be called to get back the raw data object.

### get(callback)
This method makes the current raw data available for inspection. It can be used 
to insert console log statements in the transformation chain for debugging purposes. 

``` javascript
var value = trans(data)
    .group('a.b')
    .get(console.log)
    .sort('key')
    .value();
```
<a name="mapfn"/>
### map(*transformers) 

This is the main transformation method. It passes the entire raw object to the transformers 
and it replaces it with the result returned by the last transformer function.
  
Here is a simple example:

``` javascript
trans('2.32').map(parseFloat, square, [ add, 10 ]).value();
``` 
=> ``15.3824``  

Field names, and functions that exist on the object being transformed
can be specified as transformers

``` javascript
trans('transform me').map('toUpperCase', [ 'substring', 0, 5 ]).value();
```
=> ``'TRANS'``  

``` javascript
trans({ a: 1 }).map('a').value();
```
=> ``1``  

``` javascript
trans({ a: 'foo' }).map('a', 'toUpperCase', [ 'charAt', 1 ]).value();
```
=> ``'O'``  

If the current object is an array the whole array is passed to the transformer functions.
To transform its elements instead precede the transformers with a dot ``'.'`` which will
indicate that array iteration is desired.

Here are a few array examples:

``` javascript
trans([ 1, 2, 3 ]).map('length').value();
```
=> ``3``  

``` javascript
trans([ 1, 2, 3 ]).map('.', square).value();
```
=> ``[ 1, 4, 9 ]``  

``` javascript
trans([ [ 1, 2 ], [ 3 ], [ 4, 5, 6 ] ]).map('.', sum).value();
```
=> ``[ 3, 3, 15 ]``  

``` javascript
trans([ [ 1, 2 ], [ 3 ], [ 4, 5, 6 ] ]).map('.', '.', [ add, 5 ]).value();
```
=> ``[ [ 6, 7 ], [ 8 ], [ 9, 10, 11 ] ]``  

``` javascript
trans([ { a: [ 1, 2 ] }, { a: [ 3 ] }, { a: [ 4, 5, 6 ] } ])
    .map('.', 'a', 'length')
    .value();
```
=> ``[ 2, 1, 3 ]``  

``` javascript
trans([ { a: [ 1, 2 ] }, { a: [ 3 ] }, { a: [ 4, 5, 6 ] } ])
    .map('.', 'a', '.', square)
    .value();
```
=> ``[ [ 1, 4 ], [ 9 ], [ 16, 25, 36 ] ]``  

Objects can be specified as transformers as well. When that is the case the result of 
the previous transformation will be used as an index into the transformer object.

``` javascript
var intToName = { 1: 'one', 2: 'two', 3: 'three' };

trans([ 1, 2 ]).map('length', intToName).value();
```
=> ``'two'``

<a id="mapffn"/>
### mapf(field, *transformers)

This is exactly like ``map`` but it is applied at a specified field. In fact if a null
field is specified the result is identical to calling ``map``. Otherwise, the input
to the first transformer function will be the value at the specified field and the result
of the last transformer will replace the value at that field.

``` javascript
trans(1).mapf(null, [ add, 1 ]).value();
```
=> ``2``  

``` javascript
trans({ a: 1 }).mapf('a', [ add, 1 ]).value();
```
=> ``{ a: 2 }``  
  
Field names can contain dots to reach within nested objects. 

``` javascript
trans({ a: { b: 1 } }).mapf('a.b', [ add, 1 ]).value();
```
=> ``{ a: { b: 2 } }``  

Such field names work across arrays as well.

``` javascript
trans({ a: [ { b: 1 }, { b: 2 } ] }).mapf('a.b', [ add, 1 ]).value();
```
=> ``{ a: [ { b: 2 }, { b: 3 } ] }``  

If the value at the field is an array adding one last dot at the end of the field name 
will indicate that we want to transform the elements of the array as opposed to the array
as a whole.

``` javascript
trans({ a: { b: [ 1, 2 ] } }).mapf('a.b', 'length').value();
```
=> ``{ a: { b: 2 } }``  

``` javascript
trans({ a: { b: [ 1, 2 ] } }).mapf('a.b.', [ add, 1 ]).value();
```
=> ``{ a: { b: [ 2, 3 ] } }``  

<a id="mapfffn"/>
### mapff(source, destination, *transformers)

This transformation maps the value of a field and sets the result onto another field. 
If the destination is null, the entire object is replaced. If the source and destination are both null it has the exact
same outcome as ``map``. If the destination field does not exist it is created, otherwise its
value is replaced by the result of the transformation. The source field is left unchanged.

``` javascript
trans({ a: 1 }).mapff('a', 'b').value();
```
=> ``{ a: 1, b: 1 }``

``` javascript
trans({ a: 1 }).mapff('a', 'b', [ add, 1 ], square).value();
```
=> ``{ a: 1, b: 4 }``  

Composite fields are allowed but the value passed to transformers is scoped based on where 
the source and destination fields point to. This becomes relevant when we are transforming across 
arrays.

Below the function ``sum`` gets an array containing the values of ``a.b``, in this case ``[ 1, 2 ]`` 
and it computes their sum.

``` javascript
trans({ a: [ { b: 1 }, { b: 2 } ] }).mapff('a.b', 'c', sum).value();
```
=> ``{ a: [ { b: 1 }, { b: 2 } ], c: 3 }``

In the next example the scope is reduced to each object inside the array, so the transformers
only get the value of the ``b`` field.

``` javascript
trans({ a: [ { b: 1 }, { b: 2 } ] }).mapff('a.b', 'a.c', [ add, 1 ]).value();
```
=> ``{ a: [ { b: 1, c: 2 }, { b: 2, c: 3 } ] }``

If the source field points to an array we can indicate that we want to transform the elements of
the array by appending one last dot to it. Or alternatively a dot ``'.'`` could be specified as
the first transformer.

``` javascript
trans({ a: { b: [ 1, 2, 3 ] } }).mapff('a.b', 'a.c', 'length').value();
```
=> ``{ a: { b: [ 1, 2, 3 ], c: 3 } }``

``` javascript
trans({ a: { b: [ 1, 2, 3 ] } }).mapff('a.b.', 'a.c', [ add, 5 ]).value();
```
=> ``{ a: { b: [ 1, 2, 3 ], c: [ 6, 7, 8 ] } }``

``` javascript
trans({ a: { b: [ 1, 2, 3 ] } }).mapff('a.b', 'a.c', '.', [ add, 5 ]).value();
```
=> ``{ a: { b: [ 1, 2, 3 ], c: [ 6, 7, 8 ] } }``

If the destination is null the entire object is replaced. This could be useful for picking up values,
although, there is a ``pluck`` method for this purpose.

``` javascript
trans([ { a: [ { b: 1 }, { b: 2 } ] }, { a: [ { b: 3 } ] } ])
  .mapff('a.b', null)
  .value();
```
=> ``[ [ 1, 2 ], [ 3 ] ]``

See the [unit tests](https://github.com/gabesoft/trans/blob/master/test/trans/map-test.js) 
for additional examples.

<a id="groupfn"/>
### group(groupField, valueField, *key-transformers)

Maps an array of objects into an array of key-value pairs where the key is the value
of the specified group field (possibly transformed) and the value is an array of values as 
indicated by the value field. If the value field is null the entire array item is used.

``` javascript
trans([ 'ray', 'rich', 'charles' ]).group(null, null, [ 'charAt', 0 ]).value();
```
=> ``[ { key: 'r', value: [ 'ray', 'rich' ] }, { key: 'c', value: [ 'charles' ] } ]``  

``` javascript
trans([ { a: 'ray', b: 1 }, { a: 'rich', b: 2 }, { a: 'charles', b: 3 } ])
    .group('a', 'b', [ 'charAt', 0 ], 'toUpperCase')
    .value();
```
=> ``[ { key: 'R', value: [ 1, 2 ] }, { key: 'C', value: [ 3 ] } ]``  

The default key and value names in the output array can be overriden with different names
specified as part of the group field. This syntax of the group field is 
``field:keyName:valueName``.

``` javascript
trans([ 1, 1, 2, 1 ]).group(':k:v', null).value();
```
=> ``[ { k: 1, v: [ 1, 1, 1 ] }, { k: 2, v: [ 2 ] } ]``

``` javascript
trans([ { a: 1, b: 'x' }, { a: 1, b: 'y' }, { a: 2, b: 'z' } ])
    .group('a:number:letters', 'b')
    .value();
```
=> ``[ { number: 1, letters: [ 'x', 'y' ] }, { number: 2, letters: [ 'z' ] } ]``

The group field name can contain dots to reach within nested objects or arrays.

``` javascript
trans([ { a: [ { b: 1 }, { b: 2 } ], c: 'three' }, { a: [ { b: 10 } ], c: 'ten' } ])
    .group('a.b', 'c')
    .value();
```
=> ``[ { key: [ 1, 2 ], value: [ 'three' ] }, { key: [ 10 ], value: [ 'ten' ] } ]``

``` javascript
trans([ { a: [ { b: 1 }, { b: 2 } ], c: 'three' }, { a: [ { b: 10 } ], c: 'ten' } ])
    .group('a.b', 'c', sum)
    .value();
```
=> ``[ { key: 3, value: [ 'three' ] }, { key: 10, value: [ 'ten' ] } ]``

``` javascript
trans([ { a: { b: 1, c: 'one' } }, { a: { b: 11, c: 'eleven' } }, { a: { b: 2, c: 'two' } } ])
    .group('a.b', 'a.c', [ mod, 10 ])
    .value();
```
=> ``[ { key: 1, value: [ 'one', 'eleven' ] }, { key: 2, value: [ 'two' ] } ]``

#### Other versions
- ``groupf(field, groupField, valueField, *key-transformers)``
- ``groupff(source, destination, groupField, valueField, *key-transformers)``

### sort(sortField, *transformers, [comparer])

Replaces the target array with a stable sorted copy based on the value at the sort field 
(possibly transformed). If the last function takes exactly two arguments it will be used 
as a comparer, otherwise a default comparer will be used.

``` javascript
trans([ 1, 2, 1, 1, 3 ]).sort(null).value();
```
=> ``[ 1, 1, 1, 2, 3 ]``

``` javascript
trans([ 'Ash', 'bar', 'Baz', 'baz', 'bak', 'Foo', 'ash' ]).sort(null, 'toUpperCase').value();
```
=> ``[ 'Ash', 'ash', 'bak', 'bar', 'Baz', 'baz', 'Foo' ]``

``` javascript
var intToName = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five' };

trans([ 1, 2, 3, 4, 5 ]).sort(null, intToName).value();
```
=> ``[ 5, 4, 1, 3, 2 ]``

``` javascript
trans([ { a: 1 }, { a: 3 }, { a: 2 } ]).sort('a').value();
```
=> ``[ { a: 1 }, { a: 2 }, { a: 3 } ]``

``` javascript
trans([ 
        { a: 1,  b: { c: 'one' } }
      , { a: 3,  b: { c: 'three' } }
      , { a: 10, b: { c: 'ten' } }
      , { a: 2,  b: { c: 'two' } } ])
    .sort('b.c')
    .value();
```
=> 
``` javascript
    [ { a: 1,  b: { c: 'one' } },
      { a: 10, b: { c: 'ten' } },
      { a: 3,  b: { c: 'three' } },
      { a: 2,  b: { c: 'two' } } ]
```

The sort direction can be specified on the sort field. 
The sort field syntax is ``name:direction``

``` javascript
trans([ 1, 1, 3, 2 ]).sort(':descending').value();
```
=> ``[ 3, 2, 1, 1 ]``

``` javascript
trans([ { a: { b: 1 } }, { a: { b: 1 } }, { a: { b: 3 } }, { a: { b: 2 } } ])
    .sort('a.b:descending')
    .value();
```
=> ``[ { a: { b: 3 } }, { a: { b: 2 } }, { a: { b: 1 } }, { a: { b: 1 } } ]``

See the [unit tests](https://github.com/gabesoft/trans/blob/master/test/trans/sort-test.js) 
for additional examples.

#### Other versions
- ``sortf(field, sortField, *transformers, [comparer])``
- ``sortff(source, destination, sortField, *transformers, [comparer])``

### object(keyField, valueField, *key-transformers)

Transforms an array into an object where the key is the value at the specified key field 
(possibly transformed) and the value is as indicated by the value field. If the value
field is null, the entire array item is used as the value. If multiple values map to the 
same key, the last one wins.

``` javascript
trans(['abc', 'def', 'ghk']).object(null, null, [ 'charAt', 0 ]).value();
```
=> ``{ a: 'abc', d: 'def', g: 'ghk' }``

``` javascript
trans([ { a: 'abc', b: 1 }, { a: 'def', b: 2 }, { a: 'ghk', b: 3 } ])
    .object('a', 'b', [ 'charAt', 1 ], 'toUpperCase')
    .value();
```
=> ``{ B: 1, E: 2, H: 3 }``

``` javascript
trans([ { a: 'abc', b: 1 }, { a: 'def', b: 2 }, { a: 'ghk', b: 3 } ])
    .object('a', null, [ 'charAt', 1 ], 'toUpperCase')
    .value();
```
=> ``{ B: { a: 'abc', b: 1 }, E: { a: 'def', b: 2 }, H: { a: 'ghk', b: 3 } }``

See the [unit tests](https://github.com/gabesoft/trans/blob/master/test/trans/object-test.js) 
for additional examples.

#### Other versions
- ``objectf(field, keyField, valueField, *key-transformers)``
- ``objectff(source, destination, keyField, valueField, *key-transformers)``

### array(keyName, valueName)

Transforms an object into an array where each item is a key-value pair containing each key
and its value. The key and value names can be specified, otherwise they will default 
to ``key`` and ``value``.

``` javascript
trans({ a: 1, b: 2, c: 3 }).array().value();
```
=> ``[ { key: 'a', value: 1 }, { key: 'b', value: 2 }, { key: 'c', value: 3 } ]``

``` javascript
trans({ a: 1, b: 2, c: 3 }).array('letter', 'number').value();
```
=> ``[ { letter: 'a', number: 1 }, { letter: 'b', number: 2 }, { letter: 'c', number: 3 } ]``

If the target object is an array, ``array`` will be applied to every item in the array.

``` javascript
trans([ { a: 1, b: 2 }, { a: 3, b: 4, c: 5 }, { d: 6 } ]).array('k', 'v').value();
```
=>
``` javascript
[ [ { k: 'a', v: 1 }, { k: 'b', v: 2 } ],
  [ { k: 'a', v: 3 }, { k: 'b', v: 4 }, { k: 'c', v: 5 } ],
  [ { k: 'd', v: 6 } ] ]
```

#### Other versions
- ``arrayf(field, keyName, valueName)``
- ``arrayff(source, destination, keyName, valueName)``


## Gotchas and Limitations

Some transformations will modify the original data while others won't. See the two
examples below.

``` javascript
var a = [ 1, 2, 3 ];
var t = trans(a).map('shift').value();

console.log(a);
console.log(t);
```
=> ``[ 2, 3 ]``  
=> ``1``

``` javascript
var a = [ 1, 2, 3 ];
var t = trans(a).map(['slice', 0, 1], 'shift').value();

console.log(a);
console.log(t);
```
=> ``[ 1, 2, 3 ]``  
=> ``1``

Calling ``mapff`` without any transformer functions will just create another reference
to the same object. This may lead to unexpected results.  

``` javascript
var obj = { a: { b: 2, c: 'X' } };
var res = trans(obj).mapff('a', 'c').value();

console.log(res);

res.a.c = 'changed';
console.log(res);
```

=> ``{ a: { b: 2, c: 'X' }, c: { b: 2, c: 'X' } }``  
=> ``{ a: { b: 2, c: 'changed' }, c: { b: 2, c: 'changed' } }``

## Install

```
$ npm install trans
```

## License

MIT
