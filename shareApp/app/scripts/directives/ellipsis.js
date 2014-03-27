/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */

/**
 * @ngdoc directive
 * @name ellipsis
 *
 * @description
 * Angular directive which enable jQuery dotdotdot plugin.
 */
angular.module('shareApp')
  .directive('ellipsis', ['$parse', function ($parse) {
    return function (scope, elm, attr) {
      scope.$watch('ngBind', function () {
        elm.dotdotdot();
      });

    };
  }]);
