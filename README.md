meteor-bmodel
=============

A simple model for meteor that does the job.

`mrt add bmodel`

Extend BModel

```js

TestProduct = BModel.extend({
	_collection: new Meteor.Collection("test_products"),

	defaults: {
		"img.url": "fdsfsd"
	},

	setters: {
		"some.num": "Number",
		"other.num": "Number"
	}

});

```

Then initialize it:

```js
var tp = new TestProduct();
console.log(tp.get());	// undefined
console.log(tp.changed());	// Object {img.url: "fdsfsd"}
console.log(tp.set("some.num", "asdfsf").changed())	// Object {img.url: "fdsfsd", some.num: 0}
console.log(tp.set("some.num", "43242").changed())	// Object {img.url: "fdsfsd", some.num: 0}
console.log(tp.set("some.num", "123.3").changed())	// Object {img.url: "fdsfsd", some.num: 123.3}

console.log(tp.save().get()); // {_id: "9DPXPCTffQFv2Xu6h", img.url: "fdsfsd", some.num: 123.3}
```