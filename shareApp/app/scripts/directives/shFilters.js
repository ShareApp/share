/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc directive
 * @name shFilters
 *
 * @description
 * Creates widget with filter switches for stream of SharedItems.
 */
angular.module('shareApp')
  .directive('shFilters', ['$translate', function ($translate) {
    return {
      templateUrl: '/views/filters.html',
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        var setVerboseFilters = function () {
          var checkedItems = element.find("input[type='checkbox']:checked");
          // check if all selected items are "all activities"
          var isAll = element.find("input[type='checkbox'][data-include-to-all]").length === element.find("input[type='checkbox'][data-include-to-all]:checked").length;
          var verboseFilters = "";
          if (isAll || checkedItems.length === 0) {
            verboseFilters = $translate("All activities");
            if (isAll) {
              verboseFilters += ", ";
            }
            checkedItems = checkedItems.not('[data-include-to-all]');
          }
          for (var i = 0; i < checkedItems.length; i = i + 1) {
            var label = checkedItems.eq(i).next("label").find(".text").text();
            verboseFilters += label;
            if (i + 1 != checkedItems.length) {
              verboseFilters += ", ";
            }
          }
          scope.verboseFilters = verboseFilters;
        };
        setVerboseFilters();

        scope.setOnlyOneUser = function (el, value) {
          if (value === true) {
            if (el === 'to_me') {
              scope.user.userWallFilters.direction.from_me = false;
            } else {
              scope.user.userWallFilters.direction.to_me = false;
            }
          }
        };
        scope.filtersSearch = function () {
          safeApply(scope, function () {
            scope.filtersOpened = false;
            setVerboseFilters();
            scope.user.fetchUserShares();
          });
        };
      }
    };
  }]);
