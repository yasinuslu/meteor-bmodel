BModel = function() {
  // this is BModel
};

BModel._name = '_bmodel';
BModel._models = {};

BModel.extend = function(name, protoProps, staticProps) {
  var Child = Utils.extend(this, protoProps, staticProps);

  // delete unwanted static members
  _.each(['_hooks', '_models', 'name'], function(key) {
    delete Child[key];
  });

  // delete unwanted instance members
  _.each([], function(key) {
    delete Child.prototype[key];
  });

  BModel._models[name] = Child;
  Child._name = name;

  return Child;
};

BModel.getHook = function(name) {
  this._hooks = this._hooks || {};
  var hook = this._hooks[name] = this._hooks[name] || [];
  return hook;
};

BModel.on = function(name, fn) {
  // TODO: check all arguments
  if (!_.isFunction(fn)) {
    console.log('hook for ' + name + ' should be a function');
    return;
  }

  var hook = this.getHook(name);
  hook.push(fn);
};

BModel.getParents = function() {
  var current = this; // this is the constructor
  var parents = [];

  while (current && current._name !== '_bmodel') {
    parents.push(current);

    current = Utils.getParent(current);
  }

  parents.reverse();

  return parents;
};

BModel.prototype.$runHooks = function(name, thisArg) {
  thisArg = thisArg || this;

  var parents = this.constructor.getParents();

  _.each(parents, function(parent) {
    var hooks = parent.getHook(name);
    _.each(hooks, function(hook) {
      hook.call(thisArg);
    });
  });
};