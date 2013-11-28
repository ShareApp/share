'use strict';

angular.module('shareApp')
  .factory('shShare', function shShare($location, $window, $rootScope, shUser) {

    var getToday = function () {
      var now = new Date(),
        month = now.getMonth() >= 9 ? (now.getMonth() + 1) : "0" + (now.getMonth() + 1);
      return now.getFullYear() + '-' + month + '-' + now.getDate();
    };
    var myShare = {
      /**
       * Currently logged user
       */
      currentUser: shUser.currentUser,
      /**
       * User who is second participant in sharing
       * @type Parse.User
       */
      targetUser: null,
      /**
       * if it is public share (visible for all)
       * @type boolean
       */
      isPublic: false,
      /**
       * One choice from globals.SHARE_DIRECTION_ENUM
       */
      direction: 1,
      /**
       * One choice from globals.SHARE_TYPE_ENUM
       */
      type: null,
      /**
       * State of share.
       * One choice from globals.SHARE_STATE_ENUM
       */
      state: '',
      /**
       * Text content of share. It can contains also image.
       * @type string
       */
      text: '',
      /**
       * Amount of items in share.
       * @type number
       */
      amount: 1,
      /**
       * Date of share.
       * @type string
       */
      date: getToday(),
      /**
       * URL to share image.
       */
      img: null,
      /**
       * Sets default values when user wants add another Share
       */
      setDefaults: function () {
        myShare.direction = 1;
        myShare.text = '';
        myShare.amount = 1;
        myShare.isPublic = false;
        myShare.date = getToday();
        myShare.img = null;
        myShare.targetUser = null;
      },
      /**
       * Performs full action of create SharedItem. It's invoked after click save button.
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
       * It performs action of return share by invoking Parse.Cloud command
       * @param sharedItem
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
       * It performs action of demand return share by invoking Parse.Cloud command
       * @param sharedItem
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
       * Creates verbose version of sharedItem state
       * @see globals.SHARE_STATE_ENUM
       * @param state
       * @returns string
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
       * Creates verbose version of sharedItem type
       * @see globals.SHARE_TYPE_ENUM
       * @param type
       * @returns string
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
       * Upload photo to Parse
       */
      uploadPhoto: function (file) {
        var img = new PPO.File(file.name, file);
        $rootScope.$broadcast('progressBar.update', true);
        myShare.img = img;
        return img.save().then(function (obj) {
          $rootScope.$broadcast('progressBar.update', false);
          safeApply($rootScope);
        }, function (e) {
          console.log(e);
        });
      }};

    return myShare;
  });
