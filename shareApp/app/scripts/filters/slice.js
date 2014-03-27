/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc filter
 * @name slice
 *
 * @description
 * Angular filter which slice given array
 */
angular.module('shareApp')
  .filter('slice', function() {
    return function(arr, start, end) {
      return arr.slice(start, end);
    };
  });