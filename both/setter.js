BModel.Setter = {
	$setters: {},
	add: function (name, fn) {
		this.$setters[name] = fn;
	},
	get: function (name) {
		return this.$setters[name];
	}
}

BModel.Setter.add("Number", function (value) {
	return _.isFinite(value) ? value * 1 : 0;
});