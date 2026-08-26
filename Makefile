# Variables
SBIN = $(shell find sbin -type f)
HTML = html
PYTHON ?= python3

BINDIR = usr/bin
SBINDIR = usr/sbin
SHAREDIR = usr/share/minios

# Build rules
build: sync-translations

# Clean rule
clean: sync-translations

sync-translations:
	$(PYTHON) tools/html-i10n-extract

test: sync-translations
	$(PYTHON) -m unittest discover -s tests -v

# Install rule
install:
	install -d $(DESTDIR)/$(SBINDIR)
	install -m755 $(SBIN) $(DESTDIR)/$(SBINDIR)

	install -d $(DESTDIR)/$(SHAREDIR)/html/assets/img
	install -d $(DESTDIR)/$(SHAREDIR)/html/css
	install -d $(DESTDIR)/$(SHAREDIR)/html/js/translations
	install -m644 $(HTML)/index.html $(HTML)/favicon.svg $(DESTDIR)/$(SHAREDIR)/html
	install -m644 $(HTML)/assets/img/*.jpg $(DESTDIR)/$(SHAREDIR)/html/assets/img
	install -m644 $(HTML)/css/custom.css $(HTML)/css/slides.min.css $(DESTDIR)/$(SHAREDIR)/html/css
	install -m644 $(HTML)/js/jquery.min.js $(HTML)/js/slides.min.js $(HTML)/js/translate.js $(DESTDIR)/$(SHAREDIR)/html/js
	install -m644 $(HTML)/js/translations/*.js $(DESTDIR)/$(SHAREDIR)/html/js/translations

.PHONY: build clean install sync-translations test
