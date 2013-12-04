/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc filter
 * @name timedifference
 *
 * @description
 * Angular filter which applies moment.js library to date objects.
 */
angular.module('shareApp')
  .filter('timedifference', ['$translate', function ($translate) {
    return function (dateStart) {
      var lang = $translate.uses();
      if (lang == "ja_JP") {
        lang = "ja_JA";
      }
      return moment(dateStart).lang(lang).fromNow();
    };
  }]);