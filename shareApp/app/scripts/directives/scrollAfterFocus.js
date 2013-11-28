angular.module('shareApp')
  .directive('scrollAfterFocus', ["$window", function ($window) {
    return {
      link: function postLink(scope, elm, attr) {
        elm.on('focus', function() {
          angular.element("#container").scrollTop(angular.element(this).offset().top);
        });
      }
    };
  }]);
