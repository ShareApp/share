/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */

/**
 * @ngdoc directive
 * @name tap
 *
 * @description
 * Angular directive which can handle tap event handler via Hammer.js
 */
angular.module('shareApp')
  .directive('tap', ['$parse', function ($parse) {
    return function (scope, elm, attr) {
      if (attr['tap'].length > 0) {
        var fn = $parse(attr['tap']),
          handler = function (e) {
            safeApply(scope, function () {
              fn(scope, {$event: e});
            });
            return false;
          };
        elm.hammer().on('tap', handler);
      }
    };
  }]);

/**
 * @ngdoc directive
 * @name onContainerSwipeDown
 *
 * @description
 * Angular directive which can handle swipeDown event handler via Hammer.js attached to element with id=container
 */
angular.module('shareApp')
  .directive('onContainerSwipeDown', ['$parse', function ($parse) {
    return function (scope, elm, attr) {
      var lastUsed = new Date();
      if (attr['onContainerSwipeDown'].length > 0) {
        var fn = $parse(attr['onContainerSwipeDown']),
          handler = function (e) {
            var now = new Date();
            // to eliminate frequently triggered event
            if ((now - lastUsed) > 200) {
              lastUsed = now;
              safeApply(scope, function () {
                fn(scope, {$event: e});
              });
            }
            return false;
          };
        angular.element("#container").hammer().on('dragdown', handler);
      }
    };
  }]);

/**
 * @ngdoc directive
 * @name onContainerSwipeUp
 *
 * @description
 * Angular directive which can handle swipeUp event handler via Hammer.js attached to element with id=container
 */
angular.module('shareApp')
  .directive('onContainerSwipeUp', ['$parse', function ($parse) {
    return function (scope, elm, attr) {
      var lastUsed = new Date();
      if (attr['onContainerSwipeUp'].length > 0) {
        var fn = $parse(attr['onContainerSwipeUp']),
          handler = function (e) {
            var now = new Date();
            // to eliminate frequently triggered event
            if ((now - lastUsed) > 200) {
              lastUsed = now;
              safeApply(scope, function () {
                fn(scope, {$event: e});
              });
            }
            return false;
          };
        angular.element("#container").hammer().on('dragup', handler);
      }
    };
  }]);

/**
 * @ngdoc directive
 * @name onContainerScroll
 *
 * @description
 * Angular directive which call function on scroll bottom element with id=container.
 */
angular.module('shareApp')
  .directive('onContainerScroll', ['$parse', function ($parse) {
    return function (scope, elm, attr) {
      var fn = $parse(attr['onContainerScroll']),
        handler = function (event) {
          safeApply(scope, function () {
            fn(scope, {$event: event});
          });
        };
      angular.element("#container").bind('scroll', handler);
      elm.on("$destroy", function () {
        angular.element("#container").unbind('scroll', handler);
      });
    };
  }]);