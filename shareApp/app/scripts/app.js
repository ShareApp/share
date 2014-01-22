/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * Share❣ is application for making sharing items/time/promises easy...
 */
var app = angular.module('shareApp', ['pascalprecht.translate', 'ngCookies', 'ui.router', 'ngTouch', 'ngSanitize'])
  .config(function ($stateProvider, $urlRouterProvider, $translateProvider) {

    $stateProvider
      .state('index', {
        url: '/',
        views: {
          'header': {
            templateUrl: '/views/header.html',
            controller: 'MainCtrl'
          },
          'main': {
            templateUrl: '/views/sharesList.html',
            controller: 'MainCtrl'
          },
          'footer': {
            templateUrl: '/views/newShareButtons.html'
          }
        }
      })
      .state('friends', {
        url: '/friends',
        views: {
          'header': {
            templateUrl: '/views/header.html',
            controller: 'MainCtrl'
          },
          'main': {
            templateUrl: '/views/friends.html',
            controller: 'MainCtrl'
          },
          'footer': {
            templateUrl: '/views/newShareButtons.html'
          }
        }
      })
      .state('friendDetails', {
        url: '/friends/:userId',
        views: {
          'header': {
            templateUrl: '/views/header.html',
            controller: 'MainCtrl'
          },
          'main': {
            templateUrl: '/views/friendDetails.html',
            controller: 'FriendDetailsCtrl'
          },
          'footer': {
            templateUrl: '/views/newShareButtons.html'
          }
        }
      })
      .state('shareSelectFriend', {
        url: '/share/:type',
        views: {
          'header': {
            templateUrl: '/views/header.html',
            controller: 'MainCtrl'
          },
          'main': {
            templateUrl: '/views/newShareSelectFriend.html',
            controller: 'ShNewShareSelectFriendCtrl'
          }
        }
      })
      .state('share', {
        url: '/share/:targetId/:direction/:type',
        views: {
          'header': {
            templateUrl: '/views/header.html',
            controller: 'MainCtrl'
          },
          'main': {
            templateUrl: '/views/newShare.html',
            controller: 'ShNewShareCtrl'
          }
        }
      })
      .state('shardItemDetails', {
        url: '/sharedItem/:sharedItemId',
        views: {
          'header': {
            templateUrl: '/views/header.html',
            controller: 'MainCtrl'
          },
          'main': {
            templateUrl: '/views/shareDetails.html',
            controller: 'ShShareDetailsCtrl'
          },
          'footer': {
            templateUrl: '/views/newShareButtons.html'
          }
        }
      })
      .state('login', {
        url: '/login',
        views: {
          'main': {
            templateUrl: '/views/login.html',
            controller: 'MainCtrl'
          }
        }
      })
      .state('settings', {
        url: '/settings',
        views: {
          'header': {
            templateUrl: '/views/header.html',
            controller: 'MainCtrl'
          },
          'main': {
            templateUrl: '/views/settings.html',
            controller: 'ShSettingsCtrl'
          },
          'footer': {
            templateUrl: '/views/newShareButtons.html'
          }
        }
      });
    $urlRouterProvider.otherwise('/');

    $translateProvider.useStaticFilesLoader({
      prefix: '/i18n/lang_',
      suffix: '.js'
    });
    $translateProvider.useLocalStorage();
    // TODO(s3p4n): Uncomment for use. Temporary disabled due to a lot of warnings.
    // $translateProvider.useMissingTranslationHandlerLog();
  });


app.$inject = ['$stateProvider', '$urlRouterProvider', '$translateProvider'];


function initApp() {
  require(["settings.js", "moment"], function (settings) {
    window.FBappId = settings.FBappId;
    /**
     * Initialize Parse.com
     */
    Parse.initialize(settings.ParseApplicationId, settings.ParsejavaScriptKey);
    if (navigator.onLine === true) {
      /**
       * Initialize Facebook API
       */
      Parse.FacebookUtils.init({
        appId: window.FBappId,
        channelUrl: '//share-test.parseapp.com/channel.html',
        cookie: true,
        xfbml: true
      });
    }
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      angular.bootstrap(angular.element("body"), ['shareApp']);
    } else {
      document.addEventListener("DOMContentLoaded", function (event) {
        angular.bootstrap(angular.element("body"), ['shareApp']);
      });
    }
  });
}


if (window.applicationCache) {
    applicationCache.addEventListener('updateready', function() {
        if (confirm('An update is available. Reload now?')) {
            window.location.reload();
        }
    });
}

if (navigator.onLine === true) {
  window.fbAsyncInit = initApp;
} else {
  initApp();
}


function safeApply(scope, fn) {
  (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
}
