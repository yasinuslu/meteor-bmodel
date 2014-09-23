var BaseModel = BModel.extend('base-model', {
  $var1: '$var1',
  $method1: function() {
    return '$method1';
  }
}, {
  staticvar1: 'staticvar1',
  staticmethod1: function() {
    return 'staticmethod1'
  }
});

var Child = BaseModel.extend('child', {
  $var2: '$var2',
  $method2: function() {
    return '$method2';
  }
}, {
  staticvar2: 'staticvar2',
  staticmethod2: function() {
    return 'staticmethod2';
  }
});

Tinytest.add("extend - prototype chain", function(test) {
  var child = new Child();

  test.instanceOf(child, Child, "Do we have a working constructor");
  test.instanceOf(child, BaseModel, "Does prototype chain reach to BaseModel");
  test.instanceOf(child, BModel, "Does prototype chain reach to BModel");
});

Tinytest.add("extend - protoProps, staticProps", function(test) {
  test.equal(Child.staticvar1, 'staticvar1', "Does Child has Parent's static var ");
  test.equal(Child.staticvar2, 'staticvar2', "Does Child has own static var");

  test.equal(Child.staticmethod1(), 'staticmethod1', "Does Child has Parent's static method");
  test.equal(Child.staticmethod2(), 'staticmethod2', "Does Child has own static method");
});

Tinytest.addAsync("extend - hooks", function(test, completed) {
  var baseModelCalled = false;
  var bModelCalled = false;
  var child = new Child();

  Child.on('before-save', function() {
    // this should be called last
    test.equal(this, child, "child's hook: thisArg is correct");
    test.isTrue(baseModelCalled, "did baseModel's hook called before child's");
    test.isFalse(bModelCalled, "bModel's hook shouldn't be called");

    completed();
  });

  BModel.on('before-save', function() {
    bModelCalled = true;
  });

  BaseModel.on('before-save', function() {
    baseModelCalled = true;
    test.equal(this, child, "parent's hook: thisArg is correct");
  });

  child.$runHooks('before-save');
});