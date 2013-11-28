angular.module('shareApp')
  .directive('ellipsis', ['$parse', function ($parse) {
    return function (scope, elm, attr) {
      scope.$watch('ngBind', function () {
        elm.dotdotdot();
      });

    };
  }]);
