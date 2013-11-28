'use strict';

describe('Directive: logout', function () {
  beforeEach(module('shareApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<logout></logout>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the logout directive');
  }));
});
