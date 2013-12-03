deploy:
	rm -r cloudCode/public/*; \
	grunt build; \
	rm -rf cloudCode/public/bower_components/; \
	cd cloudCode/; \
	parse deploy Share\!; \
	parse deploy Share\!Test;

makemessages:
	cd shareApp; \
	grunt i18nextract;
