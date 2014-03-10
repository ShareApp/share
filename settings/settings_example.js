function settings(_exports) {
  exports = _exports || exports;
  exports.ParseApplicationId = "REPLACE";
  exports.ParsejavaScriptKey = "REPLACE";
  exports.FBappId = "REPLACE";
  exports.debug = true;
}
if (typeof define === 'undefined') {
  settings();
} else {
  define(function (require, exports, module) {
    settings(exports);
  });
}