angular.module('shareApp')
  .directive('datePickerFallback', ['$parse', function ($parse) {
    return function (scope, elm, attr) {
      if (!Modernizr.inputtypes.date) {
        elm.dateEntry({dateFormat: 'ymd-'});
      }
    };
  }]);
