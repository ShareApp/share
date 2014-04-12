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
 * There are some Parse.com hooks, so there is no way to run it separately on own server.
 *
 * As long as following methods are simple, we can rewrite it to custom server-side framework.
 */
var express = require('express');
var Buffer = require('buffer').Buffer;
var settings = require('cloud/settings.js');
var parseExpressCookieSession = require('parse-express-cookie-session');

var app = express();
app.set('views', 'cloud/views');
app.set('view engine', 'ejs');
app.use(express.cookieParser('SECRET 12345'));
app.use(express.cookieSession());
app.use(express.bodyParser());

app.use(parseExpressCookieSession({ cookie: { maxAge: 3600000 } }));

/**
 * @ngdoc method
 * @name ExpressApp.appcache
 * @methodOf ExpressApp
 * @description
 * Generates dynamic HTML5 Cache Manifest.
 */
app.get('/share.appcache', function (req, res) {
  res.type('text/cache-manifest');
  res.render('manifest', { now: new Date, files: [] });
});

// redirect for /sharedItem/12313 url. Facebook needs it to connect comments.
app.get('/sharedItem/:id', function (req, res) {
  res.redirect(301, "/#" + req.path);
});

app.listen();

