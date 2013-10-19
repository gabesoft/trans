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
- ``mapf(field, *transformers)``  transforms the value at a particular field
- ``mapff(source, destination, *transformers)`` takes the value of one field, transforms it, and sets it on another field

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
      { a: { b: 'abc' }, { c: 1 } }
    , { a: { b: 'ade' }, { c: 2 } }
    , { a: { b: 'def' }, { c: 3 } }
    , { a: { b: 'ghk' }, { c: 4 } } ];
```

We can use trans to group the data array by the first letter capitalized of the a.b field  
and set the group value to a.c as follows  

``` javascript

var trans = require('trans');
var value = trans(data)
    .group('a.b', 'a.c', ['charAt', 0], 'toUpperCase')
    .value();

```

Now value looks like this  

``` javascript
  [ { key; 'A', value: [ 1, 2 ] }, { key: 'D', value: [ 3 ] }, { key: 'G', value: [ 4 ] } ];
```

## Methods

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

If the current object is an array and we want to iterate it and apply 
transformers to each item in the array a ``'.'`` transformer needs to be specified first. 

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
will indicate that we want to iterate the array.

``` javascript
trans({ a: { b: [ 1, 2 ] } }).mapf('a.b', 'length').value();
```
=> ``{ a: { b: 2 } }``  

``` javascript
trans({ a: { b: [ 1, 2 ] } }).mapf('a.b.', [ add, 1 ]).value();
```
=> ``{ a: { b: [ 2, 3 ] } }``  

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

If the source field points to an array we can indicate that we want to iterate the array by appending
one last dot.

``` javascript
trans({ a: { b: [ 1, 2, 3 ] } }).mapff('a.b', 'a.c', 'length').value();
```
=> ``{ a: { b: [ 1, 2, 3 ], c: 3 } }``

``` javascript
trans({ a: { b: [ 1, 2, 3 ] } }).mapff('a.b.', 'a.c', [ add, 5 ]).value();
```
=> ``{ a: { b: [ 1, 2, 3 ], c: [ 6, 7, 8 ] } }``

If the destination is null the entire object is replaced. This could be useful for picking up values although
there is a ``pluck`` method for this purpose.

``` javascript
trans([ { a: [ { b: 1 }, { b: 2 } ] }, { a: [ { b: 3 } ] } ])
  .mapff('a.b', null)
  .value();
```
=> ``[ [ 1, 2 ], [ 3 ] ]``

See the [unit tests](https://github.com/gabesoft/trans/blob/master/test/trans/map-test.js) for more comprehensive examples.

### group(groupField, valueField, *transformers)

### groupf(field, groupField, valueField, *transformers)

### groupff(source, destination, groupField, valueField, *transformers)

### sort(sortField, *transformers)

### sortf(field, sortField, *transformers)

### sortff(source, destination, sortField, *transformers)
