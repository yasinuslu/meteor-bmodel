meteor-bmodel
=============

A simple model for meteor that does the job.

`mrt add bmodel`

Extend BModel

```js
Products = new Meteor.Collection("products");
Product = BModel.extend({
	$collection: Products,

  $defaults: {
		"img.url": "/img/foo.png"
	},

	$setters: {
		"some.num": "Number",
		"other.num": "Number"
	}

});

```

Ready to roll:

```js
var p = new Product();
p.$set("some.embedded.key", "Test");
p.$changed();	// Object {some.embedded.key: "Test"}
p.$save();
p.$changed();	// Object {}

var p = Products.findOne(tp._id);
console.log(p);
```

result:
```json
{
  "_id": "rcQwk45uKphPNE33i",
  "img": {
    "test": {
      "url": "Testt"
    }
  },
  "some": {
    "embedded": {
      "key": "Test"
    }
  }
}
```

Casts all database objects to BModel instance:

```js
var product = Products.findOne();
product.$set("some.embedded.key", "Test");
product.$save();

product.$get("some.embedded.key");  // => Test
```

It's not all:
```js
b.$get("some.embedded.key");		// "Test"
b.$collapse();	// {_id: "rcQwk45uKphPNE33i", img.test.url: "Testt", some.embedded.key: "Test"}
```

And there are setters:
```js
tp.$set("some.num", "4214321");
tp.$changed();	// Object {some.num: 4214321}
```

You can define new setters:
```js
BModel.Setter.add("Number", function (value) {
	return _.isFinite(value) ? value * 1 : 0;
});
```

Or you can just give function when extending model:
```js
TestProducts = new Meteor.Collection("test_products");
TestProduct = BModel.extend({
	$collection: TestProducts,

	$defaults: {
		"img.url": "Test Image URL"
	},

	$setters: {
		"some.num": function (value) {
			return _.isFinite(value) ? value * 1 : 0;
		},
		"other.num": "Number"
	}
});
```

TODO
- Handle reactivity with care. Implement onInvalidate so that changed fields won't be overriden on Deps flush.
