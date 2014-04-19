BModel = function (args) {
  var self = this;

  self.$changedFields = {};
  self.$extend(self.$defaults, false, true);

  if(_.isString(args))
    self.$extend(self.$collection.findOne(args));
  else if (_.isObject(args))
    self.$extend(args);

  _.isFunction(self.$init) && self.$init();
}

BModel._models = {};

// a method that reactively gets given object
BModel.get = function (oldObject, _id) {
  // IR checks EJSON.equals between oldObject and obj
  // so we need to return new instance
  // EJSON.equals first checks for references, then it diffs deeply
  var obj = new this();
  if(_id) {
    var dbObj = this.$collection.findOne(_id, null, true);
    if(!dbObj) {
      return null;  // for not found on IR
    }
    obj.$extend(dbObj);
  }

  if(oldObject) {
    obj.$dep = oldObject.$dep;
    obj.$changedFields = oldObject.$changedFields || {};
    obj.$extend(Utils.expand(oldObject.$changedFields));
  }

  if(_.isUndefined(obj.$dep)) {
    obj.$dep = new Deps.Dependency();
  }

  obj.$dep.depend();
  return obj;
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

BModel.findAllCursor = function () {
  return this.findCursor({});
}

BModel.remove = function (where, selector, callback) {
  where = where || "both";
  return Meteor.call("bmodel/remove/" + where, this.$name, selector, callback);
}

BModel.upsert = function (where, selector, modifier, options, callback) {
  where = where || "both";
  return Meteor.call("bmodel/upsert/" + where, this.$name, selector, modifier, options, callback);
}

_.extend(BModel.prototype, {
  $init: function () {

  },
  $setters: {},

  $changed: function () {
    return this.$changedFields;
  },

  $extend: function (args, shallow, expand) {
    if(!args) {
      return this;
    }

    if(expand) {
      args = Utils.expand(args);
    }

    // Utils.Log.callLog("model.instance.extend");

    if(shallow)
      _lodash.extend(this, args);
    else
      _lodash.merge(this, args);

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
      this.$changedFields[key] = setter(value);
    } else {
      this.$changedFields[key] = value;
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

    // do we have a dependency ?
    // if we don't have a dependency, we don't need to be reactive :)
    if(self.$dep) {
      self.$dep.changed();
    }

    return this;
  },

  $save: function (where, fn) {
    where = where || "both";
    var self = this;

    var fields = {};

    if(_.isEmpty(self._id)) {
      if(_.isFunction(self.$onCreate)) {
        self.$onCreate();
      }

      _lodash.merge(fields, self.$defaults);
    }

    if(_.isFunction(self.$onSave)) {
      self.$onSave();
    }

    _lodash.merge(fields, self.$changedFields);

    fields = Utils.collapse(fields);

    self.__static__.upsert(where, self._id, {
      $set: fields
    }, {}, function (err, ret) {
      if(!err) {
        self.$changedFields = {};
      }

      if(ret.insertedId) {
        self._id = ret.insertedId;
      }

      if(_.isFunction(fn)) {
        fn.call(self, err);
      }
    });

    return self;
  },

  $remove: function (where) {
    this.__static__.remove(where, this._id);
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
  staticProps.$name = protoProps.$name;

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
    setters[key] = _.bind(setter, child);
  });

  child.prototype.$setters = setters;

  BModel._models[child.$name] = child;
  return child;
}