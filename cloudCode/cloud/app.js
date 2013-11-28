var express = require('express');
var app = express();

app.set('views', 'cloud/views');
app.set('view engine', 'ejs');
app.use(express.cookieParser('SECRET 12345'));
app.use(express.cookieSession());
app.use(express.bodyParser());
var Buffer = require('buffer').Buffer;

var parseExpressCookieSession = require('parse-express-cookie-session');
app.use(parseExpressCookieSession({ cookie: { maxAge: 3600000 } }));


app.get('/share.appcache', function (req, res) {
  /**
   * Generates dynamic HTML5 Cache Manifest. It is used for get facebook profile photos and shares photos.
   */
  var FBappId;
  if (req.headers['host'] === "share-test.parseapp.com") {
    FBappId = '222033201286057';
  } else if (req.headers['host'] === "share.hiddendata.co") {
    FBappId = '1474663289424777';
  } else {
    FBappId = '142693092598273';
  }

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
