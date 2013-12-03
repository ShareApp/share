/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

var ShShareDetailsCtrl = angular.module('shareApp')
  .controller('ShShareDetailsCtrl', function ($scope, $state, $location, $window, $translate, shUser, shShare) {
    var sharedItemId = $state.params.sharedItemId,
      sharedItemQuery = new (PPO.getQueryClass())('SharedItem');

    $scope.share = shShare;
    $scope.user = shUser;
    $scope.showReturn = false;
    $scope.showDemandReturn = false;

    sharedItemQuery.include('fromUser', 'toUser');

    /**
     * Fetch SharedItem and update scope.
     */
    sharedItemQuery.get(sharedItemId, {
      success: function (sharedItem) {
        safeApply($scope, function () {
          $scope.sharedItem = sharedItem;
          $scope.showReturn = $scope.sharedItem && ($scope.sharedItem.get('state') === globals.SHARE_STATE_ENUM.CONFIRMED || $scope.sharedItem.get('state') === globals.SHARE_STATE_ENUM.RETURNED_NOT_CONFIRMED) && $scope.sharedItem.get('toUser').id === shShare.currentUser.id;
          $scope.showDemandReturn = $scope.sharedItem && ($scope.sharedItem.get('state') === globals.SHARE_STATE_ENUM.CONFIRMED || $scope.sharedItem.get('state') === globals.SHARE_STATE_ENUM.RETURNED_NOT_CONFIRMED) && $scope.sharedItem.get('fromUser').id === shShare.currentUser.id;
        });
      },
      error: function (object, error) {
        console.error(object);
        console.error(error);
      }
    });

    /**
     * Set SharedItem returned and waiting for party confirmation.
     * @param sharedItem
     */
    $scope.returnShare = function (sharedItem) {
      if ($window.confirm($translate('Are you sure?')) === true) {
        shShare.returnShare(sharedItem);
        $scope.showReturn = false;
      }
    };

    /**
     * Inform party that you want your SharedItem back.
     * @param sharedItem
     */
    $scope.demandReturnShare = function (sharedItem) {
      shShare.demandReturnShare(sharedItem);
      $window.alert($translate("You've just asked for a return."));
    };


  });

ShShareDetailsCtrl.$inject = ['$scope', '$state', '$location', '$window', '$translate', 'shUser', 'shShare'];