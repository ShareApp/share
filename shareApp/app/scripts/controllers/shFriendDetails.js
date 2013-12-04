/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc object
 * @name FriendDetailsCtrl
 *
 * @description
 * Controller which is responsible for displaying friend details
 */
var FriendDetailsCtrl = angular.module('shareApp')
  .controller('FriendDetailsCtrl', function ($scope, $rootScope, $state, $location, $translate, $window, shUser, shShare) {
    $scope.shShare = shShare;
    var friendId = $state.params.userId,
      userQuery = new (PPO.getQueryClass())('_User');


    /**
     * @ngdoc property
     * @name FriendDetailsCtrl#filterShares
     * @propertyOf FriendDetailsCtrl
     * @returns {string} string
     *
     * @description
     * Filter indicator for friend's SharedItems list
     * Available values are: "all", "withme".
     */
    $scope.filterShares = "withme";
    $scope.userShares = null;

    /**
     * @ngdoc method
     * @name FriendDetailsCtrl#fetchUserShares
     * @methodOf FriendDetailsCtrl
     *
     * @description
     * Fetches SharedItems for user respecting $scope.filterShares.
     * @param {bool} loadPrevious notify if it should load previous shares
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

    // Get friend's Parse.User and load SharedItems for him.
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

    /**
     * @ngdoc method
     * @name FriendDetailsCtrl#fetchOlderSharesIfBottom
     * @methodOf FriendDetailsCtrl
     *
     * @description
     * Function which is taking care about fetching older shares that retrieved previously
     */
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
  }
);

FriendDetailsCtrl.$inject = ['$scope', '$rootScope', '$state', '$location', '$translate', '$window', 'shUser', 'shShare'];