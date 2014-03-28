/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc directive
 * @name fbFriendSelect
 *
 * @description
 * Angular directive which show list of Facebook friends.
 */
angular.module('shareApp')
  .directive('fbFriendSelect', function () {
    return {
      template: '<input ng-model="query" autofocus="true" placeholder="{{ "Search for friend" | translate ||">' +
        '<ul class="friends-select"><li ng-repeat="friend in user.friendsList | parseUserFilter: query"> ' +
        '<a href="" ng-click="selectFriend(friend)">' +
        '<fb-profile-picture user-id="friend.attributes.facebookid"></fb-profile-picture>{{ friend.attributes.name }}' +
        '</a>' +
        '</li></ul>',
      restrict: 'E',
      scope: {
        user: '=',
        selectFriend: '='
      }
    };
  });
