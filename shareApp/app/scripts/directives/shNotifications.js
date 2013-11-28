'use strict';

angular.module('shareApp')
  .directive('shNotifications', function () {
    return {
      templateUrl: "views/notifications.html",
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
          /**
           * Moves to SharedItem details page
           * @param notification
           */
          $scope.goToShare = function (notification) {
            $rootScope.notificationsFrameOpened = false;
            $location.path('/sharedItem/' + notification.get('sharedItem').id);
          };
        }],
      scope: {
        item: '@'
      }
    };
  });
