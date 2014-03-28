/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc filter
 * @name userFilterWithShares
 *
 * @description
 * Angular filter which filter users list to only these who current user have shares with
 */
angular.module('shareApp')
  .filter('userFilterWithShares', ['shUser', function (shUser) {
    return function (users) {
      var out = [], i;
      for (i = 0; i < users.length; i += 1) {
        if (users[i].id in shUser.friendsShares) {
          out.push(users[i]);
        }
      }
      return out;
    };
  }
  ]);