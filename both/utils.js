Utils = {}

Utils.warn = function (msg) {
	console.warn(msg);
}

Utils.shallowify = function(src, maxLevel) {
  if(!_.isObject(src)) {
    return null;
  }

  maxLevel = maxLevel || 0;
  var $set = {};
  // get rid of functions, back-referenced attributes etc...
  var obj = JSON.parse(JSON.stringify(src));

  var deepWalk = function(obj, parents) {
    var keys = [];
    if ( (maxLevel > 0 && parents.length >= maxLevel)
        || !_.isObject(obj)
        || (_.isObject(obj)
        && (keys = _.keys(obj)).length < 1)) {
      var key = parents.join(".");
      $set[key] = obj;
      return;
    }


    _.each(obj, function(item, key) {
      var pr = _.clone(parents);
      pr.push(key);
      deepWalk(item, pr);
    });
  }

  deepWalk(obj, []);

  return $set;
}

Utils.deepGet = function(obj, field, def) {
  def = def || null;
  if(!obj) {
    return def;
  }

  if(obj[field]) {
    return obj[field];
  }

  var keys = field.split(".");

  for (var i = 0; i < keys.length && (obj = obj[keys[i]]); i++);

  return obj || def;
}