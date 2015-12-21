default: test

MODULES = ./node_modules/.bin
MOCHA = $(MODULES)/mocha -u tdd --check-leaks -R mocha-better-spec-reporter
VERSION = $(shell node -pe 'require("./package.json").version')

all: jshint test

.PHONY: release test loc clean no_targets__ help

no_targets__:
help:
	@sh -c "$(MAKE) -rpn no_targets__ | awk -F':' '/^[a-zA-Z0-9][^\$$#\/\\t=]*:([^=]|$$)/ {split(\$$1,A,/ /);for(i in A)print A[i]}' | grep -v '__\$$' | grep -v 'Makefile' | grep -v 'make\[1\]' | sort"

tag:
	@git tag -a "v$(VERSION)" -m "Version $(VERSION)"

tag-push: tag
	@git push --tags origin HEAD:master

test:
	@NODE_ENV=test $(MOCHA) test/trans/index-test.js

test-slow:
	@NODE_ENV=test $(MOCHA) test/perf/index-test.js --timeout 10000

test-all:
	@NODE_ENV=test $(MOCHA) test/trans/index-test.js test/perf/index-test.js --timeout 10000

jshint:
	jshint lib/**
	jshint test/**

loc:
	@find src/ -name *.js | xargs wc -l

setup:
	@npm install . -d

clean-dep:
	@rm -rf node_modules

