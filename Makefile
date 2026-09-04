SBIN = $(shell find sbin -type f)
HTML = html
PYTHON ?= python3

SBINDIR = usr/sbin
SHAREDIR = usr/share/minios

build: localized-pages

localized-pages:
	$(PYTHON) tools/build-localized-pages

clean:
	rm -rf $(HTML)/locales

test: build
	$(PYTHON) -m unittest discover -s tests -v
	$(PYTHON) tools/build-localized-pages --check

install: build
	install -d $(DESTDIR)/$(SBINDIR)
	install -m755 $(SBIN) $(DESTDIR)/$(SBINDIR)

	install -d $(DESTDIR)/$(SHAREDIR)/html/assets/img
	install -d $(DESTDIR)/$(SHAREDIR)/html/assets/icons
	install -d $(DESTDIR)/$(SHAREDIR)/html/assets/mio
	install -d $(DESTDIR)/$(SHAREDIR)/html/css
	install -d $(DESTDIR)/$(SHAREDIR)/html/js
	install -d $(DESTDIR)/$(SHAREDIR)/html/locales
	install -m644 $(HTML)/index.html $(HTML)/favicon.svg $(DESTDIR)/$(SHAREDIR)/html
	install -m644 $(HTML)/assets/img/*.jpg $(DESTDIR)/$(SHAREDIR)/html/assets/img
	install -m644 $(HTML)/assets/icons/*.svg $(DESTDIR)/$(SHAREDIR)/html/assets/icons
	install -m644 $(HTML)/assets/mio/* $(DESTDIR)/$(SHAREDIR)/html/assets/mio
	install -m644 $(HTML)/css/welcome.css $(DESTDIR)/$(SHAREDIR)/html/css
	install -m644 $(HTML)/js/welcome.js $(DESTDIR)/$(SHAREDIR)/html/js
	install -m644 $(HTML)/locales/*.html $(DESTDIR)/$(SHAREDIR)/html/locales

.PHONY: build clean install localized-pages test
