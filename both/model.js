BModel = function (args) {
  var self = this;

  self.$extend(self.$defaults);

  if(_.isString(args))
    self.$extend(self.$collection.findOne(args));
  else if (_.isObject(args))
    self.$extend(args);

  _.isFunction(self.$init) && self.$init();
}

BModel.build = function (obj) {
  if(obj instanceof BModel) {
    return obj;
  }

  return new this(obj);
}

BModel.findOne = function () {
  return this.$collection.findOne.apply(this.$collection, arguments);
}

BModel.findCursor = function (/* args */) {
  return this.$collection.find.apply(this.$collection, arguments);
}

BModel.find = function (selector, options) {
  return this.findCursor(selector, options).fetch();
}

BModel.findAll = function () {
  return this.findAllCursor().fetch();
}

BModel.remove = function (/* args */) {
  return this.$collection.remove.apply(this.$collection, arguments);
}

BModel.findAllCursor = function () {
  return this.findCursor({});
}

BModel.update = function (query, modifier, options, callback) {
  return this.$collection.update(query, modifier, options, callback);
}

_.extend(BModel.prototype, {
  $init: function () {
    // Utils.warn("Init from BModel");
  },
  $setters: {},

  $changedFields: {},

  $changed: function () {
    return this.$changedFields;
  },

  $extend: function (args, shallow) {
    if(!args) {
      return this;
    }

    // Utils.Log.callLog("model.instance.extend");

    if(shallow)
      _.extend(this, args);
    else
      Utils.deepExtend(this, args);

    return this;
  },

  /*
    there is no need for Deps methods for now.
    Model instances will be created in a reactive context anyway.
    Which are handled another places.
    We should be careful for this method, it could cause infinite reactivity
  */
  $reload: function () {
    if(this._id)
      this.$extend(this.$collection.findOne(this._id));

    return this;
  },

  $setOne: function (key, value) {
    // TODO: some $changed hooks would be good
    // TODO: add an optional argument that can bypass setter
    if(_.isFunction(value)) {
      return;
    }

    var setter = this.$setters[key];
    if(_.isFunction(setter)) {
      this[key] = this.$changedFields[key] = setter(value);
    } else {
      this[key] = this.$changedFields[key] = value;
    }
  },

  $shallowify: function () {
    return Utils.collapse(this);
  },

  $get: function (key) {
    return Utils.deepGet(this, key, null);
  },

  $set: function (key, value) {
    var self = this;

    if(_.isString(key) && !_.isUndefined(value)) {
      self.$setOne(key, value);
    } else if(_.isObject(key)) {
      _.each(key, function (v, k) {
        self.$set(k, v);
      });
    } else {
      Utils.warn("when calling set, key should be a string or object");
    }

    return this;
  },

  $create: function () {
    this._id = this.$collection.insert({});
    this.$collection.update(this._id, {
      $set: this.$defaults
    });

    return this;
  },

  $save: function (_id) {
    if(_.isString(_id)) {
      this._id = _id;
    }

    if(!_.isString(this._id)) {
      this.$create();
    }

    this.$collection.update(this._id, {
      $set: this.$changedFields
    });

    this.$changedFields = {};

    return this;
  },

  $remove: function () {
    this.$collection.remove(this._id);
  },

  $update: function (modifier, options, callback) {
    this.__static__.update(this._id, modifier, options, callback);
    return this;
  },

  $raw: function () {
    return this.$collection.findOne(this._id, null, true);
  },

  $clone: function () {
    var obj = new this.__static__();
    var dbObj = _.omit(this.$raw(), "_id");
    obj.$set(dbObj);

    return obj;
  }
});

BModel.extend = function (protoProps, staticProps) {
  staticProps = staticProps || {};
  staticProps.$collection = protoProps.$collection;

  // mostly taken from Backbone.js
  var child;
  var parent = this;

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
  // calling __super__.{method} proved to be dangerous
  // TODO: figure out a better inheritance model
  child.__super__ = parent;
  child.prototype.__super__ = parent.prototype;
  child.prototype.__static__ = child;

  var setters = {};
  _.each(child.prototype.$setters, function (setterName, key) {
    var setter = setterName;
    if(_.isString(setter)) {
      setter = BModel.Setter.get(setterName);
    }
    setters[key] = setter;
  });

  if(child.$collection && _.isFunction(child.$collection.registerModel)) {
    child.$collection.registerModel(child);
  }

  child.prototype.$setters = setters;

  return child;
}