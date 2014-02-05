BModel.Setter = {
	_setters: {},
	add: function (name, fn) {
		this._setters[name] = fn;
	},
	get: function (name) {
		return this._setters[name];
	}
}

BModel.Setter.add("Number", function (value) {
	return _.isFinite(value) ? value * 1 : 0;
});