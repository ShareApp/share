'use strict';

describe('Directive: fbusername', function () {
  beforeEach(module('shareApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<fbusername></fbusername>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the fbusername directive');
  }));
});
