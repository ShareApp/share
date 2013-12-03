/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

var MainCtrl = angular.module('shareApp')
  .controller('MainCtrl', function ($scope, $cookies, $rootScope, $state, $location, $translate, shUser, shShare, shSync) {

    /**
     * Only logged users can use application.
     */
    $scope.$watch(function () {
      return $location.path();
    }, function (newValue) {
      if (!shUser.loggedIn && newValue !== '/login') {
        safeApply($scope, function(){
          $location.path('/login').replace();
        });
      }
    });

    $rootScope.user = shUser;
    $scope.shShare = shShare;
    $scope.shSync = shSync;

    /**
     * Set available languages.
     * @type {Array}
     */
    $rootScope.languages = [
      {
        name: 'polski',
        value: 'pl_PL',
        abbr: "pl"
      },
      {
        name: 'angielski',
        value: 'en_EN',
        abbr: "en"
      },
      {
        name: 'japoński',
        value: 'ja_JP',
        abbr: "jp"
      }
    ];
    if (!$translate.uses()) {
      $translate.uses("en_EN");
    }
    $rootScope.currentLanguage = $translate.uses();

    // DEBUG ONLY
    $rootScope.isOnline = $cookies.isOnline !== "false";
    $rootScope.$watch("isOnline", function(val, prevVal){
      navigator.amIOnline = val;
      $cookies.isOnline = Boolean(val).toString();
      if(prevVal !== val && val === true) {
        $rootScope.$broadcast('progressBar.update', true);
        PPO.synchronize().then(function(){
          $rootScope.$broadcast('progressBar.update', false);
        });
      }
    });

    /**
     * Watch for language changes.
     */
    $rootScope.$watch('currentLanguage', function (newValue, oldValue) {
      if (newValue !== oldValue) {
        $rootScope.$broadcast('progressBar.update', true);
        $translate.uses(newValue).then(function () {
          $rootScope.$broadcast('progressBar.update', false);
        });
      }
    });

    /**
     * Progress bar  listener.
     */
    $scope.$on('progressBar.update', function (event, isLoading) {
      if (isLoading === true) {
        NProgress.start();
      } else {
        NProgress.done();
      }
    });

    /**
     * Events emit on every location change.
     */
    $scope.$on('$locationChangeStart', function () {
      $scope.$broadcast('progressBar.update', true);
    });
    $scope.$on('$locationChangeSuccess', function () {
      $scope.$broadcast('progressBar.update', false);
      $rootScope.activePath = $location.path();
    });
    $rootScope.activePath = $location.path();

    /**
     * Functions which are taking care about fetching newer and older shares that retrieved previously
     */
    $scope.fetchNewSharesIfTop = function () {
      if (angular.element("#container").scrollTop() === 0) {
        shUser.fetchUserShares(false, true);
      }
    };
    $scope.fetchOlderSharesIfBottom = function () {
      var currentScroll = angular.element("#container").scrollTop() + angular.element(window).height(),
        currentHeight = angular.element("#content-container").height() + angular.element("#header-container").height();
      if (currentScroll >= currentHeight) {
        shUser.fetchUserShares(true, false);
      }
    };

  });

MainCtrl.$inject = ['$scope', '$cookies', '$rootScope', '$state', '$location', '$translate', 'shUser', 'shShare', 'shSync'];