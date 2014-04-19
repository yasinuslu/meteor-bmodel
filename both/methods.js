BModel.upsertMethod = function (modelName, selector, modifier, options) {
  var model = BModel._models[modelName];
  if(_.isEmpty(selector) && options.multi) {
    console.log("We prevent update on all documents for security reasons");
    return;
  }
  var ret = model.$collection.upsert(selector, modifier, options);
  return ret;
}

BModel.removeMethod = function (modelName, selector) {
  var model = BModel._models[modelName];
  if(_.isEmpty(selector)) {
    console.log("You're a sneaky one aren't you ? This code both runs on server and client so you can't hack your way in");
    return;
  }
  var ret = model.$collection.remove(selector);
  return ret;
}

Meteor.methods({
  "bmodel/upsert/both": BModel.upsertMethod,
  "bmodel/remove/both": BModel.removeMethod
});

if(Meteor.isServer) {
  Meteor.methods({
    "bmodel/upsert/server": BModel.upsertMethod,
    "bmodel/remove/server": BModel.removeMethod
  });
}