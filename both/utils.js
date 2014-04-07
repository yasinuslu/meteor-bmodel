BModelUtils = Utils = {};

Utils.Log = {
  _logs: {},

  callLog: function (key, message) {
    var log = this._logs[key] = this._logs[key] || {};
    _.extend(log, {
      count: ++log.count || 1,
      message: message || key
    })

    console.log(key, " count: ", log.count);
  }
};

Utils.warn = function (msg) {
  console.warn(msg);
}

Utils.collapse = function(src, maxLevel) {
  if(!_.isObject(src)) {
    return null;
  }

  if(this.debugMode) {
    debugger
  }

  maxLevel = maxLevel || 0;
  var $set = {};
  // get rid of EJSON incompatible types
  var obj = EJSON.parse(EJSON.stringify(src));

  var deepWalk = function(obj, parents) {
    var keys = [];
    if ( (maxLevel > 0 && parents.length >= maxLevel)
        ||  !_.isObject(obj)
        ||  (
            _.isObject(obj)
            && (keys = _.keys(obj)).length < 1)
            )
    {
      var key = parents.join(".");
      if(!_.isEmpty(key)){
        $set[key] = obj;
      }
      return;
    }


    _.each(obj, function(item, key) {
      var pr = EJSON.clone(parents);
      pr.push(key);
      deepWalk(item, pr);
    });
  }

  deepWalk(obj, []);

  return $set;
}

Utils.expand = function (sourceObj) {
  var sourceClone = _.clone(sourceObj);
  _.each(sourceClone, function (val, field) {
    var keys = field.split(".");
    if(keys.length == 1) {
      return;
    }

    var i;
    var obj = sourceClone;

    for (i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]] = obj[keys[i]] || {};
    }

    obj[keys[i]] = val;
    delete sourceClone[field];
  });

  return sourceClone;
}

Utils.deepSet = function (obj, field, val) {
  if(!_.isObject(obj) || !_.isString(field)) {
    return;
  }

  var keys = field.split(".");

  for (i = 0; i < keys.length - 1; i++) {
    obj = obj[keys[i]] = obj[keys[i]] || {};
  }

  obj[keys[i]] = val;
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