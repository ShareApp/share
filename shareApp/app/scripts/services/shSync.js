/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc object
 * @name shSync
 *
 * @description
 * Service which taking care about running tasks after going offline or going online
 */


var shSync = angular.module('shareApp')
  .service('shSync', function shSync($rootScope, shUser) {

    var sync = this;

    this.isOnline = navigator.onLine;
    if(this.isOnline){
      $rootScope.$broadcast('progressBar.update', true);
      PPO.synchronize().then(function(){
        $rootScope.$broadcast('progressBar.update', false);
      });
    }

    window.addEventListener("offline", function () {
      safeApply($rootScope, function () {
        sync.isOnline = false;
      });
      shUser.fetchData();
      console.log("going offline");
    }, false);

    window.addEventListener("online", function () {
      safeApply($rootScope, function () {
        sync.isOnline = true;
      });
      shUser.fetchData();
      $rootScope.$broadcast('progressBar.update', true);
      PPO.synchronize().then(function(){
        $rootScope.$broadcast('progressBar.update', false);
      });

      console.log("going online");
    }, false);
  });

shSync.$inject = ['$rootScope', 'shUser'];