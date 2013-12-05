# Share❣ 

## Introduction

Share❣ is a usability-optimized smartphone web-app to remember your social sharing:
* Objects borrowed or lent,
* Time given or received,
* Promises given or received.

Just snap a photo, choose the person from your contacts and Share❣ will remember.

Technically speaking, it is web application created using Angular JS and Parse.com cloud.


## Getting started

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


## How it's built

It's completely JavaScript application. 
It uses Parse.com as a backend service, where data are stored and several server functions are implemented like images scaling or notifications creating,
To learn more about Parse.com see JavaScript guid https://www.parse.com/docs/js_guide.

Main technology used in frontend is Angular JS. We use also Hammer.js to bind swipe events and Lawnchair to provide offline support.


## Development

1. To generate inline documentation call ```grunt ngdocs``` and go to 'docs' directory
1. To develop app you can simply call ```grunt server```

#### Don't forget to:
- every time you will change CSS sprites, you should change generated filename ```cloudCode/cloud/views/manifest.ejs``` file
- every time you will change any HTML/CSS/JS file, you should increment version in ```cloudCode/cloud/views/manifest.ejs``` file to refresh HTML5 Application Cache





