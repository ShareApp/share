/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc object
 * @name MainCtrl
 *
 * @description
 * Angular controller which is run at the beginning. It makes miscellaneous work.
 */

var MainCtrl = angular.module('shareApp')
  .controller('MainCtrl', function ($scope, $cookies, $rootScope, $state, $location, $translate, shUser, shShare, shSync) {

    //Only logged users can use application.
    $scope.$watch(function () {
      return $location.path();
    }, function (newValue) {
      if (!shUser.loggedIn && newValue !== '/login') {
        safeApply($scope, function () {
          $location.path('/login').replace();
        });
      }
    });

    $rootScope.user = shUser;
    $scope.shShare = shShare;
    $scope.shSync = shSync;
    $scope.debug = window.debug;

    // Set available languages.
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
      },
      {
        name: 'italian',
        value: 'it_IT',
        abbr: "it"
      },
      {
        name: 'russian',
        value: 'ru_RU',
        abbr: "ru"
      },
      {
        name: 'turkish',
        value: 'tr_TR',
        abbr: "tr"
      },
      {
        name: 'spanish',
        value: 'es_ES',
        abbr: "es"
      }
    ];
    if (!$translate.uses()) {
      $translate.uses("en_EN");
    }
    $rootScope.currentLanguage = $translate.uses();

    // DEBUG ONLY
    $rootScope.isOnline = $cookies.isOnline !== "false";
    $rootScope.$watch("isOnline", function (val, prevVal) {
      navigator.amIOnline = val;
      $cookies.isOnline = Boolean(val).toString();
      if (prevVal !== val && val === true) {
        $rootScope.$broadcast('progressBar.update', true);
        PPO.synchronize().then(function () {
          $rootScope.$broadcast('progressBar.update', false);
        });
      }
    });

    // Watch for language changes.
    $rootScope.$watch('currentLanguage', function (newValue, oldValue) {
      if (newValue !== oldValue) {
        $rootScope.$broadcast('progressBar.update', true);
        $translate.uses(newValue).then(function () {
          $rootScope.$broadcast('progressBar.update', false);
        });
      }
    });

    // Progress bar listener.
    $scope.$on('progressBar.update', function (event, isLoading) {
      if (isLoading === true) {
        NProgress.start();
      } else {
        NProgress.done();
      }
    });

    // Events emit on every location change.
    $scope.$on('$locationChangeStart', function () {
      $scope.$broadcast('progressBar.update', true);
    });
    $scope.$on('$locationChangeSuccess', function () {
      $scope.$broadcast('progressBar.update', false);
      $rootScope.activePath = $location.path();
    });
    $rootScope.activePath = $location.path();

    /**
     * @ngdoc method
     * @name MainCtrl#fetchNewSharesIfTop
     * @methodOf MainCtrl
     *
     * @description
     * Function which is taking care about fetching newer  shares that retrieved previously
     */
    $scope.fetchNewSharesIfTop = function () {
      if (angular.element("#container").scrollTop() === 0) {
        shUser.fetchUserShares(false, true);
      }
    };
    /**
     * @ngdoc method
     * @name MainCtrl#fetchOlderSharesIfBottom
     * @methodOf MainCtrl
     *
     * @description
     * Function which is taking care about fetching older shares that retrieved previously
     */
    $scope.fetchOlderSharesIfBottom = function () {
      var currentScroll = angular.element("#container").scrollTop() + angular.element(window).height(),
        currentHeight = angular.element("#content-container").height() + angular.element("#header-container").height();
      if (currentScroll >= currentHeight) {
        shUser.fetchUserShares(true, false);
      }
    };
    // lazy loading for friends view
    $scope.visibleFriends = 10;
    $scope.loadMoreFriends = function () {
      var currentScroll = angular.element("#container").scrollTop() + angular.element(window).height(),
        currentHeight = angular.element("#content-container").height() + angular.element("#header-container").height();
      if (currentScroll >= currentHeight) {
        $scope.visibleFriends += 10;
      }
    };

  });

MainCtrl.$inject = ['$scope', '$cookies', '$rootScope', '$state', '$location', '$translate', 'shUser', 'shShare', 'shSync'];