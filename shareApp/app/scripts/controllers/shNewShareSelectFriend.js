/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc object
 * @name ShNewShareSelectFriendCtrl
 *
 * @description
 * Angular controller which manages selecting user during process of creating new share
 */
var ShNewShareSelectFriendCtrl = angular.module('shareApp')
  .controller('ShNewShareSelectFriendCtrl', function ($scope, $state, $location, $translate, shUser, shShare) {
    $scope.user = shUser;
    $scope.share = shShare;
    $scope.visibleFriends = 10;
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
    $scope.selectFriend = function (targetUser) {
      var callback = function (targetUser) {
        $scope.share.targetUser = targetUser;
        $scope.createShareStep1();
      };
      if (targetUser.get('fakeUser') === true && targetUser.id === targetUser.get('facebookid')) {
        // creating user which we want to create share
        Parse.User.signUp(Math.random().toString(36).substring(2), Math.random().toString(36).substring(2), {
          facebookid: targetUser.get('facebookid'),
          name: targetUser.get('name'),
          firstName: targetUser.get('name').split(" ")[0],
          fakeUser: true
        }).then(function (user) {
            shUser.friendsList = shUser.friendsList.filter(function (u) {
              return u.get('facebookid') !== targetUser.get('facebookid');
            }).concat([user]);
            callback(user);
          });
      } else {
        callback(targetUser);
      }
    };
    // lazy loading
    $scope.loadMoreFriends = function () {
      var currentScroll = angular.element("#container").scrollTop() + angular.element(window).height(),
        currentHeight = angular.element("#content-container").height() + angular.element("#header-container").height();
      if (currentScroll >= currentHeight) {
        $scope.visibleFriends += 10;
      }
    };
  });

ShNewShareSelectFriendCtrl.$inject = ['$scope', '$state', '$location', '$translate', 'shUser', 'shShare'];
