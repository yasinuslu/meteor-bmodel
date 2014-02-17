
Meteor.Collection.prototype.registerModel = function (model) {
	this._model = model
}

Meteor.Collection.prototype._originalFindOne = Meteor.Collection.prototype.findOne;

Meteor.Collection.prototype.findOne = function (selector, options, raw) {
	var doc = Meteor.Collection.prototype._originalFindOne.apply(this, arguments);

	// we shouldn't return empty object
	if(doc && _.isFunction(this._model) && !raw) {
		return this._model.build(doc);
	}

	return doc;
}

Meteor.Collection.prototype._originalFind = Meteor.Collection.prototype.find;

Meteor.Collection.prototype.find = function (selector, options, raw) {
	var cursor = Meteor.Collection.prototype._originalFind.apply(this, arguments);
	var collection = this;

	if(_.isFunction(collection._model) && !raw) {
		cursor._originalForEach = cursor.forEach;

		cursor.forEach = function (callback, thisArg) {
			var _cb = function () {
				arguments[0] = collection._model.build(arguments[0]);
				return callback.apply(thisArg, arguments);
			}
			return cursor._originalForEach(_cb, thisArg);
		}

		cursor._originalFetch = cursor.fetch;
		cursor.fetch = function () {
			return _.map(cursor._originalFetch(), function (doc) {
				return collection._model.build(doc);
			});
		}
	}

	return cursor;
}