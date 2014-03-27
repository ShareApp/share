/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc filter
 * @name parseuserfilter
 *
 * @description
 * Angular filter which filters users based on given filterQuery
 */
angular.module('shareApp')
  .filter('parseuserfilter', function () {
    return function (users, filterQuery, sorting) {
      if (filterQuery !== undefined) {
        filterQuery = filterQuery.toLowerCase();
        var out = [], i;
        for (i = 0; i < users.length; i += 1) {
          if (users[i].attributes.name.toLowerCase().indexOf(filterQuery) !== -1) {
            out.push(users[i]);
          }
        }
        users = out;
      }
      if (sorting == "frequent") {
        users = users.slice(0, 10)
      }
      return users;
    }
  })
;