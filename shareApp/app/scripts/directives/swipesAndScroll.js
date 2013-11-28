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