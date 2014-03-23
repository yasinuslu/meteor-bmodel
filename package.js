Package.describe({
  summary: 'A simple model that does the job.'
});

Package.on_use(function (api) {
  var both = ["client", "server"];
  api.use(["mongo-livedata", "underscore"], both);

  api.add_files("both/utils.js");
  api.add_files("both/model.js");
  api.add_files("both/setter.js");
  api.add_files("both/collection.js");

  api.export("BModel");
  api.export("Utils");
});

Package.on_test(function (api) {
  api.use(["bmodel", "tinytest", "test-helpers", "underscore"]);

  api.add_files("tests/utils.js");
});