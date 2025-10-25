.PHONY: all build test test-watch test-coverage clean deploy-services teardown-services

all: build

build:
	bun run build

test:
	bun test

test-watch:
	bun test --watch

test-coverage:
	bun test --coverage

clean:
	rm -vrf dist

deploy-services:
	@echo "Not implemented yet..."

teardown-services:
	@echo "Not implemented yet..."
