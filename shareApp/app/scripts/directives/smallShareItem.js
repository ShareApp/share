/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc directive
 * @name smallShareItem
 *
 * @description
 * Angular directive which shows thumbnail of shared item
 */
angular.module('shareApp')
  .directive('smallShareItem', function () {
    return {
      templateUrl: '/views/smallShareItem.html',
      restrict: 'E',
      scope: {
        share: "&share"
      },
      controller: ['$scope', '$element', '$attrs', '$location', 'shShare', 'shUser',
        function ($scope, $element, $attrs, $location, shShare, shUser) {
          $scope.shShare = shShare;
          $scope.shUser = shUser;
        }]
    };
  });
