/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

var ShSettingsCtrl = angular.module('shareApp')
  .controller('ShSettingsCtrl', function ($scope, $state, $location, $rootScope, $translate, shUser) {
    var saveCallback = function () {
      $rootScope.$broadcast('progressBar.update', false);
    };

    $scope.notifications = shUser.currentUser.get('notifications');

    $scope.update = function (notifications) {
      shUser.currentUser.set('notifications', notifications);
      $rootScope.$broadcast('progressBar.update', true);
      PPO.SaveObject(shUser.currentUser.save()).then(saveCallback, saveCallback);
    };
  });


ShSettingsCtrl.$inject = ['$scope', '$state', '$location', '$rootScope', '$translate', 'shUser'];