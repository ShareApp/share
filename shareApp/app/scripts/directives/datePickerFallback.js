/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */

/**
 * @ngdoc directive
 * @name datePickerFallback
 *
 * @description
 * If input type 'date' is not supported it enables jQuery plugin: dateEntry
 */
angular.module('shareApp')
  .directive('datePickerFallback', ['$parse', function ($parse) {
    return function (scope, elm, attr) {
        elm.dateEntry({dateFormat: 'ymd-'});
    };
  }]);
