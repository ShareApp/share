'use strict';

describe('Directive: fblogin', function () {
  beforeEach(module('shareApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<fblogin></fblogin>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the fblogin directive');
  }));
});
