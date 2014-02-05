BModel = function (args) {
	var self = this;

	if(_.isObject(self.defaults)) {
		self.set(self.defaults);
	}

	if(_.isString(args)) {
		// assuming args is _id
		self.setId(args);
	} else if(_.isObject(args)) {
		// assuming args is hashmap for fields
		self.set(args);
	}
}

BModel.cast = function (obj) {
	// Well this seems a little awkard
	return new this(obj._id);
}

BModel.findOne = function (selector, options, cast) {
	var obj = this._collection.findOne(selector, options);
	return cast ? this.cast(obj) : obj;
}

BModel.findCursor = function (/* args */) {
	return this._collection.find.apply(this._collection, arguments);
}

BModel.find = function (selector, options, cast) {
	var arr = this.findCursor(selector, options).fetch();
	return cast ? _.map(arr, _.bind(this.cast, this)) : arr;
}

BModel.findAll = function (cast) {
	var arr = this.findAllCursor().fetch();
	return cast ? _.map(arr, _.bind(this.cast, this)) : arr;
}

BModel.findAllCursor = function () {
	return this.findCursor({});
}

_.extend(BModel.prototype, {
	_setters: {},

	changedFields: {},

	changed: function () {
		return this.changedFields;
	},

	_set: function (key, value) {
		// TODO: some changed hooks would be good
		// TODO: add an optional argument that can bypass setter
		var setter = this._setters[key];
		if(_.isFunction(setter)) {
			this.changedFields[key] = setter(value);
		} else {
			this.changedFields[key] = value;
		}
	},

	set: function (key, value) {
		var self = this;

		if(_.isString(key) && !_.isUndefined(value)) {
			self._set(key, value);
		} else if(_.isObject(key)) {
			_.each(key, function (v, k) {
				self.set(k, v);
			});
		} else {
			Utils.warn("when calling set, key should be a string or object");
		}

		return this;
	},

	setId: function (_id) {
		this._id = _id;
	},

	get: function (_id) {
		return this._collection.findOne(this._id);
	},

	save: function (_id) {
		if(_.isString(_id)) {
			this._id = _id;
		}

		if(!_.isString(this._id)) {
			this._id = this._collection.insert({});
		}

		this._collection.update(this._id, {
			$set: this.changedFields
		});

		this.changedFields = {};

		return this;
	}
});

BModel.extend = function (protoProps, staticProps) {
	staticProps = staticProps || {};
	staticProps._collection = protoProps._collection;

	var child = Utils.extend(this, protoProps, staticProps);

	var setters = {};
	_.each(child.prototype.setters, function (setterName, key) {
		setters[key] = BModel.Setter.get(setterName);
	});

	child.prototype._setters = setters;

	return child;
}