/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */
'use strict';

/**
 * @ngdoc service
 * @name shUser
 *
 * @description
 * Service Shared Object for keeping user's data and provides user-related methods.
 */
var shUser = angular.module('shareApp')
  .factory('shUser',function user($rootScope, $location, $window) {

    var myUser = {
      /**
       * @ngdoc property
       * @name shUser#friendsList
       * @propertyOf shUser
       * @returns {Array} Parse users
       *
       * @description
       * Cached list of friends, where friends are Parse.User objects.
       */
      friendsList: [],
      /**
       * @ngdoc property
       * @name shUser#fbFriendsList
       * @propertyOf shUser
       * @returns {Array} FacebookUser
       *
       * @description
       * Cached list of facebook friends, where friends are facebook og:api user objects, which
       * keeps id and username.
       * It's used to generate friendsList.
       * Generally FacebookUser objects are not used.
       */
      fbFriendsList: [],
      /**
       * @ngdoc property
       * @name shUser#friendsShares
       * @propertyOf shUser
       * @returns {Array} SharedItem
       *
       * @description
       * Cached list of SharedItem matching chosen friend's connections.
       */
      friendsShares: {},
      /**
       * @ngdoc property
       * @name shUser#loggedIn
       * @propertyOf shUser
       * @returns {Boolean} Is user logged in
       */
      loggedIn: Parse.User.current() !== null,
      /**
       * @ngdoc property
       * @name shUser#friendsShares
       * @propertyOf shUser
       * @returns {Parse.User} Parse.User
       *
       * @description
       * Current logged in user
       */
      currentUser: Parse.User.current(),
      /**
       * @ngdoc property
       * @name shUser#fbuser
       * @propertyOf shUser
       * @returns {FacebookUser} FacebookUser
       *
       * @description
       * Current logged in facebook user
       */
      fbuser: null,
      /**
       * @ngdoc property
       * @name shUser#username
       * @propertyOf shUser
       * @returns {string} string
       *
       * @description
       * Current logged in user's username
       */
      username: null,
      /**
       * @ngdoc property
       * @name shUser#userShares
       * @propertyOf shUser
       * @returns {Array} SharedItem
       *
       * @description
       * Cached list of SharedItem matching user filters. Must be null to distinguish if it is fetching first time.
       */
      userShares: null,
      /**
       * @ngdoc property
       * @name shUser#userWallFilters
       * @propertyOf shUser
       * @returns {object} options
       *
       * @description
       * Filters defining user's wall SharedItems (shUser.userShares).
       */
      userWallFilters: {
        type: {
          things: true,
          time: true,
          promises: true
        },
        direction: {
          to_me: false,
          from_me: false
        },
        state: {
          returned: true,
          accepted: true,
          rejected: true,
          awaiting: true,
          return_awaiting: true
        }
      },
      /**
       * @ngdoc method
       * @name shUser#logIn
       * @methodOf shUser
       *
       * @description
       * Log in or Sign Up user using Facebook Account.
       * Reload or redirect to main page when successful.
       */
      logIn: function () {
        $rootScope.$broadcast('progressBar.update', true);
        Parse.FacebookUtils.logIn('user_friends,user_friends', {
          success: function (parseUser) {
            if (!parseUser.existed()) {
              console.log('User signed up and logged in through Facebook!');
            } else {
              console.log('User logged in through Facebook!');
            }
            $rootScope.$broadcast('progressBar.update', false);
            PPO.saveObjToStorage(parseUser);
            $window.location.href = '';
          },
          error: function (parseUser, error) {
            console.error('User cancelled the Facebook login or did not fully authorize.');
            console.error(error);
            myUser.logOut();
          }
        });
      },

      /**
       * @ngdoc method
       * @name shUser#logOut
       * @methodOf shUser
       *
       * @description
       * Logout current User and redirect to main page.
       */
      logOut: function () {
        $rootScope.$broadcast('progressBar.update', true);
        Parse.User.logOut();
        $rootScope.$broadcast('progressBar.update', false);
        $window.location.href = '';
      },

      /**
       * @ngdoc method
       * @name shUser#refreshParseUser
       * @methodOf shUser
       *
       * @description
       * Checks if user has changed data on facebook and syncs with copy on parse.com.
       */
      refreshParseUser: function () {
        if (myUser.currentUser.get('name') !== myUser.fbuser.name  || myUser.currentUser.get('firstName') !== myUser.fbuser.first_name) {
          console.log("changing user name from ", myUser.currentUser.get('name'), " to ", myUser.fbuser.name);
          console.log("changing first_name from ", myUser.currentUser.get('firstName'), " to ", myUser.fbuser.first_name);
          myUser.currentUser.set('name', myUser.fbuser.name);
          myUser.currentUser.set('firstName', myUser.fbuser.first_name);
          myUser.currentUser.set('facebookid', myUser.fbuser.id);
          PPO.SaveObject(myUser.currentUser);
        } else {
          console.log("user name or e-mail or first_name did not change");
        }
        Lawnchair(function () {
          this.save({key: 'parseUser', options: myUser.currentUser}, function (obj) {
          });
        });
      },

      /**
       * @ngdoc method
       * @name shUser#fetchFriendsShares
       * @methodOf shUser
       *
       * @description
       * Fetches SharedItems for contact list.
       * It's using Cloud Code function {@link Cloud#getCommonShares getCommonShares}.
       */
      fetchFriendsShares: function () {
        var friendsIds;
        friendsIds = myUser.friendsList.map(function (fbUser) {
          return fbUser.id;
        });
        PPO.RunFetchCloud("getCommonShares", {friendsIds: friendsIds}, {
          success: function (data) {
            safeApply($rootScope, function () {
              myUser.friendsShares = data;
            });
          },
          error: function (error) {
            console.error(error);
          }
        });
      },

      /**
       * @ngdoc method
       * @name shUser#fetchFriends
       * @methodOf shUser
       *
       * @description
       * Maps Facebook Friends list {@link shUser#fbFriendsList fbFriendsList} to {@link shUser#friendsList Parse.User} list.
       */
      fetchFriends: function () {
        var friendsFbIds;

        friendsFbIds = myUser.fbFriendsList.map(function (fbUser) {
          return fbUser.id;
        });
        myUser.friendsList = [];
        PPO.RunFetchCloud("getFriends", {fbFriendsList: friendsFbIds}, {
          success: function (users) {
            safeApply($rootScope, function () {
              myUser.friendsList = myUser.friendsList.concat(users);
            });

            // generates users which are not in Share, but we can share to them
            var User = Parse.Object.extend('User');
            var fakeUsers = [];
            myUser.fbFriendsList.forEach(function (item) {
              if (users.filter(function (u) {
                return u.get('facebookid') == item['id']
              }).length != 0) {
                return;
              }
              var user = new User();
              user.set('facebookid', item['id']);
              user.set('name', item['name']);
              user.set('firstName', item['name'].split(" ")[0]);
              user.set('fakeUser', true);
              user.set('objectId', item['id']);
              user.set('totalTime', 0);
              fakeUsers.push(user);
            });
            safeApply($rootScope, function () {
              myUser.friendsList = myUser.friendsList.concat(fakeUsers);
            });

            // results of cloud functions are not stored in structured storage, so we need to store it manually
            angular.forEach(users, function (user) {
              PPO.saveObjToStorage(user);
            });
            myUser.fetchFriendsShares();
            $rootScope.$broadcast('progressBar.update', false);
          },
          error: function (error) {
            console.error(error);
            $rootScope.$broadcast('progressBar.update', false);
          }});
      },

      /**
       * @ngdoc method
       * @name shUser#fetchFbFriends
       * @methodOf shUser
       *
       * @description
       * Fetches Friends List from Facebook API.
       * When done calls shUser.fetchFriends to get proper list.
       */
      fetchFbFriends: function () {
        console.log('fetching fb friends');

        var callback = function () {
          myUser.fetchFriends();
          console.log('fetched friends list');
        };


        if (navigator.onLine) {
          FB.api('/me/friends', function (response) {
            safeApply($rootScope, function () {
              myUser.fbFriendsList = response.data;
            });
            callback();
            new Lawnchair(function () {
              var lchair = this;
              lchair.save({key: "fbfriends", data: response});
            });
          });
        } else {
          new Lawnchair(function () {
            var lchair = this;
            lchair.get("fbfriends", function (result) {
              safeApply($rootScope, function () {
                myUser.fbFriendsList = result.data.data;
              });
              callback();
            });
          });
        }
      },

      /**
       * @ngdoc method
       * @name shUser#fetchFbUserData
       * @methodOf shUser
       *
       * @description
       * Fetches date about current user from FacebookApi
       */
      fetchFbUserData: function () {
        console.log('fetching user data');
        var callback = function () {
          safeApply($rootScope, function () {
            myUser.username = myUser.fbuser.name;
            myUser.refreshParseUser();
          });
          $rootScope.$broadcast('progressBar.update', false);
          console.log('fetched fb user information');
        };

        if (navigator.onLine) {
          FB.api('/me', function (response) {
            safeApply($rootScope, function () {
              myUser.fbuser = response;
            });
            callback();
            new Lawnchair(function () {
              var lchair = this;
              lchair.save({key: "fbuserdata", data: response});
            });
          });
        } else {
          new Lawnchair(function () {
            var lchair = this;
            lchair.get("fbuserdata", function (result) {
              safeApply($rootScope, function () {
                myUser.fbuser = result.data;
              });
              callback();
            });
          });
        }
      },

      /**
       * @ngdoc method
       * @name shUser#fetchUserShares
       * @methodOf shUser
       *
       * @description
       * Fetches SharedItem object's for current user's wall.
       * Respects filters from shUser.userWallFilters.
       * @param {bool} loadPrevious notify if it should load previous shares
       * @param {bool} loadNext notify if it should load newest shares
       */
      fetchUserShares: function (loadPrevious, loadNext) {
        loadPrevious = typeof loadPrevious !== 'undefined' ? loadPrevious : false;
        loadNext = typeof loadNext !== 'undefined' ? loadNext : false;
        var sharedItemFromQuery = new (PPO.getQueryClass())("SharedItem"),
          sharedItemToQuery = new (PPO.getQueryClass())("SharedItem"),
          sharedItemPublicQuery = new (PPO.getQueryClass())("SharedItem"),
          query,
          blankQuery,
          types = [],
          states = [],
          fromMe = false,
          toMe = false,
          lastUpdateDate;

        $rootScope.$broadcast('progressBar.update', true);

        angular.forEach(myUser.userWallFilters, function (value) {
          angular.forEach(value, function (s_value, s_key) {
            if (!s_value) {
              return; //continue
            }
            blankQuery = false;
            switch (s_key) {
            case 'time':
              types.push(globals.SHARE_TYPE_ENUM.TIME);
              break;
            case 'things':
              types.push(globals.SHARE_TYPE_ENUM.THING);
              break;
            case 'promises':
              types.push(globals.SHARE_TYPE_ENUM.PROMISE);
              break;
            case 'to_me':
              toMe = true;
              break;
            case 'from_me':
              fromMe = true;
              break;
            case 'returned':
              states.push(globals.SHARE_STATE_ENUM.RETURNED);
              break;
            case 'rejected':
              states.push(globals.SHARE_STATE_ENUM.REJECTED);
              break;
            case 'accepted':
              states.push(globals.SHARE_STATE_ENUM.CONFIRMED);
              break;
            case 'awaiting':
              states.push(globals.SHARE_STATE_ENUM.CREATED);
              break;
            case 'return_awaiting':
              states.push(globals.SHARE_STATE_ENUM.RETURNED_NOT_CONFIRMED);
              break;
            default:
              break;
            }
          });
        });

        if (blankQuery) {
          // default query
          console.log('default query');
          sharedItemFromQuery.equalTo('fromUser', myUser.currentUser);
          sharedItemToQuery.equalTo('toUser', myUser.currentUser);
          sharedItemPublicQuery.equalTo('isPublic', true);
          query = (PPO.getQueryClass()).or(sharedItemFromQuery, sharedItemToQuery, sharedItemPublicQuery);
        } else {
          // filtered query
          console.log('filtered query');
          query = new (PPO.getQueryClass())("SharedItem");

          if (fromMe) {
            query.equalTo('fromUser', myUser.currentUser);
          }

          if (toMe) {
            query.equalTo('toUser', myUser.currentUser);
          }

          if (states.length) {
            query.containedIn('state', states);
          }

          if (types.length) {
            query.containedIn('type', types);
          }
        }

        query.include('fromUser');
        query.include('toUser');
        query.descending('updatedAt');
        // loading new shares should be unlimited
        if (loadNext === false) {
          query.limit(5);
        }
        // sets last (or first) update date of possessed share
        if (loadPrevious === true || loadNext === true) {
          if (myUser.userShares.length > 0) {
            if (loadPrevious === true) {
              lastUpdateDate = myUser.userShares[myUser.userShares.length - 1].updatedAt;
              query.lessThan('updatedAt', lastUpdateDate);
            } else if (loadNext === true) {
              lastUpdateDate = myUser.userShares[0].updatedAt;
              query.greaterThan('updatedAt', lastUpdateDate);
            }
          }
        }
        query.find({
          success: function (results) {
            results = results || [];
            $rootScope.$broadcast('progressBar.update', false);
            safeApply($rootScope, function () {
              console.log("fetched " + results.length + " shares");
              if (loadPrevious === true || loadNext === true) {
                // delete item which has been created in offline mode
                angular.forEach(results, function (resultItem, i) {
                  angular.forEach(results, function (shareItem, j) {
                    if (resultItem.get('offlineId') !== undefined && resultItem.get('offlineId') === shareItem.get('offlineId') && i !== j) {
                      myUser.userShares.splice(j, 1);
                    }
                  });
                });
              }
              if (loadPrevious === true) {
                myUser.userShares = myUser.userShares.concat(results);
              } else if (loadNext === true) {
                myUser.userShares = results.concat(myUser.userShares);
              } else {
                myUser.userShares = results;
              }
            });
          },
          error: function (error) {
            console.error(error);
          }
        });
      },

      /**
       * @ngdoc method
       * @name shUser#fetchData
       * @methodOf shUser
       *
       * @description
       * Used to fetch all user's data.
       * Called always when shUser object is created.
       */
      fetchData: function () {
        $rootScope.$broadcast('progressBar.update', true);
        console.log("calling get login status");
        var callback = function () {
          myUser.fetchFbFriends();
          myUser.fetchFbUserData();
          myUser.fetchUserShares();
        };
        if (navigator.onLine) {
          FB.getLoginStatus(function (response) {
            console.log("called get login status " + response.status);
            if (response.status === "connected") {
              callback();
            } else {
              console.error("you aren't logged in");
              myUser.logOut();
            }
          });
        } else {
          callback();
        }


      }
    };
    return myUser;
  }).run(function (shUser) {
    //fetch data for new user
    if (shUser.loggedIn) {
      shUser.fetchData();
    } else {
//      alert("user is not logged in");
    }
  });

shUser.$inject = ['$rootScope', '$location', '$window'];