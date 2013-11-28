/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * Converts big numbers to verbose representation
 */
angular.module('shareApp')
  .filter("shortVerboseNumber", function () {
    return function (input) {
      if (parseFloat(input) >= 1000 && parseFloat(input) < 10000) {
        return Math.round(parseInt(input) / 1000) + "K";
      } else if (parseFloat(input) >= 10000) {
        return ">9K";
      } else {
        return input;
      }
    };
  });
