/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc object
 * @name ShNewShareCtrl
 *
 * @description
 * Angular controller which manages creating new Share
 */
var ShNewShareCtrl = angular.module('shareApp')
  .controller('ShNewShareCtrl', function ($scope, $state, $location, $translate, $rootScope, shUser, shShare, shSync) {
    var setUsers = function () {
      if ($scope.share.direction === globals.SHARE_DIRECTION_ENUM.TO_ME) {
        $scope.fromUser = shShare.targetUser;
        $scope.toUser = shUser.currentUser;
      } else {
        $scope.fromUser = shUser.currentUser;
        $scope.toUser = shShare.targetUser;
      }
    };
    shShare.type = $state.params.type;
    shShare.direction = $state.params.direction;
    $scope.user = shUser;
    $scope.share = shShare;
    $scope.postOnFB = true;
    $scope.isOnline = shSync.isOnline;
    setUsers();

    // Set targetUser from state (url).
    $scope.$watch('user.friendsList', function () {
      angular.forEach(shUser.friendsList, function (friend) {
        if (friend.id === $state.params.targetId) {
          $scope.share.targetUser = friend;
          setUsers();
        }
      });
    });

    // Set type and direction for new SharedItem from state (url).
    $scope.share.direction = parseInt($state.params.direction, 10);
    $scope.share.type = parseInt($state.params.type, 10);

    // Upload photo to Parse
    $scope.uploadPhoto = function (files) {
      if (files.length > 0) {
        var file = files[0];
        shShare.uploadPhoto(file).then(function () {
        });
      }
    };
  });


ShNewShareCtrl.$inject = ['$scope', '$state', '$location', '$translate', '$rootScope', 'shUser', 'shShare', 'shSync'];