var obj = {
  "a": {
    "a": {
      "a": "a.a.a",
      "b": "a.a.b"
    },

    "b": {
      "a": "a.b.a"
    },

    "c": "a.c"
  },

  "b": "b",

  "c": {
    "a": "c.a"
  }
}

var Utils = BModelUtils;

var collapsed = Utils.collapse(obj);
var expanded = Utils.expand(obj);

Tinytest.add("Utils - deepGet", function (test) {
  test.equal(Utils.deepGet(obj, "a.a.a"), "a.a.a", "Can i use dot notation with expanded objects");
  test.equal(Utils.deepGet(collapsed, "a.a.a"), "a.a.a", "Can i use dot notation with collapsed objects");
});

Tinytest.add("Utils - collapse", function (test) {
  test.equal(collapsed["a.a.a"], "a.a.a", "Did a.a.a collapsed");
  test.isUndefined(collapsed["a.a"], "a.a should be undefined");
});

Tinytest.add("Utils - expand", function (test) {
  test.equal(expanded, obj, "simple objects shouldn't change after collapse - expand");
});

Tinytest.add("Utils - deepExtend", function (test) {
  var myObj = _.clone(obj);
  Utils.deepExtend(myObj, {
    "a.a.c": "a.a.c",
    a: {
      b: {
        a: "a.b.a-extended"
      }
    }
  });

  test.equal(Utils.deepGet(myObj, "a.a.c"), "a.a.c", "should be able to extend with dot notation");
  test.equal(Utils.deepGet(myObj, "a.b.a"), "a.b.a-extended", "should be able to extend with embedded objects");
  test.equal(Utils.deepGet(myObj, "a.a.a"), "a.a.a", "shouldn't damage original data on extended object");
});