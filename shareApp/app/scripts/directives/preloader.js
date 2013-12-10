/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */


/**
 * @ngdoc directive
 * @name preloader
 *
 * @description
 * Attach preloader and stretch area to image
 */
angular.module('shareApp')
  .directive('preloader', ["$window", function ($window) {
    return {
      priority: 97,
      link: function postLink(scope, elm, attr) {
        scope.$watch('share.img', function (newImg) {
          if (newImg !== null) {
            elm.css("visibility", "hidden").css("display", "block");
            var preloader = elm.next(".preloader-container");
            preloader.fadeIn();
            newImg._source.then(function (base64, type) {
              var i = new Image();
              i.onload = function () {
                var container = elm.parent(".img-container");
                var targetHeight = container.width() / i.width * i.height;
                // scale container to image height
                container.height(targetHeight);
              };
              i.src = 'data:' + type + ';base64,' + base64;
            });

            attr.$observe('src', function (val) {
              if (val !== undefined) {
                elm.one('load', function () {
                  // fade out after changed src and load image from parse.com
                  preloader.fadeOut();
                });
              }
            });
          }
        });
      }
    };
  }]);