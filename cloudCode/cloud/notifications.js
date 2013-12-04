/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

var globals = require('cloud/globals').globals;

/**
 * Creates single notification for user who received shared item.
 * It's something like reminder about not confirmed incoming share..
 * @param sharedItem
 * @param saveFun generic method to save notification and return response.
 */
var onShareCreated = function (sharedItem, saveFun) {
  if (sharedItem.get('state') !== globals.SHARE_STATE_ENUM.CREATED) {
    throw "bad sharedItem state in create " + sharedItem.get('state');
  }

  var Notification = Parse.Object.extend('Notification'),
    notificationObjTo = new Notification();
  notificationObjTo.set('targetUser', sharedItem.get('toUser'));
  notificationObjTo.set('sharedItem', sharedItem);
  notificationObjTo.set('action', globals.NOTIFICATION_ACTION_ENUM.CONFIRM);
  notificationObjTo.set('sharedState', sharedItem.get('state'));
  saveFun([notificationObjTo]);
};

/**
 * Creates single notification for user who sent shared item.
 * It's information that recipient has confirmed share or add share.
 * @param sharedItem
 * @param saveFun generic method to save notification and return response.
 */
var onShareConfirmed = function (sharedItem, saveFun) {
  if (sharedItem.get('state') !== globals.SHARE_STATE_ENUM.CONFIRMED) {
    throw "bad sharedItem state in confirmed " + sharedItem.get('state');
  }
  var Notification = Parse.Object.extend('Notification'),
    notificationObjFrom = new Notification();
  notificationObjFrom.set('targetUser', sharedItem.get('fromUser'));
  notificationObjFrom.set('sharedItem', sharedItem);
  notificationObjFrom.set('action', globals.NOTIFICATION_ACTION_ENUM.INFO);
  notificationObjFrom.set('sharedState', sharedItem.get('state'));

  saveFun([notificationObjFrom]);
};

/**
 * Creates single notification for user who received shared item.
 * It's something like reminder about not confirmed return.
 * @param sharedItem
 * @param saveFun generic method to save notification and return response.
 */
var onShareReturnedRequest = function (sharedItem, saveFun) {
  if (sharedItem.get('state') !== globals.SHARE_STATE_ENUM.RETURNED_NOT_CONFIRMED) {
    throw "bad sharedItem state in request " + sharedItem.get('state');
  }
  var Notification = Parse.Object.extend('Notification'),
    notificationObjTo = new Notification();
  notificationObjTo.set('targetUser', sharedItem.get('toUser'));
  notificationObjTo.set('sharedItem', sharedItem);
  notificationObjTo.set('action', globals.NOTIFICATION_ACTION_ENUM.CONFIRM);
  notificationObjTo.set('sharedState', sharedItem.get('state'));
  saveFun([notificationObjTo]);
};

/**
 * Creates single notification for user who shared item. Notification inform about returning share.
 * @param sharedItem
 * @param saveFun generic method to save notification and return response.
 */
var onShareReturned = function (sharedItem, saveFun) {
  if (sharedItem.get('state') !== globals.SHARE_STATE_ENUM.RETURNED) {
    throw "bad sharedItem state in returned " + sharedItem.get('state');
  }
  var Notification = Parse.Object.extend('Notification'),
    notificationObjFrom = new Notification();
  notificationObjFrom.set('targetUser', sharedItem.get('fromUser'));
  notificationObjFrom.set('sharedItem', sharedItem);
  notificationObjFrom.set('action', globals.NOTIFICATION_ACTION_ENUM.INFO);
  notificationObjFrom.set('sharedState', sharedItem.get('state'));
  saveFun([notificationObjFrom]);
};

/**
 * Checks if notification status has changed. If yes that status of related sharedItem is changed.
 * In other words, this method accept or reject action on sharedItem which is either share or return.
 * @param request
 * @param response
 */
exports.beforeNotificationSave = function (request, response) {
  Parse.Cloud.useMasterKey();
  var newObj = request.object;
  if (newObj.dirty('status')) {
    var q = new Parse.Query("Notification");
    q.equalTo('objectId', newObj.id);
    q.first({
      success: function (oldObj) {
        if (oldObj === undefined) {
          response.success();
          return;
        }
        var newStatus = newObj.get('status'),
          prevStatus = oldObj.get('status');

        console.log("old status " + prevStatus);
        console.log("new status " + newStatus);
        if (newObj.get('action') === globals.NOTIFICATION_ACTION_ENUM.CONFIRM && (
          prevStatus === globals.NOTIFICATION_STATUS_ENUM.IN_QUEUE ||
            prevStatus === globals.NOTIFICATION_STATUS_ENUM.READ
          )) {
          // accepting or rejecting notification
          console.log("status is in action");
          if (newStatus === globals.NOTIFICATION_STATUS_ENUM.ACCEPTED) {
            newObj.get('sharedItem').fetch().then(function (sharedItem) {
              var sharedItemState = sharedItem.get('state');
              console.log("sharedItem state " + sharedItemState);
              if (sharedItemState === globals.SHARE_STATE_ENUM.CREATED) {
                console.log("status is CONFIRMED");
                sharedItem.set('state', globals.SHARE_STATE_ENUM.CONFIRMED);
                sharedItem.save();
                response.success();
              } else if (sharedItemState === globals.SHARE_STATE_ENUM.RETURNED_NOT_CONFIRMED) {
                console.log("status is returned ");
                sharedItem.set('state', globals.SHARE_STATE_ENUM.RETURNED);
                sharedItem.save();
                response.success();
              } else {
                console.log("bad sharedItem state (should be created or returned_not_confirmed");
                response.error();
              }
            });
          } else if (newStatus === globals.NOTIFICATION_STATUS_ENUM.REJECTED) {
            newObj.get('sharedItem').fetch().then(function (sharedItem) {
              console.log("status is rejected");
              sharedItem.set('state', globals.SHARE_STATE_ENUM.REJECTED);
              sharedItem.save();
              response.success();
            });
          } else {
            console.log("status is not decision");
            response.success();
          }
        } else {
          console.log("status does not does not need an action");
          response.success();
        }
      },
      error: function (error) {
        console.log(error);
        response.error(error);
      }
    });
  } else {
    console.log("status does not change");
    response.success();
  }
};

var Image = require("parse-image");

/**
 * Saves previous sharedItem state due to Parse bug that Parse.Object.changedAttributes doesn't work
 * properly in Parse.Cloud.afterSave method. Also this method scales image to 460px of width.
 * @param request
 * @param response
 */
exports.beforeSharedItemSave = function (request, response) {
  Parse.Cloud.useMasterKey();
  var obj = request.object;
  obj.set('stateChanged', obj.dirty('state'));

  if (!obj.get("img") || !obj.dirty("img")) {
    response.success();
    return;
  }
    Parse.Cloud.httpRequest({
      url: obj.get("img").url()

    }).then(function (response) {
        var image = new Image();
        return image.setData(response.buffer);

      }).then(function (image) {
        var width = Math.min(460, image.width());
        return image.scale({
          width: width,
          height:  width /  image.width() * image.height()
        });

      }).then(function (image) {
        return image.setFormat("JPEG");

      }).then(function (image) {
        return image.data();

      }).then(function (buffer) {
        var base64 = buffer.toString("base64");
        var img = obj.get('img');
        var cropped = new Parse.File(img.name(), { base64: base64 });
        return cropped.save();

      }).then(function(cropped) {
        obj.set("img", cropped);

      }).then(function (result) {
        response.success();
      }, function (error) {
        response.error(error);
      });
};

/**
 * Triggers proper function with 'onShare' prefix depends on sharedItem state.
 * This method is invoked after sharedItem save
 * @param request Parse.Cloud.AfterSaveRequest
 */
exports.afterSharedItemSave = function (request) {
  var newObj = request.object,
    newStatus = newObj.get('state');
  if (newObj.get('stateChanged') === true) {
    var saveFun = function saveFun(notificationObjs) {
      var i;
      for (i = 0; i < notificationObjs.length; i += 1) {
        notificationObjs[i].set('status', globals.NOTIFICATION_STATUS_ENUM.IN_QUEUE);
      }
      Parse.Cloud.useMasterKey();
      Parse.Object.saveAll(notificationObjs, function (list, error) {
        if (list) {
          console.log("notifications have successfully pushed in saveFun");
        } else {
          console.log("BIG ERROR");
          console.log(error);
        }
      });
    };
    if (newStatus === globals.SHARE_STATE_ENUM.CREATED) {
      onShareCreated(newObj, saveFun);
    } else if (newStatus === globals.SHARE_STATE_ENUM.CONFIRMED) {
      onShareConfirmed(newObj, saveFun);
    } else if (newStatus === globals.SHARE_STATE_ENUM.RETURNED) {
      onShareReturned(newObj, saveFun);
    } else if (newStatus === globals.SHARE_STATE_ENUM.RETURNED_NOT_CONFIRMED) {
      onShareReturnedRequest(newObj, saveFun);
    } else {
      console.log("newStatus is " + newStatus);
    }
  }
};