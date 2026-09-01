# SPDX-License-Identifier: MIT

UUID      := real-calendar@boobuh.github.io
SRC       := src/$(UUID)
BUILD     := build
ZIP       := $(BUILD)/$(UUID).shell-extension.zip
POT       := po/real-calendar.pot
JS_CHECK  := $(shell find bin demo tests $(SRC) -name '*.js' -print)

.PHONY: help test check schemas pot pack install uninstall clean

help:
	@printf '%s\n' \
		'test       run conversion tests' \
		'check      syntax-check all JavaScript' \
		'schemas    validate GSettings XML' \
		'pot        refresh gettext template' \
		'pack       build the EGO .shell-extension.zip' \
		'install    install into ~/.local/share/gnome-shell/extensions' \
		'uninstall  remove the local install' \
		'clean      remove build artifacts'

test:
	npm test

check:
	@for f in $(JS_CHECK); do node --check "$$f" || exit 1; done
	@echo 'JavaScript syntax OK'

schemas:
	glib-compile-schemas --strict --dry-run $(SRC)/schemas

pot:
	xgettext --from-code=UTF-8 --language=JavaScript \
		--keyword=_ --keyword=N_ --keyword=C_:1c,2 \
		--package-name=real-calendar --package-version=2.0.0 \
		--msgid-bugs-address=https://github.com/Boobuh/real-calendar/issues \
		--output=$(POT) \
		$(SRC)/extension.js $(SRC)/prefs.js $(SRC)/calendarWidget.js
	@echo 'Wrote $(POT)'

pack: $(ZIP)

$(ZIP):
	./scripts/pack.sh

install:
	./scripts/install.sh

uninstall:
	./scripts/uninstall.sh

clean:
	rm -rf $(BUILD)
	rm -f $(SRC)/schemas/gschemas.compiled
