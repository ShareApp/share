/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */

/**
 * @ngdoc object
 * @name ExpressApp
 *
 * @description
 * Express application which can be launched only in Parse.com cloud.
 */
var express = require('express');
var app = express();

app.set('views', 'cloud/views');
app.set('view engine', 'ejs');
app.use(express.cookieParser('SECRET 12345'));
app.use(express.cookieSession());
app.use(express.bodyParser());
var Buffer = require('buffer').Buffer;
var settings = require('settings/settings');

var parseExpressCookieSession = require('parse-express-cookie-session');
app.use(parseExpressCookieSession({ cookie: { maxAge: 3600000 } }));


/**
 * @ngdoc method
 * @name ExpressApp.appcache
 * @methodOf ExpressApp
 * @description
 * Generates dynamic HTML5 Cache Manifest. It is used for get facebook profile photos and shares photos.
 */
app.get('/share.appcache', function (req, res) {
  var FBappId = settings.FBappId;
  var sharedItemPublicQuery = new Parse.Query("SharedItem");
  sharedItemPublicQuery.equalTo('isPublic', true);
  var query = sharedItemPublicQuery;

  if (req.cookies['fbsr_' + FBappId]) {
    var cookie = req.cookies['fbsr_' + FBappId];
    var payload = (cookie.split(".")[1]);
    var buffer = new Buffer(payload, 'base64').toString('utf8');
    var data = JSON.parse(buffer);
    var userId = data['user_id'];
    var sharedItemFromQuery = new Parse.Query("SharedItem"),
      sharedItemToQuery = new Parse.Query("SharedItem"),
      innerQuery = new Parse.Query("_User");
    innerQuery.equalTo('facebookid', userId);
    sharedItemFromQuery.matchesQuery("fromUser", innerQuery);
    sharedItemToQuery.matchesQuery("toUser", innerQuery);
    query = Parse.Query.or(sharedItemFromQuery, sharedItemToQuery, sharedItemPublicQuery);
  }
  query.include(['fromUser', 'toUser']);

  res.type('text/cache-manifest');
  query.notEqualTo('img', null);
  var files = [];
  query.find(function (result) {
    Parse._.forEach(result, function (item) {
      files.push(item.get('img').url());
      files.push("https://graph.facebook.com/" + item.get('fromUser').get('facebookid') + "/picture?width=65&height=65");
      files.push("https://graph.facebook.com/" + item.get('toUser').get('facebookid') + "/picture?width=65&height=65");
    });
    res.render('manifest', { now: new Date, files: files });
  });
});

app.listen();
