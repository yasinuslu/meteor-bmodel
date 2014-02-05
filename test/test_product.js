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