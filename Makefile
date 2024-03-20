# Variables
HTML = html
FONTS = $(shell find fonts -type f)

SHAREDIR = usr/share/minios
FONTSDIR = usr/share/fonts

# Build rules
build:

# Clean rule
clean:

# Install rule
install:
	install -d $(DESTDIR)/$(SHAREDIR)
	cp -r $(HTML) $(DESTDIR)/$(SHAREDIR)

	install -d $(DESTDIR)/$(FONTSDIR)
	install -m644 $(FONTS) $(DESTDIR)/$(FONTSDIR)
