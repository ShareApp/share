/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc directive
 * @name shMenu
 *
 * @description
 * Creates widget with sliding menu.
 */
angular.module('shareApp')
  .directive('shMenu', ['$rootScope', function ($rootScope) {
    return {
      templateUrl: '/views/menu.html',
      restrict: 'A',
      link: function postLink(scope, element) {
        /*
         Sets proper menu height and width depends on its items counter
         */
        var setMenuSize = function () {
          var topList = element.find("ul").first(),
            bottomList = element.find("ul.pull-bottom").first(),
            nav = element.find("nav");
          topList.width("auto");

          if (bottomList.width() > topList.width()) {
            topList.width(bottomList.width());
          }
          var container = angular.element("#container")

          if ($rootScope.menuOpened === true) {
            // if menu is extremely wide, leave a little space to go out from menu
            var width = Math.min(container.width() * 0.9, topList.width());
            console.log(width);
            container.css('left', width);
          } else {
            container.css('left', 0);
          }
          var listsHeight = topList.height() + bottomList.height() + 40;
          nav.height(Math.max(element.height() - 20, listsHeight));
        };

        angular.element(document).ready(setMenuSize);
        angular.element(window).resize(setMenuSize);
        $rootScope.$watch('currentLanguage', function (newLang, prevLang) {
          if (newLang !== undefined && prevLang !== undefined) {
            setTimeout(setMenuSize, 100);
          }
        });

        $rootScope.toggleMenu = function () {
          $rootScope.menuOpened = !$rootScope.menuOpened;
        };
        $rootScope.openMenu = function () {
          $rootScope.menuOpened = true;
        };
        $rootScope.closeMenu = function () {
          $rootScope.menuOpened = false;
        };
        $rootScope.$watch('menuOpened', setMenuSize);
      }
    };
  }]);
