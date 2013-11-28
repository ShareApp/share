deploy:
	cd shareApp; \
	grunt build; \
	cd ..; \
	rm -r cloudCode/public/*; \
	cp -r shareApp/dist/* cloudCode/public/; \
	rm -rf cloudCode/public/bower_components/; \
	cd cloudCode/; \
	parse deploy Share\!; \
	parse deploy Share\!Test;

makemessages:
	cd shareApp; \
	grunt i18nextract;
