/*
 * Example settings for Share application.
 */
function settings(_exports) {
  exports = _exports || exports;
  exports.ParseApplicationId = "<insert parse.com application id key>"; // see
  exports.ParsejavaScriptKey = "<insert parse.com javascript script key>"; // see
  exports.FBappId = "<insert facebook application id>"; //
  exports.debug = true; // see README.md for usage
}

// in order to enable settings to work server side and client side need this hack
if (typeof define === 'undefined') {
  settings();
} else {
  define(function (require, exports, module) {
    settings(exports);
  });
}