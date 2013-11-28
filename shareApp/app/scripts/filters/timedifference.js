/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * Angular filter didn't manage objects' attributes, so we need custom filter to query users.
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