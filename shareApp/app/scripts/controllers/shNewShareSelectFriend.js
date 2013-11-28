/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc object
 * Controller for first step of SharedItem creation.
 * It users fbFriendsSelect to choose targetUser and passes it with direction to second step's state.
 */
var ShNewShareSelectFriendCtrl = angular.module('shareApp')
  .controller('ShNewShareSelectFriendCtrl', function ($scope, $state, $location, $translate, shUser, shShare) {
    $scope.user = shUser;
    $scope.share = shShare;
    $scope.sorting = 'frequent';
    $scope.share.type = parseInt($state.params.type, 10);
    shShare.setDefaults();
    $scope.changeDirection = function () {
      if ($scope.share.direction === globals.SHARE_DIRECTION_ENUM.TO_ME) {
        $scope.share.direction = globals.SHARE_DIRECTION_ENUM.TO_FRIEND;
      } else {
        $scope.share.direction = globals.SHARE_DIRECTION_ENUM.TO_ME;
      }
    };


    // TODO: probably there is better way to construct path...
    $scope.createShareStep1 = function () {
      $location.path('/share/' + $scope.share.targetUser.id + '/' + $scope.share.direction + '/' + $scope.share.type);
    };
    $scope.selectFriend = function (target) {
      $scope.share.targetUser = target;
      $scope.createShareStep1();
    };
  });

ShNewShareSelectFriendCtrl.$inject = ['$scope', '$state', '$location', '$translate', 'shUser', 'shShare'];
