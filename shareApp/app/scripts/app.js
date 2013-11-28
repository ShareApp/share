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
            templateUrl: 'views/header.html',
            controller: 'MainCtrl'
          },
          'main': {
            templateUrl: 'views/sharesList.html',
            controller: 'MainCtrl'
          },
          'footer': {
            templateUrl: 'views/newShareButtons.html'
          }
        }
      })
      .state('awaiting', {
        url: '/awaiting',
        views: {
          'header': {
            templateUrl: 'views/header.html',
            controller: 'MainCtrl'
          },
          'main': {
            templateUrl: 'views/sharesListAwaiting.html',
            controller: 'MainCtrl'
          },
          'footer': {
            templateUrl: 'views/newShareButtons.html'
          }
        }
      })
      .state('friends', {
        url: '/friends',
        views: {
          'header': {
            templateUrl: 'views/header.html',
            controller: 'MainCtrl'
          },
          'main': {
            templateUrl: 'views/friends.html',
            controller: 'MainCtrl'
          },
          'footer': {
            templateUrl: 'views/newShareButtons.html'
          }
        }
      })
      .state('friendDetails', {
        url: '/friends/:userId',
        views: {
          'header': {
            templateUrl: 'views/header.html',
            controller: 'MainCtrl'
          },
          'main': {
            templateUrl: 'views/friendDetails.html',
            controller: 'FriendDetailsCtrl'
          },
          'footer': {
            templateUrl: 'views/newShareButtons.html'
          }
        }
      })
      .state('shareSelectFriend', {
        url: '/share/:type',
        views: {
          'header': {
            templateUrl: 'views/header.html',
            controller: 'MainCtrl'
          },
          'main': {
            templateUrl: 'views/newShareSelectFriend.html',
            controller: 'ShNewShareSelectFriendCtrl'
          }
        }
      })
      .state('share', {
        url: '/share/:targetId/:direction/:type',
        views: {
          'header': {
            templateUrl: 'views/header.html',
            controller: 'MainCtrl'
          },
          'main': {
            templateUrl: 'views/newShare.html',
            controller: 'ShNewShareCtrl'
          }
        }
      })
      .state('shardItemDetails', {
        url: '/sharedItem/:sharedItemId',
        views: {
          'header': {
            templateUrl: 'views/header.html',
            controller: 'MainCtrl'
          },
          'main': {
            templateUrl: 'views/shareDetails.html',
            controller: 'ShShareDetailsCtrl'
          },
          'footer': {
            templateUrl: 'views/newShareButtons.html'
          }
        }
      })
      .state('login', {
        url: '/login',
        views: {
          'main': {
            templateUrl: 'views/login.html',
            controller: 'MainCtrl'
          }
        }
      })
      .state('settings', {
        url: '/settings',
        views: {
          'header': {
            templateUrl: 'views/header.html',
            controller: 'MainCtrl'
          },
          'main': {
            templateUrl: 'views/settings.html',
            controller: 'ShSettingsCtrl'
          },
          'footer': {
            templateUrl: 'views/newShareButtons.html'
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


/**
 * Initialize Facebook API
 */
if (window.location.host === "share-test.parseapp.com") {
  window.FBappId = '222033201286057';
} else if (window.location.host === "share.hiddendata.co") {
  window.FBappId = '1474663289424777';
} else {
  window.FBappId = '142693092598273';
}
function initApp() {
  /**
   * Initialize Parse.com
   */
  if (window.location.host === "share-test.parseapp.com") {
    Parse.initialize('Gw23IXmDavrV4Upuu6vZgkaoTeIq6Hs6X4dj4HkX', '3APHHMcyM8v8SklL36bRY5d0Kz7YEkqv4gY1ObIf');
  } else if (window.location.host === "share.hiddendata.co") {
    Parse.initialize('p8HW0CZbx1xCKe8VPli2aAIvZEiwhuwZBY2sffOM', 'vVLGaNNzKFvgmzPdMrkHXC6Akheip5fpGLrWt9HJ');
  } else {
    Parse.initialize('HNTTfl0uMjkZJZQsF5RDnqId7WLxvSLbZTKarsmD', 'JVXuMQXpYO2t5DSWI13J4gxpAnh3dsVbT71X6f63');
  }
  if (navigator.onLine === true) {
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
}
if (navigator.onLine === true) {
  window.fbAsyncInit = initApp;
} else {
  initApp();
}

var snapper = new Snap({
  element: document.getElementById('container'),
  disable: "right",
  hyperextensible: false,
  maxPosition: 600
});

function safeApply(scope, fn) {
  (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
}
