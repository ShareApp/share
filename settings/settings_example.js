/*
 * Example settings for Share application.
 */
function settings(_exports) {
  exports = _exports || exports;
 /*
    See README.md for more documentation on application keys.
  */
  exports.ParseApplicationId = "<insert parse.com application id key>"; // see "Application Keys" in https://www.parse.com/apps/ for your test app on parse.com
  exports.ParsejavaScriptKey = "<insert parse.com javascript script key>"; // see "Application Keys" in https://www.parse.com/apps/ for your test app on parse.com
  exports.FBappId = "<insert facebook application id>"; // either ask us for the application id or create yourself an application for development at https://developers.facebook.com/
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
