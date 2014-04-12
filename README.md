# Share❣ 

## Introduction

Share❣ is a usability-optimized smartphone web-app to remember your social sharing:
* Objects borrowed or lent,
* Time given or received,
* Promises given or received.

Just snap a photo, choose the person from your contacts and Share❣ will remember.

Technically speaking, it is web application created using Angular JS and Parse.com cloud.


## How it's built

It's completely JavaScript application. 
It uses Parse.com as a backend service, where data are stored and several server functions are implemented like images scaling or notifications creating,
To learn more about Parse.com see JavaScript guid https://www.parse.com/docs/js_guide.


### Front-end Libraries and frameworks used
Main technology used in frontend is Angular JS. 

 * AngularJS
 * Hammer.js to bind swipe events
 * Lawnchair to provide offline support.
 

### Technologies used for build process
 * [npm](https://github.com/npm/npm) - used for??
 * [bower](http://bower.io/) - used for??
 * [grunt](???) - 

### Directory Structure
 * cloudCode - parse.com server-side code
 * docs - ngdocs documentation template file (docs are generated into here (see Generating documentation above)
 * settings - settings file shared between server & app-side
 * shareApp - application source code


## parse.com and angular.js

How is this put together???

## Getting started

### Install github client
 * see github documentation https://help.github.com/articles/set-up-git
 
### Install npm [node package manager](https://github.com/npm/npm)
 * windows -
 * mac/osx - requires installation of a package manager such as [mac ports](http://www.macports.org/)
    * port install npm
 * linux

### Install bower
 * npm install -g bower

### Application keys
#### Parse.com
Share requires parse.com back-end for development at https://www.parse.com/apps/ (free registration required)

#### Facebook
Share requires facebook application, either create your own at https://developers.facebook.com/
or ask share development team to use our test application.

For local testing set-up the application on the domain share.test (and add share.test to your /etc/hosts)

New application settings for local testing as:
 * namespace: empty
 * add App on facebook with settings:
    * canvas URL: http://share.test:9000/
    * secure canvas URL: https://share.test:9000/
 * app domains: share.test
 *
 *

### Download Share❣ and start coding! 

1. 
```git clone git+ssh://git@github.com/ShareApp/share.git```
1. 
```cd share```
1. 
```npm install```
1. 
```node_modules/grunt-google-cdn/node_modules/bower/bin/bower install```
1. Read ```https://parse.com/docs/cloud_code_guide#cloud_code``` and install Parse Command Line Tool
1. Set up new Parse App - requires parse.com account (free)
```
parse new cloudCode
```
1. Create ```parse_app_name.txt``` file in root directory and put there Parse App name
1. Copy ```settings/settings_example.js``` to ```settings/settings.js``` and input application keys for facebook, parse (see above)
1. Ensure ```cloudCode/cloud/settings.js``` and ```shareApp/app/settings.js``` are  links to ```settings/settings.js``` - this is set-up automatically on Linux/OSX on git pull as the links are in the repository, not sure how works on windows.
1. Add ```127.0.0.1       share.test``` to your ```/etc/hosts``` file. This is because Facebook API needs domain to work.
(for OSX need to flush the cache to make changes register - google "/etc/hosts OSX" for more info)

## Development

#### Running app on local development server
 *  To develop app you can simply call ```node_modules/grunt-cli/bin/grunt server```
 *  Still requires parse.com for backend i.e. cloudCode changes must be uploaded to server.

#### Don't forget to:
- every time you will change CSS sprites, you should change generated filename ```cloudCode/cloud/views/manifest.ejs``` file
- every time you will change any HTML/CSS/JS file, you should increment version in ```cloudCode/cloud/views/manifest.ejs``` file to refresh HTML5 Application Cache

#### Debug mode
 * set in settings file
 * currently only used to put "test" string over logo

#### Generating documentation
1. To generate inline documentation call ```node_modules/grunt-cli/bin/grunt ngdocs``` and go to 'docs' directory

## Deployment

After doing Getting started section you can easily deploy your app to Parse by calling ```make``` in root directory.


