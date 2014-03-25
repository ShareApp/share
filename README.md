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
 * [bower](???) - used for??
 * [grunt](???) - 

## parse.com and angular.js

How is this put together???

## Getting started

### Install github client
 * see github documentation https://help.github.com/articles/set-up-git
 
### Install npm [node package manager](https://github.com/npm/npm)
 ?? why is this needed
 * windows - 
 * mac/osx - requires installation of a package manager such as [mac ports](http://www.macports.org/)
 ** port install npm
 * linux

### Install bower
 ?? why is this needed


### Download Share❣ and start coding! 

1. 
```git clone git+ssh://git@github.com/ShareApp/share.git```
1. 
```cd share```
1. 
```npm install --dev```
1. 
```bower install```
1. Read ```https://parse.com/docs/cloud_code_guide#cloud_code``` and install Parse Command Line Tool
1. Set up new Parse App
```
parse new cloudCode
```
1. Create ```parse_app_name.txt``` file in root directory and put there Parse App name
1. Move ```settings/settings_example.js``` to ```settings/settings.js``` and edit it.
1. Ensure that ```cloudCode/cloud/settings.js``` and ```shareApp/settings.js``` is symbolic link to ```settings/settings.js```.
1. Add ```127.0.0.1       share.test``` to your ```/etc/hosts``` file. This is because Facebook API needs domain to work.


## Deployment

After doing Getting started section you can easily deploy your app to Parse by calling ```make``` in root directory.



## Development

1. To generate inline documentation call ```grunt ngdocs``` and go to 'docs' directory
1. To develop app you can simply call ```grunt server```

#### Don't forget to:
- every time you will change CSS sprites, you should change generated filename ```cloudCode/cloud/views/manifest.ejs``` file
- every time you will change any HTML/CSS/JS file, you should increment version in ```cloudCode/cloud/views/manifest.ejs``` file to refresh HTML5 Application Cache



## Directory Structure

 * cloudCode - ??
 * docs - ??
 * settings - ??
 * shareApp - ??
