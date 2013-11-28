'use strict';

describe('Directive: fbFrindsSelect.js', function () {
  beforeEach(module('shareApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<fb-frinds-select.js></fb-frinds-select.js>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the fbFrindsSelect.js directive');
  }));
});
