/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc object
 * @name Cloud
 *
 * @description
 * List of CloudCode functions.
 */
require('cloud/app.js');
var globals = require('cloud/globals').globals;
var notifications = require('cloud/notifications');

/**
 * @ngdoc method
 * @name Cloud#userAfterSave
 * @methodOf Cloud
 *
 * @description
 * It rewrites fake users to real user after his signing up.
 */
Parse.Cloud.afterSave("_User", function (request) {
  var facebookId = request.object.get("facebookid"),
    userQuery = new Parse.Query('_User'),
    currentUser = request.object,
    i,
    relations;

  console.log('existed ' + request.object.existed());
  if (request.object.existed() || request.object.get('fakeUser')) {
    return;
  }

  relations = {
    SharedItem: ['fromUser', 'toUser'],
    Notification: ['targetUser']
  };

  userQuery.equalTo('facebookid', facebookId);
  userQuery.equalTo('fakeUser', true);
  userQuery.find({
    success: function (users) {
      var model, query, setCurrentUser, errorCallback, manageModel;

      setCurrentUser = function (field) {
        return function (items) {
          var i, itemsLength = items.length;
          for (i = 0; i < itemsLength; i += 1) {
            items[i].set(field, currentUser);
            items[i].save();
          }
        };
      };

      errorCallback = function (error) {
        console.error(error);
      };

      manageModel = function (model) {
        relations[model].forEach(function (field) {
          var successCallback = setCurrentUser(field);
          query = new Parse.Query(model);
          query.containedIn(field, users);
          query.find({
            success: successCallback,
            error: errorCallback
          });
        });
      };

      for (model in relations) {
        if (relations.hasOwnProperty(model)) {
          manageModel(model);
        }
      }

      Parse.Cloud.useMasterKey();
      users.forEach(function (user) {
        user.destroy({
          success: function (object) {
            console.log('removed user ' + object);
          },
          error: function (object, error) {
            console.error(error);
            console.error(object);
          }
        });
      });
      console.log('success');
      console.log(users);
    },
    error: function (error) {
      console.log('error');
      console.log(error);
    }
  });
});

Parse.Cloud.beforeSave("Notification", notifications.beforeNotificationSave);
Parse.Cloud.afterSave("SharedItem", notifications.afterSharedItemSave);
Parse.Cloud.beforeSave("SharedItem", notifications.beforeSharedItemSave);

/**
 * @ngdoc method
 * @name Cloud#returnShare
 * @methodOf Cloud
 *
 * @description
 * Performs action of returning share.
 */
Parse.Cloud.define("returnShare", function (request, response) {
  console.log("returning share ");
  var sharedItemId = request.params.id,
    query = new Parse.Query("SharedItem");
  query.equalTo("objectId", sharedItemId);
  function saveFun(item) {
    Parse.Cloud.useMasterKey();
    item.save({
      success: function () {
        response.success();
      },
      error: function () {
        response.error();
      }
    });
  }

  query.first({success: function (sharedItem) {
    console.log("sharedITem state " + sharedItem.get('state'));
    if (sharedItem.get('type') === globals.SHARE_TYPE_ENUM.THING &&
      sharedItem.get('state') === globals.SHARE_STATE_ENUM.CONFIRMED &&
      sharedItem.get('fromUser').id === request.user.id) {
      // if it is a thing and is only confirmed and action is invoked by giver return it
      console.log("returning");
      sharedItem.set('state', globals.SHARE_STATE_ENUM.RETURNED);
      saveFun(sharedItem);
    } else if (sharedItem.get('state') === globals.SHARE_STATE_ENUM.RETURNED_NOT_CONFIRMED) {
      console.log("returning");
      sharedItem.set('state', globals.SHARE_STATE_ENUM.RETURNED);
      saveFun(sharedItem);
    }
    response.success();
  },
    error: response.error
  });
});


/**
 * @ngdoc method
 * @name Cloud#demandReturnShare
 * @methodOf Cloud
 *
 * @description
 * Performs action of demand returning share.
 */
Parse.Cloud.define("demandReturnShare", function (request, response) {
  console.log("demand of returning share ");
  var sharedItemId = request.params.id,
    query = new Parse.Query("SharedItem");
  query.equalTo("objectId", sharedItemId);
  function saveFun(item) {
    Parse.Cloud.useMasterKey();
    item.save({
      success: function () {
        response.success();
      },
      error: function () {
        response.error();
      }
    });
  }

  query.first({success: function (sharedItem) {
    console.log("sharedITem state " + sharedItem.get('state'));
    if (sharedItem.get('state') === globals.SHARE_STATE_ENUM.CONFIRMED) {
      // demand return
      console.log("demanding return");
      sharedItem.set('state', globals.SHARE_STATE_ENUM.RETURNED_NOT_CONFIRMED);
      saveFun(sharedItem);
    }
    else if (sharedItem.get('state') === globals.SHARE_STATE_ENUM.RETURNED_NOT_CONFIRMED &&
      sharedItem.get('fromUser').id === request.user.id) {
      // refresh demand action
      console.log("refreshing notification");
      var query = new Parse.Query("Notification");
      query.equalTo('sharedItem', sharedItem);
      query.descending('createdAt');
      query.first({success: function (notification) {
        if (notification === undefined) {
          response.error();
        } else {
          notification.set('status', globals.NOTIFICATION_STATUS_ENUM.IN_QUEUE);
          saveFun(notification);
        }
      }, error: response.error});
    }
    response.success();
  },
    error: response.error
  });
});

/**
 * @ngdoc method
 * @name Cloud#getCommonShares
 * @methodOf Cloud
 *
 * @description
 * Gets Shares current user and friendsIds list in parameters.
 */
Parse.Cloud.define("getCommonShares", function (request, response) {
  var friendsQuery = new Parse.Query("_User"),
    sharedItemFromQuery,
    sharedItemToQuery,
    query,
    results = {};
  friendsQuery.containedIn('objectId', request.params.friendsIds);
  friendsQuery.find({
    success: function (friends) {
      var finished = 0;
      if (friends.length === 0) {
        response.success(friends);
      } else {
        friends.forEach(function (friend, idx) {
          sharedItemFromQuery = new Parse.Query("SharedItem");
          sharedItemToQuery = new Parse.Query("SharedItem");

          sharedItemFromQuery.equalTo('fromUser', request.user);
          sharedItemFromQuery.equalTo('toUser', friend);

          sharedItemToQuery.equalTo('fromUser', friend);
          sharedItemToQuery.equalTo('toUser', request.user);

          query = Parse.Query.or(sharedItemFromQuery, sharedItemToQuery);
          query.descending('updatedAt');
          query.limit(5);
          query.find({
            success: function (sharedItems) {
              if (sharedItems.length != 0) {
                results[friend.id] = {};
                results[friend.id]['items'] = sharedItems;
              }
              finished = finished + 1;
              if (finished === friends.length) {
                response.success(results);
              }
            },
            error: function (error) {
              console.error(error);
              response.error(error);
            }
          });
        });
      }
    },
    error: function (error) {
      console.error(error);
      response.error(error);
    }
  });
});

/**
 * @ngdoc method
 * @name Cloud#getFriends
 * @methodOf Cloud
 *
 * @description
 * Gets sorted friends list.
 */
Parse.Cloud.define("getFriends", function (request, response) {
  var friendsQuery = new Parse.Query("_User"),
    results = [],
    friendsFbIds = request.params.fbFriendsList;
  friendsQuery.containedIn('facebookid', friendsFbIds);
  friendsQuery.find({
    success: function (friends) {
      var finished = 0;
      if (friends.length === 0) {
        response.success(friends);
      } else {
        friends.forEach(function (friend, idx) {
          results[friend.id] = {};
          var sharedItemFromQuery = new Parse.Query("SharedItem");
          var sharedItemToQuery = new Parse.Query("SharedItem");

          sharedItemFromQuery.equalTo('fromUser', request.user);
          sharedItemFromQuery.equalTo('toUser', friend);

          sharedItemToQuery.equalTo('fromUser', friend);
          sharedItemToQuery.equalTo('toUser', request.user);

          var query = Parse.Query.or(sharedItemFromQuery, sharedItemToQuery);
          query.find({
            success: function (data) {
              // add total time
              var totalTime = 0;
              data.forEach(function (share) {
                if (share.get('hours')) {
                  totalTime += share.get('hours');
                }
                if (share.get('minutes')) {
                  totalTime += share.get('minutes') / 60;
                }
              });

              friends[idx].attributes.totalTime = totalTime;
              // there is no better way to attribute counter to object
              friends[idx].attributes.sharesCounter = data.length;
              finished = finished + 1;
              if (finished === friends.length) {
                friends.sort(function (a, b) {
                  return b.attributes.sharesCounter - a.attributes.sharesCounter;
                });
                response.success(friends);
              }
            },
            error: function (error) {
              console.error(error);
              response.error(error);
            }
          });
        });
      }
    }, error: function (e) {
      response.error();
    }});
});
