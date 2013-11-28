/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * Shows thumbnail of sharedItem
 */
angular.module('shareApp')
  .directive('smallShareItem', function () {
    return {
      templateUrl: "views/smallShareItem.html",
      restrict: 'E',
      scope: {
        share: "&share"
      },
      controller: ['$scope', '$element', '$attrs', '$location', 'shShare',
        function ($scope, $element, $attrs, $location, shShare) {
          $scope.shShare = shShare;
        }]
    };
  });
