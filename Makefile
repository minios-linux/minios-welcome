# Variables
SBIN = $(shell find sbin -type f)
HTML = html

SBINDIR = usr/sbin
SHAREDIR = usr/share/minios

# Build rules
build:

# Clean rule
clean:

# Install rule
install:
	install -d $(DESTDIR)/$(SBINDIR)
	install -m755 $(SBIN) $(DESTDIR)/$(SBINDIR)

	install -d $(DESTDIR)/$(SHAREDIR)
	cp -r $(HTML) $(DESTDIR)/$(SHAREDIR)
