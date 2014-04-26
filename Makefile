# commands which automatize some common tasks

build:
	-rm -r cloudCode/public/*
	node_modules/grunt-cli/bin/grunt build
	-rm -rf cloudCode/public/bower_components/

# task which build application and deploy it to Parse.com
deploy: build manifest
	cd cloudCode/; \
	parse deploy `cat ../parse_app_name.txt`;

# task which create language messages file and put it to shareApp/app/i18n directory
makemessages:
	cd shareApp; \
	grunt i18nextract;

manifest: build
	( echo "# version "`date +"%s"`;\
	cd shareApp/app ; \
	cat manifest-top.txt ;\
	ls img/*/normal-*.png; \
	ls img/*/retina-*.png;  ls i18n/*.js; ls img/*png; \
	ls img/*gif; ls img/*jpg; ls img/favicons/* ; \
	ls img/backgrounds/* ; ls views/*html ; ls styles/fonts/*; \
	echo ""; echo "NETWORK:"; echo "*"; echo ""; echo "SETTINGS:"; echo "prefer-online" ) | cat > manfest
	echo "Manifest changes are.... "
	-diff cloudCode/cloud/views/manifest.ejs manfest
	mv manfest cloudCode/cloud/views/manifest.ejs
