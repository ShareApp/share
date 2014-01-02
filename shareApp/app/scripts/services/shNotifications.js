/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc service
 * @name shNotifications
 *
 * @description
 * Service for managing notifications. It allows to receive new notifications and send confirmations.
 */

var shNotifications = angular.module('shareApp')
  .service('shNotifications', function shNotifications($rootScope, $q, shUser, $translate, $interpolate) {
    var notificationService = {
      /**
       * @ngdoc property
       * @name shNotifications#counter
       * @propertyOf shNotifications
       * @returns {number} number
       *
       * @description
       * Awaiting notification counter
       */
      counter: 0,
      /**
       * @ngdoc property
       * @name shNotifications#saveInProgress
       * @propertyOf shNotifications
       * @returns {boolean} boolean
       *
       * @description
       * Flag which informs if Parse communication is in progress
       */
      saveInProgress: false,
      /**
       * @ngdoc method
       * @name shNotifications#retrieveNotifications
       * @methodOf shNotifications
       *
       * @description
       * Retrieves notifications and its counter. After applies it to appropriate variables in service.
       * Notifications are divided to
       */
      retrieveNotifications: function (loadNext) {
        loadNext = typeof loadNext !== 'undefined' ? loadNext : false;
        var promise = new Parse.Promise();
        if (notificationService.isLocked()) {
          promise.resolve();
          return promise;
        }
        notificationService.setLock();
        var Notification = Parse.Object.extend('Notification'),
          confirmationNotificationQ = new (PPO.getQueryClass())(Notification),
          actionNotificationQ = new (PPO.getQueryClass())(Notification),
          lastUpdateDate;
        confirmationNotificationQ.equalTo('status', globals.NOTIFICATION_STATUS_ENUM.IN_QUEUE);
        actionNotificationQ.equalTo('status', globals.NOTIFICATION_STATUS_ENUM.READ);
        actionNotificationQ.equalTo('action', globals.NOTIFICATION_ACTION_ENUM.CONFIRM);
        var query = (PPO.getQueryClass()).or(confirmationNotificationQ, actionNotificationQ);
        query.equalTo('targetUser', shUser.currentUser);
        query.descending('updatedAt');
        if (loadNext === true) {
          if (notificationService.items && notificationService.items.length > 0) {
            lastUpdateDate = notificationService.items[0].updatedAt;
            query.greaterThan('updatedAt', lastUpdateDate);
          }
        }

        query.include(["sharedItem", "sharedItem.fromUser", "sharedItem.toUser"]);

        query.find().then(function (results) {
          results = results || [];
          if (notificationService.items) {
            // update only status if item is already in notifications
            var i, j;
            for (i = 0; i < notificationService.items.length; i = i + 1) {
              for (j = 0; j < results.length; j = j + 1) {
                if (notificationService.items[i].id === results[j].id) {
                  notificationService.items[i].set('status', results[j].get('status'));
                  results = results.splice(j, 1);
                }
              }
            }
          }
          safeApply($rootScope, function () {
            if (loadNext === true) {
              notificationService.items = results.concat(notificationService.items);
            } else {
              notificationService.items = results;
            }
          });

          query = (PPO.getQueryClass()).or(confirmationNotificationQ, actionNotificationQ);
          query.equalTo('targetUser', shUser.currentUser);
          query.equalTo('status', globals.NOTIFICATION_STATUS_ENUM.IN_QUEUE);
          query.count().then(function (counter) {
            safeApply($rootScope, function () {
              notificationService.counter = counter;
              notificationService.unsetLock();
              promise.resolve();
            });
          });
        });
        return promise;
      },
      /**
       * @ngdoc method
       * @name shNotifications#notificationRead
       * @methodOf shNotifications
       *
       * @description
       * Marks notification as read and changes counter
       * @param {Notification} notification Notification
       */
      notificationRead: function (notification) {
        var promise = new Parse.Promise();
        notificationService.setLock();
        if (notification.get('status') === globals.NOTIFICATION_STATUS_ENUM.IN_QUEUE) {
          notification.set('status', globals.NOTIFICATION_STATUS_ENUM.READ);
          notificationService.counter -= 1;
        } else if (notification.get('status') === globals.NOTIFICATION_STATUS_ENUM.READ) {
          notification.set('status', globals.NOTIFICATION_STATUS_ENUM.IN_QUEUE);
          notificationService.counter += 1;
        }
        PPO.SaveObject(notification, null, {success: function (newItem) {
          notificationService.items.splice(notificationService.items.indexOf(notification), 1);
          notificationService.unsetLock();
          promise.resolve();
        }});
        return promise;
      },
      /**
       * @ngdoc method
       * @name shNotifications#notificationAgree
       * @methodOf shNotifications
       *
       * @description
       * Marks notification as agreed and read. Main workflow is triggered by this method, but
       * implemented in server-side code.
       * See: {@link Cloud.notifications Cloud.notifications}.
       *
       * @param {Notification} notification Notification
       */
      notificationAgree: function (notification) {
        var promise = new Parse.Promise();
        notificationService.setLock();
        var decreaseCounter = (notification.get('status') === globals.NOTIFICATION_STATUS_ENUM.IN_QUEUE);
        notification.set('status', globals.NOTIFICATION_STATUS_ENUM.ACCEPTED);
        PPO.SaveObject(notification, null, {success: function (newItem) {
          notificationService.items.splice(notificationService.items.indexOf(notification), 1);
          notificationService.unsetLock();
          promise.resolve();
        }, error:function(e){
          console.log(e);
        }});
        if (decreaseCounter) {
          notificationService.counter -= 1;
        }
        return promise;
      },
      /**
       * @ngdoc method
       * @name shNotifications#notificationDisagree
       * @methodOf shNotifications
       *
       * @description
       * Marks notification as disagreed and read.
       * See: {@link Cloud.notifications Cloud.notifications}.
       * @param {Notification} notification Notification
       */
      notificationDisagree: function (notification) {
        var promise = new Parse.Promise();
        notificationService.setLock();
        var decreaseCounter = (notification.get('status') === globals.NOTIFICATION_STATUS_ENUM.IN_QUEUE);
        notification.set('status', globals.NOTIFICATION_STATUS_ENUM.REJECTED);
        PPO.SaveObject(notification, null, {success: function (newItem) {
          notificationService.items.splice(notificationService.items.indexOf(notification), 1);
          notificationService.unsetLock();
          promise.resolve();
        }});
        if (decreaseCounter) {
          notificationService.counter -= 1;
        }
        return promise;
      },
      /**
       * @ngdoc method
       * @name shNotifications#confirmAll
       * @methodOf shNotifications
       *
       * @description
       * Marks all notification as agreed and read.
       * See: {@link Cloud.notifications Cloud.notifications}.
       */
      confirmAll: function (notifications) {
        var promises = [];
        notifications.forEach(function(item){
          if (item.get('action') === globals.NOTIFICATION_ACTION_ENUM.CONFIRM) {
            promises.push(notificationService.notificationAgree(item));
          } else {
            promises.push(notificationService.notificationRead(item));
          }
        });
        return Parse.Promise.when(promises);
      },
      /**
       * @ngdoc method
       * @name shNotifications#notificationIsAction
       * @methodOf shNotifications
       *
       * @description
       * Checks if notification is waiting for an action from user like taking decision
       * @param {Notification} notification Notification
       * @returns {boolean} Is in action
       */
      notificationIsAction: function (notification) {
        return notification.get('action') === globals.NOTIFICATION_ACTION_ENUM.CONFIRM ||
          (notification.get('status') === globals.NOTIFICATION_STATUS_ENUM.IN_QUEUE &&
            notification.get('status') === globals.NOTIFICATION_STATUS_ENUM.READ);
      },
      /**
       * @ngdoc method
       * @name shNotifications#notificationIsInQueue
       * @methodOf shNotifications
       *
       * @description
       * Checks if notification is unread
       * @param {Notification} notification Notification
       * @returns {boolean} is in queue
       */
      notificationIsInQueue: function (notification) {
        return notification.get('status') === globals.NOTIFICATION_STATUS_ENUM.IN_QUEUE;
      },
      /**
       * @ngdoc method
       * @name shNotifications#notificationRead
       * @methodOf shNotifications
       *
       * @description
       * Creates label which describes related sharedItem.
       * @param {Notification} notification Notification
       * @returns {string} verbose label
       */
      verboseNotification: function (notification) {
        if (notification.get('sharedItem') === undefined) {
          return;
        }
        // FIXME: this method is buggy when user is using language different than english
        var sharedItem = notification.get('sharedItem'),
          fromUser = sharedItem.get('fromUser').id === shUser.currentUser.id ? "you" : sharedItem.get('fromUser').get('firstName'),
          toUser = sharedItem.get('toUser').id === shUser.currentUser.id ? "you" : sharedItem.get('toUser').get('firstName'),
          thing = sharedItem.get('text'),
          msg = "";
        fromUser = '<span class="friend-name">' + fromUser + '</span>';
        toUser = '<span class="friend-name">' + toUser + '</span>';
        thing = '<span class="thing">' + thing + '</span>';

        switch (notification.get('sharedState')) {
        case globals.SHARE_STATE_ENUM.CREATED:
          msg = $translate("{{ fromUser }} shared with {{ toUser }} {{ thing }}, right?", {
            fromUser: fromUser,
            toUser: toUser,
            thing: thing
          });
          break;
        case globals.SHARE_STATE_ENUM.CONFIRMED:
          msg = $translate("{{ toUser }} shared with {{ fromUser }} {{ thing }}", {
            fromUser: fromUser,
            toUser: toUser,
            thing: thing
          });
          break;
        case globals.SHARE_STATE_ENUM.REJECTED:
          msg = $translate("{{ toUser }} rejected that {{ fromUser }} shared {{ thing }}", {
            fromUser: fromUser,
            toUser: toUser,
            thing: thing
          });
          break;
        case globals.SHARE_STATE_ENUM.RETURNED_NOT_CONFIRMED:
          msg = $translate("{{ fromUser }} ask {{ toUser }} about returning {{ thing }}", {
            fromUser: fromUser,
            toUser: toUser,
            thing: thing
          });
          break;
        case globals.SHARE_STATE_ENUM.RETURNED:
          msg = $translate("{{ toUser }} returned {{ fromUser }} {{ thing }}", {
            fromUser: fromUser,
            toUser: toUser,
            thing: thing
          });
          break;
        }
        // FIXME: little hack for variable replacement in angular-translate's keys
        msg = $interpolate(msg)({
          fromUser: fromUser,
          toUser: toUser,
          thing: thing
        });
        return msg;
      },
      setLock: function () {
        notificationService.saveInProgress = true;
      },
      unsetLock: function () {
        notificationService.saveInProgress = false;
      },
      isLocked: function () {
        return notificationService.saveInProgress;
      }
    };

    // retrieve first notifications
    notificationService.retrieveNotifications(false);
    // run notification ticker for every 5 seconds
    setInterval(function () {
      if (notificationService.isLocked() === false) {
        notificationService.retrieveNotifications(true);
      }
    }, 5000);
    return notificationService;
  });

shNotifications.$inject = ['$rootScope', '$q', 'shUser', '$translate', '$interpolate'];