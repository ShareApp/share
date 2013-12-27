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
 * Creates widget with sliding menu using snap.js lib.
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
          window.snapper.settings({
            maxPosition: topList.width()
          });
          if ($rootScope.menuOpened === true) {
            window.snapper.open('left');
          }
          var listsHeight = topList.height() + bottomList.height() + 40;
          nav.height(Math.max(element.height() - 20, listsHeight));
        };

        element.find("ul a").bind('click', function () {
          window.snapper.close();
        });

        angular.element(document).ready(setMenuSize);
        angular.element(window).resize(setMenuSize);
        $rootScope.$watch('currentLanguage', function(newLang, prevLang){
          if(newLang !== undefined && prevLang !== undefined) {
            setTimeout(setMenuSize, 100);
          }
        });
        scope.menuToggle = function () {
          console.log("menu toggling");
          console.log(window.snapper.state().state);
          if (window.snapper.state().state === "closed") {
            scope.menuOpen();
          } else {
            scope.menuClose();
          }
        };
        scope.menuOpen = function () {
          console.log("menu opening");
          element.removeClass("closed");
          window.snapper.open('left');
          setMenuSize();
        };
        scope.menuClose = function () {
          console.log("menu closing");
          window.snapper.close();
        };

        window.snapper.on("animated", function () {
          if (window.snapper.state().state === 'closed') {
            element.addClass("closed");
          } else {
            element.removeClass("closed");
          }
        });
        window.snapper.on("animating", function () {
          element.removeClass("closed");
        });
        element.addClass("closed");

        window.snapper.on("open", function () {
          safeApply($rootScope, function(){$rootScope.menuOpened = true;});
          console.log("menu opened");
        });
        window.snapper.on("close", function () {
          safeApply($rootScope, function(){$rootScope.menuOpened = false;});
          console.log("menu closed");
        });
      }
    };
  }]);
