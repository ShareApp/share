/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * Converts string to url-safe.
 */
angular.module('shareApp')
  .filter("slugify", function () {
    return function (input) {
      return input.toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
    };
  });
