'use strict';

describe('Directive: FbProfilePicture', function () {
  beforeEach(module('shareApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<-fb-profile-picture></-fb-profile-picture>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the FbProfilePicture directive');
  }));
});
