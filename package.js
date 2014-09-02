Package.describe({
  summary: 'A simple model that does the job.',
  version: "0.1.5",
  git: "https://github.com/yasinuslu/meteor-bmodel.git"
});

Package.onUse(function(api) {
  api.versionsFrom("METEOR@0.9.0");
  var both = ["client", "server"];
  api.use(["mongo-livedata", "underscore", "ejson"], both);

  api.addFiles("lib/both/lodash.compat.js");
  api.addFiles("lib/both/utils.js");
  api.addFiles("lib/both/model.js");
  api.addFiles("lib/both/setter.js");

  api.export("BModel", both);
  api.export("BModelUtils", both);
});

Package.onTest(function(api) {
  api.use(["yasinuslu:bmodel", "tinytest", "test-helpers", "underscore"]);
  api.addFiles("tests/utils.js");
});