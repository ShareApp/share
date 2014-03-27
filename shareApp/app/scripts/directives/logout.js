/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc directive
 * @name logout
 *
 * @description
 * Angular directive which creates widget for logout action.
 */
var logout = angular.module('shareApp')
  .directive('logout', function ($window, shUser, $translate) {
    return {
      template: '<a href="#"><i class="logout-ico"></i><span class="text">' + $translate('Logout') + '</span></a>',
      restrict: 'E',
      link: function postLink(scope, element) {
        element.bind('click', function (e) {
          e.preventDefault();
          if ($window.confirm('Are you sure?')) {
            shUser.logOut();
          }
          return false;
        });
      }
    };
  });

logout.$inject = ['$window', 'shUser', '$translate'];