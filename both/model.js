BModel = function (args) {
	var self = this;

	self.$bind(args);

	_.isFunction(self.$init) && self.$init();
}

BModel.cast = function (obj) {
	// Well this seems a little awkard
	return new this(obj);
}

BModel.findOne = function () {
	return this.$collection.findOne.apply(this.$collection, arguments);
}

BModel.findCursor = function (/* args */) {
	return this.$collection.find.apply(this.$collection, arguments);
}

BModel.find = function (selector, options, cast) {
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

_.extend(BModel.prototype, {
	$init: function () {
		// Utils.warn("Init from BModel");
	},
	$setters: {},

	$changedFields: {},

	$changed: function () {
		return this.$changedFields;
	},

	$bind: function (args) {
		_.extend(this, args);
	},

	$setOne: function (key, value) {
		// TODO: some $changed hooks would be good
		// TODO: add an optional argument that can bypass setter
		var setter = this.$setters[key];
		if(_.isFunction(setter)) {
			this.$changedFields[key] = setter(value);
		} else {
			this.$changedFields[key] = value;
		}
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
	}
});

BModel.extend = function (protoProps, staticProps) {
	staticProps = staticProps || {};
	staticProps.$collection = protoProps.$collection;

	var child = Utils.extend(this, protoProps, staticProps);

	var setters = {};
	_.each(child.prototype.setters, function (setterName, key) {
		setters[key] = BModel.Setter.get(setterName);
	});

	child.$collection.registerModel(child);
	child.prototype.$setters = setters;

	return child;
}