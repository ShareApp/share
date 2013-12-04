/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
angular.module('shareApp')
  .directive('scrollAfterFocus', ["$window", function ($window) {
    return {
      link: function postLink(scope, elm, attr) {
        elm.on('focus', function() {
          angular.element("#container").scrollTop(angular.element(this).offset().top);
        });
      }
    };
  }]);
