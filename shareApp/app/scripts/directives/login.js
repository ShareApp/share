/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * Creates widget for login action.
 */
var fblogin = angular.module('shareApp')
  .directive('fblogin', function (shUser) {
    return {
      template: '<button><img src="img/fb.jpg"/></button>',
      restrict: 'E',
      link: function postLink(scope, element) {
        element.bind('click', function () {
          shUser.logIn();
        });
      }
    };
  });

fblogin.$inject = ['shUser'];