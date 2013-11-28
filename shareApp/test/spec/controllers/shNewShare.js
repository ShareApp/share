'use strict';

describe('Controller: ShNewShareCtrl', function () {

  // load the controller's module
  beforeEach(module('shareApp'));

  var ShNewShareCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ShNewShareCtrl = $controller('ShNewShareCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
