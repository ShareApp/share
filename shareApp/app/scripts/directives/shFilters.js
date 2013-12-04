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
      templateUrl: 'views/filters.html',
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        var setVerboseFilters = function () {
          var checkedItems = element.find("input[type='checkbox']:checked + label").find(".text");
          if (checkedItems.length != 0) {
            var verboseFilters = "";
            for (var i = 0; i < checkedItems.length; i = i + 1) {
              verboseFilters += checkedItems.eq(i).text();
              if (i + 1 != checkedItems.length) {
                verboseFilters += ", ";
              }
            }
            scope.verboseFilters = verboseFilters;
          } else {
            scope.verboseFilters = $translate("All activities");
          }
        };
        setVerboseFilters();

        scope.filtersSearch = function () {
          safeApply(scope, function(){
            scope.filtersOpened = false;
            setVerboseFilters();
            scope.user.fetchUserShares();
            scope.user.fetchUserAwaitingShares();
          });
        };
      }
    };
  }]);
