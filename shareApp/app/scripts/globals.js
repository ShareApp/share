/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
var globals = {
  SHARE_STATE_ENUM: {
    CREATED: 0,
    CONFIRMED: 1,
    RETURNED: 2,
    RETURNED_NOT_CONFIRMED: 3,
    REJECTED: 4
  },
  SHARE_TYPE_ENUM: {
    TIME: 0,
    THING: 1,
    PROMISE: 2
  },
  SHARE_DIRECTION_ENUM: {
    TO_ME: 0,
    TO_FRIEND: 1
  },
  NOTIFICATION_ACTION_ENUM: {
    INFO: 0,
    CONFIRM: 1
  },
  NOTIFICATION_STATUS_ENUM: {
    IN_QUEUE: 1,
    READ: 2,
    ACCEPTED: 3,
    REJECTED: 4
  }
};

if (typeof exports !== 'undefined') {
  exports.globals = globals;
}