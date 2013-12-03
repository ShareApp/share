/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

var FriendDetailsCtrl = angular.module('shareApp')
    .controller('FriendDetailsCtrl', function ($scope, $rootScope, $state, $location, $translate, $window, shUser, shShare) {
      $scope.shShare = shShare;
      var friendId = $state.params.userId,
        userQuery = new (PPO.getQueryClass())('_User');



      /**
       * Filter indicator for friend's SharedItems list
       * Available values are: "all", "withme".
       * @type {string}
       */
      $scope.filterShares = "withme";
      $scope.userShares = null;

      /**
       * Fetches SharedItems for user respecting $scope.filterShares.
       */
      var fetchUserShares = function (loadPrevious) {
        loadPrevious = typeof loadPrevious !== 'undefined' ? loadPrevious : false;
        var query,
          sharedItemFromQuery = new (PPO.getQueryClass())('SharedItem'),
          sharedItemToQuery = new (PPO.getQueryClass())('SharedItem'),
          lastUpdateDate;

        if ($scope.friend === undefined) {
          return;
        }
        $rootScope.$broadcast('progressBar.update', true);
        if ($scope.filterShares === "all") {
          sharedItemFromQuery.equalTo('fromUser', $scope.friend);
          sharedItemToQuery.equalTo('toUser', $scope.friend);
        } else {
          sharedItemFromQuery.equalTo('fromUser', $scope.friend);
          sharedItemFromQuery.equalTo('toUser', shUser.currentUser);
          sharedItemToQuery.equalTo('toUser', $scope.friend);
          sharedItemToQuery.equalTo('fromUser', shUser.currentUser);
        }

        query = (PPO.getQueryClass()).or(sharedItemFromQuery, sharedItemToQuery);
        query.include('fromUser');
        query.include('toUser');
        query.descending('updatedAt');
        query.limit(5);
        if (loadPrevious === true) {
          lastUpdateDate = $scope.userShares[$scope.userShares.length - 1].updatedAt;
          query.lessThan('updatedAt', lastUpdateDate);
        } else {
          // retrieve counter
          var counterQuery = (PPO.getQueryClass()).or(sharedItemFromQuery, sharedItemToQuery);
          counterQuery.count({success: function (counter) {
            $scope.counter = counter;
          }});
        }


        query.find({
          success: function (shares) {
            $rootScope.$broadcast('progressBar.update', false);
            safeApply($scope, function () {
              if (loadPrevious === true) {
                $scope.userShares = $scope.userShares.concat(shares);
              } else {
                $scope.userShares = shares;
              }
            });
          },
          error: function (error) {
            console.error(error);
            $rootScope.$broadcast('progressBar.update', false);
          }
        });
      };
      $scope.fetchUserShares = fetchUserShares;

      /**
       * Get friend's Parse.User and load SharedItems for him.
       */
      userQuery.get(friendId, {
        success: function (user) {
          safeApply($scope, function () {
            $scope.friend = user;
          });
          fetchUserShares();
        },
        error: function (object, error) {
          console.error(object);
          console.error(error);
        }
      });

      $scope.fetchOlderSharesIfBottom = function () {
        var currentScroll = angular.element("#container").scrollTop() + angular.element(window).height(),
          currentHeight = angular.element("#content-container").height() + angular.element("#header-container").height();
        if (currentScroll >= currentHeight) {
          $scope.fetchUserShares(true);
        }
      };

      $scope.$watch('filterShares', function () {
        $scope.fetchUserShares();
      });

      /**
       * Send Facebook Message to User.
       */
      $scope.fbMsgDialog = function () {

        /*$window.location.href = 'https://www.facebook.com/dialog/send?' +
         'app_id=' + window.FBappId +
         //'&link=' + encodeURIComponent('http://hiddendata.co/') +
         //'&redirect_uri=' + encodeURIComponent($location.absUrl()) +
         '&display=touch' +
         '&to=' + $scope.friend.get('facebookid');*/
        // TODO: this part is never used
        $window.location.href = 'https://www.facebook.com/dialog/feed?' +
          'app_id=' + window.FBappId +
          '&description=' + 'Hej! Coś Ci pożyczyłem w share. Czek this ałt!' +
          '&link=' + encodeURIComponent('http://hiddendata.co/') +
          '&redirect_uri=' + encodeURIComponent($location.absUrl()) +
          '&actions={name: \'cos\', link: \'http://onet.pl/\'}' +
          '&properties={cos1: \'cos2\', jestemwpracy: {text:\'hiddendata\', href: \'http://onet.pl/\'}}' +
          '&to=' + $scope.friend.get('facebookid');


//      FB.ui({ method: 'apprequests',
//        message: 'Hej! Coś Ci pożyczyłem w share. Czek this ałt!',
//        to: $scope.friend.get('facebookid')
//      });

//      FB.ui({
//        method: 'send',
//        link: 'http://hiddendata.co/', // TODO(s3p4n): nie mam pojecia jaki link by tu mozna wstawiac, ale to jest wymagane... :/
//        to: $scope.friend.get('facebookid')
//      });
      };

    }
  )
  ;

FriendDetailsCtrl.$inject = ['$scope', '$rootScope', '$state', '$location', '$translate', '$window', 'shUser', 'shShare'];