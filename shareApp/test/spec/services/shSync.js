'use strict';

describe('Service: shSync', function () {

  // load the service's module
  beforeEach(module('shareApp'));

  // instantiate service
  var shSync;
  beforeEach(inject(function (_shSync_) {
    shSync = _shSync_;
  }));

  it('should do something', function () {
    expect(!!shSync).toBe(true);
  });

});
