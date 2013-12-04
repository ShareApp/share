/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';


/**
 * @ngdoc directive
 * @name fbComments
 *
 * @description
 * Shows Facebook comments widget to current URL
 */
angular.module('shareApp')
  .directive('fbComments', ['$location', 'shSync', function ($location, shSync) {
    return {
      template: '<div class="fb-comments" data-href="' + window.location.protocol + '//' + window.location.host + $location.path() + '" data-numposts="5" data-colorscheme="light"></div>',
      restrict: 'E',
      scope: {
        user: '=',
        selectFriend: '='
      },
      link: function postLink(scope, element, attrs, controller) {
        if(shSync.isOnline) {
          FB.XFBML.parse(element.get(0));
        }
      }
    };
  }]);
