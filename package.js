Package.describe({
  summary: 'A simple model that does the job.',
  version: "0.1.4",
  git: "https://github.com/yasinuslu/meteor-bmodel.git"
});

Package.on_use(function (api) {
  api.versionsFrom("METEOR@0.9.0");
  var both = ["client", "server"];
  api.use(["mongo-livedata", "underscore"], both);

  api.add_files("both/lodash.compat.js");
  api.add_files("both/utils.js");
  api.add_files("both/model.js");
  api.add_files("both/setter.js");

  api.export("BModel");
  api.export("BModelUtils");
});

Package.on_test(function (api) {
  api.use(["/Users/nepjua/code/meteor/new_packages/bmodel/", "tinytest", "test-helpers", "underscore"]);

  api.add_files("tests/utils.js");
});