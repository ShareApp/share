/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
angular.module('shareApp')
  .directive('datePickerFallback', ['$parse', function ($parse) {
    return function (scope, elm, attr) {
      if (!Modernizr.inputtypes.date) {
        elm.dateEntry({dateFormat: 'ymd-'});
      }
    };
  }]);
