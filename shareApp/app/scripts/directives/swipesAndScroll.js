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
 * Tap event handler via Hammer.js
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
 * @name swipeDown
 *
 * @description
 * swipeDown event handler via Hammer.js
 */
angular.module('shareApp')
  .directive('swipeDown', ['$parse', function ($parse) {
    return function (scope, elm, attr) {
      if (attr['swipeDown'].length > 0) {
        var fn = $parse(attr['swipeDown']),
          handler = function (e) {
            safeApply(scope, function () {
              fn(scope, {$event: e});
            });
            return false;
          };
        elm.hammer().on('swipedown', handler);
      }
    };
  }]);

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
 * @name onScrollBottom
 *
 * @description
 * Call function on scroll bottom.
 */
angular.module('shareApp')
  .directive('onScrollBottom', ['$parse', function ($parse) {
    return function (scope, elm, attr) {
      var fn = $parse(attr['onScrollBottom']),
        handler = function (event) {
          safeApply(scope, function () {
            fn(scope, {$event: event});
          });
        };
      var onScroll = function () {
        if (angular.element(this).scrollTop() +
          angular.element(this).innerHeight() + 20
          >= angular.element(this)[0].scrollHeight) {
          handler();
        }
      };

      elm.bind('scroll', onScroll);
      elm.on("$destroy", function () {
        elm.unbind('scroll', onScroll);
      });
    };
  }]);


/**
 * @ngdoc directive
 * @name onContainerScroll
 *
 * @description
 * Call function on scroll bottom element with id 'container'.
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