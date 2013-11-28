/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * Angular filter didn't manage objects' attributes, so we need custom filter to query users.
 */
angular.module('shareApp')
  .filter('parseuserfilter', function () {
    return function (users, query) {
      if (query === undefined) {
        return users;
      }
      query = query.toLowerCase();
      var out = [], i;
      for (i = 0; i < users.length; i += 1) {
        if (users[i].attributes.name.toLowerCase().indexOf(query) !== -1) {
          out.push(users[i]);
        }
      }
      return out;
    };
  });