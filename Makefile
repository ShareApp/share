deploy:
	rm -r cloudCode/public/*; \
	grunt build; \
	rm -rf cloudCode/public/bower_components/; \
	cd cloudCode/; \
	parse deploy `cat parse_app_name.txt`;

makemessages:
	cd shareApp; \
	grunt i18nextract;
