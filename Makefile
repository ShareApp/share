# commands which automatize some common tasks

# task which build application and deploy it to Parse.com
deploy:
	-rm -r cloudCode/public/*
	node_modules/grunt-cli/bin/grunt build
	-rm -rf cloudCode/public/bower_components/
	cd cloudCode/;parse deploy `cat ../parse_app_name.txt`

# task which create language messages file and put it to shareApp/app/i18n directory
makemessages:
	cd shareApp; \
	grunt i18nextract;

manifest:
	( cd shareApp/app ; ls img/*/normal-*.png; ls img/*/retina-*.png;  ls i18n/*.js; ls img/*png; ls img/*gif; ls img/*jpg; ls img/favicons/*png ; ls img/backgrounds/*png ; ls views/*html ; ls styles/fonts/*;  ) | cat > manfest


#    version := $(shell sed -n 's/.*version: \([0-9]\)/\1/p' cloudCode/cloud/views/manifest.ejs)
#   echo $(version)
