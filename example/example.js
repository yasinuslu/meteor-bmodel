App = {};

App.Product = BModel.extend({
  $name: "product",
  $collection: new Meteor.Collection("products"),

  $setters: {
    "price": "Number",
    "cargo_price": "Number"
  },
});

App.Product.$defaults = {
  "title": "Title",
  "description": "Title",
  "price": 10.5,
  "cargo_price": 2.5
}

App.Product.createOne = function(title) {
  var product = new App.Product();
  product.$set({
    title: title,
    price: '15.3' // this will be converted to number
  });

  product.$save();
};

index = 0;

if (Meteor.isClient) {
  Template.hello.events({
    'click button': function() {
      App.Product.createOne("Test" + index++);
    }
  });

  Template.hello.products = function() {
    return App.Product.findCursor();
  }
}