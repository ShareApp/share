/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
var getPositionImgFun = function (elm, attr) {
  var positionImg = function () {
//    if (!attr.ngSrc) {
//      return;
//    }
    elm.css("visibility", "hidden").css("display", "block");
    elm.css("maxWidth", "100%");
    elm.css("height", "auto");
    var container = elm.parent(".img-container");
    // fill up container with img
    if (container.width() > elm.width()) {
      var width = elm.width();
      var height = elm.height();
      elm.width(container.width());
      elm.height(container.width() / width * height);
    }
    // move img top if img is higher than container
    if (container.height() < elm.height()) {
      var diff = elm.height() / 2 - container.height() / 2;
      elm.css("marginTop", -diff);
      elm.css("marginLeft", "0");
      elm.css("maxWidth", "100%");
    } else {
      // if img is lower than container ex. wide img
      var width = elm.width();
      var height = elm.height();
      elm.height(container.height());
      elm.width(container.height() * (width / height));
      elm.css("maxWidth", "none");
      elm.css("marginTop", 0);
      var diff = elm.width() / 2 - container.width() / 2;
      elm.css("marginLeft", -diff);
    }
    elm.css("display", "none").css("visibility", "visible").fadeIn();
  };
  return positionImg;
};

/**
 * @ngdoc directive
 * @name verticallyPositioned
 *
 * @description
 * Angular directive which positions image in Share to vertical and scales it if needed.
 */
angular.module('shareApp')
  .directive('verticallyPositioned', ["$window", function ($window) {
    return {
      priority: 98,
      scope: {
        src: '='
      },
      link: function postLink(scope, elm, attr) {
        elm.on("load", getPositionImgFun(elm, attr));
        angular.element($window).on("resize", getPositionImgFun(elm, attr));
      }
    };
  }]);

/**
 * @ngdoc directive
 * @name verticallyPositionedNotification
 *
 * @description
 * Angular directive which positions image in Share to vertical and scales it if needed. It works only in notification frame.
 */
angular.module('shareApp')
  .directive('verticallyPositionedNotification', ["$window", '$rootScope', '$timeout', function ($window, $rootScope, $timeout) {
    return {
      priority: 98,
      link: function postLink(scope, elm, attr) {
        $rootScope.$watch('notificationsFrameOpened', function (newVal) {
          if (newVal === true) {
            elm.css("visibility", "hidden").css("display", "block");
            $timeout(getPositionImgFun(elm, attr), 50);
          }
        });
        scope.$watch("src", function (value) {
          elm.one("load", getPositionImgFun(elm, attr));
        });
        angular.element($window).on("resize", getPositionImgFun(elm, attr));
      }
    };
  }]);
