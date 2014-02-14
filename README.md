meteor-bmodel
=============

A simple model for meteor that does the job.

`mrt add bmodel`

Extend BModel

```js
TestProducts = new Meteor.Collection("test_products");
TestProduct = BModel.extend({
	$collection: TestProducts,

	$defaults: {
		"img.url": "Test Image URL"
	},

	$setters: {
		"some.num": "Number",
		"other.num": "Number"
	}

});

```

Ready to roll:

```js
var tp = new TestProduct();
tp.$set("some.embedded.key", "Test");
tp.$changed();	// Object {some.embedded.key: "Test"}
tp.$save();
tp.$changed();	// Object {}

var b = TestProducts.findOne(tp._id);
console.log(b);
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

It's not all:
```js
b.$get("some.embedded.key");		// "Test"
b.$shallowify();	// {_id: "rcQwk45uKphPNE33i", img.test.url: "Testt", some.embedded.key: "Test"}
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