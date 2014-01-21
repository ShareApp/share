/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc filter
 * @name userfilterwithshares
 *
 * @description
 * Filter user list to only these user have shares with
 */
angular.module('shareApp')
  .filter('userfilterwithshares', ['shUser', function (shUser) {
    return function (users) {
      var out = [], i;
      for (i = 0; i < users.length; i += 1) {
        if (users[i].id in shUser.friendsShares && shUser.friendsShares[users[i].id].items.length != 0) {
          out.push(users[i]);
        }
      }
      return out;
    };
  }
  ]);