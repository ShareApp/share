/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc directive
 * @name shNotifications
 *
 * @description
 * Creates widget with notifications.
 */
angular.module('shareApp')
  .directive('shNotifications', function () {
    return {
      templateUrl: '/views/notifications.html',
      restrict: 'E',
      controller: ['$scope', '$element', '$attrs', '$location', '$rootScope', 'shUser', 'shShare', 'shNotifications',
        function ($scope, $element, $attrs, $location, $rootScope, shUser, shShare, shNotifications) {
          $scope.user = shUser;
          $scope.shShare = shShare;
          $scope.swiped = {};
          $scope.notifications = shNotifications;
          $scope.rootScope = $rootScope;
          $rootScope.notificationsFrameOpened = false;
          $scope.$watch("notifications.counter", function (newVal) {
            $scope.notificationsCounter = newVal;
          });

          $scope.$watch('notifications.items', function (newVal) {
            $scope.notificationItems = newVal;
          });
          $scope.getStatusDisplay = function (item) {
            var msg;
            switch (item.get('status')) {
              case globals.NOTIFICATION_STATUS_ENUM.IN_QUEUE:
                msg = "In queue";
                break;
              case globals.NOTIFICATION_STATUS_ENUM.READ:
                msg = "Read";
                break;
              case globals.NOTIFICATION_STATUS_ENUM.ACCEPTED:
                msg = "Agreed";
                break;
              case globals.NOTIFICATION_STATUS_ENUM.REJECTED:
                msg = "Disagreed";
                break;
            }
            return msg;
          };
          $scope.takeNotificationAction = function (item) {
            if (item.get('action') === globals.NOTIFICATION_ACTION_ENUM.INFO) {
              shNotifications.notificationRead(item);
            }
          };
          // Moves to SharedItem details page
          $scope.goToShare = function (notification) {
            $rootScope.notificationsFrameOpened = false;
            $location.path('/sharedItem/' + notification.get('sharedItem').id);
          };

          $scope.isTouchDevice = function () {
            console.log(111);
            console.log(!!('ontouchstart' in window) || !!('onmsgesturechange' in window));
            return !!('ontouchstart' in window) // works on most browsers
              || !!('onmsgesturechange' in window); // works on ie10
          };

        }],
      scope: {
        item: '@'
      }
    };
  });
