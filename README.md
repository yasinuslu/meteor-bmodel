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
tp.$set("some.embedded.key");
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