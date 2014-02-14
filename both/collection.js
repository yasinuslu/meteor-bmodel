
Meteor.Collection.prototype.registerModel = function (model) {
	this._model = model
}

Meteor.Collection.prototype._findOne = Meteor.Collection.prototype.findOne;

Meteor.Collection.prototype.findOne = function (/* args */) {
	var doc = Meteor.Collection.prototype._findOne.apply(this, arguments);

	// we shouldn't return empty object
	if(doc && _.isFunction(this._model)) {
		return new this._model(doc);
	}

	return doc;
}

Meteor.Collection.prototype._find = Meteor.Collection.prototype.find;

Meteor.Collection.prototype.find = function (/* args */) {
	var cursor = Meteor.Collection.prototype._find.apply(this, arguments);
	var collection = this;

	if(_.isFunction(collection._model)) {
		cursor._fetch = cursor.fetch;
		cursor.fetch = function () {
			return _.map(cursor._fetch(), function (doc) {
				return new collection._model(doc);
			});
		}
	}

	return cursor;
}