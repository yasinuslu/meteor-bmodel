Utils = {}

Utils.warn = function (msg) {
	console.warn(msg);
}

Utils.extend = function (parent, protoProps, staticProps) {
	// mostly taken from Backbone.js
	var child;

	if(protoProps && _.has(protoProps, "constructor")) {
		child = protoProps.constructor;
	} else {
		child = function () {
			parent.apply(this, arguments);
		}
	}

	// Add static properties to the constructor function, if supplied.
  _.extend(child, parent, staticProps);

  var Surrogate = function() {
    this.constructor = child;
  };
  Surrogate.prototype = parent.prototype;

  // clone parent's prototype with Surrogate
  child.prototype = new Surrogate;

  // this is where we actually extend the parent
  if (protoProps) _.extend(child.prototype, protoProps);

  // just in case we need parent
  child.__super__ = parent.prototype;

  return child;
}
