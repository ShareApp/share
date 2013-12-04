/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc directive
 * @name langSwitcher
 *
 * @description
 * Creates switcher for localization files.
 */
angular.module('shareApp')
  .directive('langSwitcher', ['$rootScope', function ($rootScope) {
    return {
      template: '<button ng-class="{active: language.value == currentLanguage}" ng-repeat="language in languages" value="{{ language.value }}">{{ language.abbr }}</button>',
      link: function postLink(scope, element, attrs, controller) {
        element.on("click", "button", function () {
          var val = angular.element(this).val();
          element.find("button").removeClass("active");
          angular.element(this).addClass("active");
          safeApply($rootScope, function () {
            $rootScope.currentLanguage = val;
          });
        });
      },
      restrict: 'A'
    };
  }]);
