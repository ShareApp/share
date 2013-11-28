/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * Shows Image with User's Facebook Profile picture.
 */
angular.module('shareApp')
  .directive('fbProfilePicture', function () {
    return {
      template: '<div class="profile-picture-container"><img ondragstart="return false" ng-src="https://graph.facebook.com/{{ userId }}/picture?width=65&height=65"></div>',
      restrict: 'E',
      scope: {
        userId: '=',
        innerClass: '@'
      }
    };
  });
