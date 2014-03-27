/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc filter
 * @name parseusersorter
 *
 * @description
 * Angular filter which sort users by three parameters: frequent, alphabetically and recent
 */
angular.module('shareApp')
  .filter('parseusersorter', ['shUser', 'shSync', function (shUser, shSync) {
    return function (data, query) {
      var users = data.slice();
      // we can share to fakeUser only when online (need to save user after selecting it)
      users = users.filter(function(u){
        return u.get('fakeUser') !== true || shSync.isOnline;
      });
      if(query === "frequent" || query === "recent") {
        users = users.filter(function(u){
          return  (u.id in shUser.friendsShares);
        });
      }
      if (query === "frequent") {
        users.sort(function (a, b) {
          return b.get('sharesCounter') - a.get('sharesCounter');
        });
      } else if (query === "alphabetically") {
        users.sort(function (a, b) {
          if(a.get('name') < b.get('name')) {
            return -1;
          } else {
            return 1;
          }
        });
      } else if (query === "recent") {
        users.sort(function (a, b) {
          if (shUser.friendsShares[a.id] !== undefined && shUser.friendsShares[b.id] !== undefined &&
            shUser.friendsShares[a.id]['items'] !== undefined && shUser.friendsShares[b.id]['items'] !== undefined &&
            shUser.friendsShares[a.id]['items'].length > 0 && shUser.friendsShares[b.id]['items'].length > 0
            ) {
            var c1 = shUser.friendsShares[a.id]['items'][0].updatedAt;
            var c2 = shUser.friendsShares[b.id]['items'][0].updatedAt;
            return c1 < c2 ? 1 : c1 > c2 ? -1 : 0;
          } else if (shUser.friendsShares[a.id] !== undefined && shUser.friendsShares[a.id]['items'] !== undefined && shUser.friendsShares[a.id]['items'].length > 0) {
            return -1;
          } else if (shUser.friendsShares[b.id] !== undefined && shUser.friendsShares[b.id]['items'] !== undefined && shUser.friendsShares[b.id]['items'].length > 0) {
            return 1
          } else {
            return 0;
          }
        });
      }
      return users;
    };
  }]);