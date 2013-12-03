'use strict';

describe('Directive: langSwitcher', function () {
  beforeEach(module('shareApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<lang-switcher></lang-switcher>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the langSwitcher directive');
  }));
});
