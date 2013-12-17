/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc service
 * @name shShare
 *
 * @description
 * Factory which creates single Share❣. It allows to save it and perform actions.
 */

angular.module('shareApp')
  .factory('shShare', function shShare($location, $window, $rootScope, shUser) {
    var getToday = function () {
      var now = new Date(),
        month = now.getMonth() >= 9 ? (now.getMonth() + 1) : "0" + (now.getMonth() + 1),
        day = now.getDate() > 9 ? now.getDate() : "0" + now.getDate();
      return now.getFullYear() + '-' + month + '-' + day;
    };
    var myShare = {
      currentUser: shUser.currentUser,
      /**
       * @ngdoc property
       * @name shShare#targetUser
       * @propertyOf shShare
       * @returns {User} Parse.User
       *
       * @description
       * User who is second participant in sharing
       */
      targetUser: null,
      /**
       * @ngdoc property
       * @name shShare#isPublic
       * @propertyOf shShare
       * @returns {boolean} is public
       *
       * @description
       * if it is public share (visible for all)
       */
      isPublic: true,
      /**
       * @ngdoc property
       * @name shShare#direction
       * @propertyOf shShare
       *
       * @description
       * One choice from:
       *
       * TO_ME: 0,
       *
       * TO_FRIEND: 1.
       */
      direction: 1,
      /**
       * @ngdoc property
       * @name shShare#type
       * @propertyOf shShare
       *
       * @description
       * One choice from:
       *
       * TIME: 0,
       *
       * THING: 1,
       *
       * PROMISE: 2.
       */
      type: null,
      /**
       * @ngdoc property
       * @name shShare#state
       * @propertyOf shShare
       *
       * @description
       * State of share.
       * One choice from:
       *
       * CREATED: 0,
       *
       * CONFIRMED: 1,
       *
       * RETURNED: 2,
       *
       * RETURNED_NOT_CONFIRMED: 3,
       *
       * REJECTED: 4.
       */
      state: '',
      /**
       * @ngdoc property
       * @name shShare#text
       * @propertyOf shShare
       * @returns {string} Text
       *
       * @description
       * Text content of share.
       */
      text: '',
      /**
       * @ngdoc property
       * @name shShare#amount
       * @propertyOf shShare
       * @returns {number} amount
       *
       * @description
       * Amount of items in share.
       */
      amount: 1,
      /**
       * @ngdoc property
       * @name shShare#date
       * @propertyOf shShare
       * @returns {date} date
       *
       * @description
       * Date of share.
       */
      date: getToday(),
      /**
       * @ngdoc property
       * @name shShare#img
       * @propertyOf shShare
       * @returns {string} img URL
       *
       * @description
       * URL to share image.
       */
      img: null,
      /**
       * @ngdoc method
       * @name shShare#setDefaults
       * @methodOf shShare
       *
       * @description
       * Sets default values when user wants add another Share
       */
      setDefaults: function () {
        myShare.direction = 1;
        myShare.text = '';
        myShare.amount = 1;
        myShare.isPublic = true;
        myShare.date = getToday();
        myShare.img = null;
        myShare.targetUser = null;
      },
      /**
       * @ngdoc method
       * @name shShare#saveShare
       * @methodOf shShare
       *
       * @description
       * Performs full action of create SharedItem. It's invoked after click save button.
       *
       * @param {Boolean} postOnFB if perform posting on FB
       */
      saveShare: function (postOnFB) {
        var SharedItem = Parse.Object.extend('SharedItem'),
          sharedItem = new SharedItem(),
          acl = new Parse.ACL();

        $rootScope.$broadcast('progressBar.update', true);

        sharedItem.set('text', myShare.text);
        sharedItem.set('img', myShare.img);
        sharedItem.set('type', myShare.type);
        sharedItem.set('amount', myShare.amount.toString());
        sharedItem.set('date', myShare.date);
        sharedItem.set('isPublic', myShare.isPublic);
        // set ACL only if share is not public
        if (myShare.isPublic === false) {
          acl.setReadAccess(myShare.currentUser, true);
          acl.setReadAccess(myShare.targetUser, true);
          sharedItem.setACL(acl);
        }

        if (myShare.direction === globals.SHARE_DIRECTION_ENUM.TO_FRIEND) {
          // confirmation required
          sharedItem.set('fromUser', myShare.currentUser);
          sharedItem.set('toUser', myShare.targetUser);
          sharedItem.set('state', globals.SHARE_STATE_ENUM.CREATED);
        } else {
          // confirmation not required
          sharedItem.set('fromUser', myShare.targetUser);
          sharedItem.set('toUser', myShare.currentUser);
          sharedItem.set('state', globals.SHARE_STATE_ENUM.CONFIRMED);
        }

        PPO.SaveObject(sharedItem, null, {
          success: function (sharedItem) {
            console.log('New object created with objectId: ' + sharedItem.id);
            shUser.fetchUserShares(false, true);
            var caption;
            if (myShare.direction === globals.SHARE_DIRECTION_ENUM.TO_FRIEND) {
              caption = "I've just shared you " + sharedItem.get('text');
            } else {
              caption = "You've just shared me " + sharedItem.get('text');
            }
            var callback = function () {
              $rootScope.$broadcast('progressBar.update', false);
              $location.path('');
              shUser.fetchFriends();
            };
            if (postOnFB === true) {
              FB.ui({
                method: 'feed',
                link: 'http://' + $window.location.host + '/#/sharedItem/' + sharedItem.id,
                to: myShare.targetUser.get('facebookid'),
                picture: (sharedItem.get('img') === null) ? "" : sharedItem.get('img').urlOrData(),
                name: caption,
                description: sharedItem.get('text'),
                caption: "Click to redirect to Share!"
              }, callback);
            } else {
              callback();
            }
          },
          error: function (sharedItem, error) {
            console.log('Failed to create new object, with error code: ' + error.description);
          }
        });
      },
      /**
       * @ngdoc method
       * @name shShare#returnShare
       * @methodOf shShare
       *
       * @description
       * It performs action of return share by invoking Parse.Cloud command
       * @param {sharedItem} sharedItem sharedItem object
       */
      returnShare: function (sharedItem) {
        $rootScope.$broadcast('progressBar.update', true);
        PPO.RunModifyCloud("returnShare", {id: sharedItem.id}, {success: function (result) {
          $rootScope.$broadcast('progressBar.update', false);
        }, error: function (error) {
          console.log("error " + error);
          $rootScope.$broadcast('progressBar.update', false);
        }});
      },
      /**
       * @ngdoc method
       * @name shShare#demandReturnShare
       * @methodOf shShare
       *
       * @description
       * It performs action of demand return share by invoking Parse.Cloud command
       * @param {sharedItem} sharedItem sharedItem object
       */
      demandReturnShare: function (sharedItem) {
        $rootScope.$broadcast('progressBar.update', true);
        PPO.RunModifyCloud("returnShare", {id: sharedItem.id}, {success: function (result) {
          $rootScope.$broadcast('progressBar.update', false);
        }, error: function (error) {
          console.log("error " + error);
          $rootScope.$broadcast('progressBar.update', false);
        }});
      },
      /**
       * @ngdoc method
       * @name shShare#getStateDisplay
       * @methodOf shShare
       *
       * @description
       * Creates verbose version of sharedItem state
       * See: {@link shShare#state state}.
       * @param {string} state state
       */
      getStateDisplay: function (state) {
        var msg;
        switch (state) {
        case globals.SHARE_STATE_ENUM.CREATED:
          msg = "Created";
          break;
        case globals.SHARE_STATE_ENUM.CONFIRMED:
          msg = "Confirmed";
          break;
        case globals.SHARE_STATE_ENUM.RETURNED:
          msg = "Returned";
        case globals.SHARE_STATE_ENUM.RETURNED_NOT_CONFIRMED:
          msg = "Returned but not confirmed";
          break;
        case globals.SHARE_STATE_ENUM.REJECTED:
          msg = "Rejected";
          break;
        default:
          msg = state + "aaa";
          break;
        }
        return msg;
      },
      /**
       * @ngdoc method
       * @name shShare#getTypeDisplay
       * @methodOf shShare
       *
       * @description
       * Creates verbose version of sharedItem type
       * See: {@link shShare#type type}.
       * @param {string} type type
       */
      getTypeDisplay: function (type) {
        var msg;
        switch (type) {
        case globals.SHARE_TYPE_ENUM.TIME:
          msg = "time";
          break;
        case globals.SHARE_TYPE_ENUM.THING:
          msg = "thing";
          break;
        case globals.SHARE_TYPE_ENUM.PROMISE:
          msg = "promise";
          break;
        }
        return msg;
      },
      /**
       * @ngdoc method
       * @name shShare#uploadPhoto
       * @methodOf shShare
       *
       * @description
       * Upload photo to Parse
       * @param {Parse.File} file Parse.File object
       */
      uploadPhoto: function (file) {
        var img = new PPO.File(file.name, file);
        myShare.img = img;
        safeApply($rootScope);
        return img.save().then(function (obj) {
          safeApply($rootScope);
        }, function (e) {
          console.log(e);
        });
      }};

    return myShare;
  });
