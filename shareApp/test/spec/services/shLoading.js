'use strict';

describe('Service: shLoading', function () {

  // load the service's module
  beforeEach(module('shareApp'));

  // instantiate service
  var shLoading;
  beforeEach(inject(function (_shLoading_) {
    shLoading = _shLoading_;
  }));

  it('should do something', function () {
    expect(!!shLoading).toBe(true);
  });

});
