[![Stories in Ready](https://badge.waffle.io/theodi/edward-csvhands.svg?label=ready&title=Ready)](http://waffle.io/theodi/edward-csvhands)

# Comma Chameleon

A desktop CSV editor with validation magic - Built with electron.js

## Download app

Choose a platform:

* [OSX](https://raw.githubusercontent.com/theodi/comma-chameleon/master/packages/comma-chameleon-darwin-x64.tar.gz)
* [Linux 32 bit](https://raw.githubusercontent.com/theodi/comma-chameleon/master/packages/comma-chameleon-linux-ia32.tar.gz)
* [Linux 64 bit](https://raw.githubusercontent.com/theodi/comma-chameleon/master/packages/comma-chameleon-linux-x64.tar.gz)
* [Windows 32 bit](https://raw.githubusercontent.com/theodi/comma-chameleon/master/packages/comma-chameleon-win32-ia32.tar.gz)
* [Windows 64 bit](https://raw.githubusercontent.com/theodi/comma-chameleon/master/packages/comma-chameleon-win32-x64.tar.gz)

##Development setup

```
brew install node
npm install bower electron-prebuilt -g
cd app/
npm install
bower install
```

Then to open the app run:

```
electron .
# assumes you have remained in the /app directory
```

## Building a new package

(This assumes you're running OSX)

```
brew install wine # This allows us to specify the icon for Windows pacakges
npm i electron-packager -g
script/build
```

## Testing
prerequisites
```
npm i electron-prebuilt --save-dev
npm i electron-mocha --save-dev
npm i chai --save-dev
```

[Electron-Mocha](https://github.com/jprichardson/electron-mocha) has been adopted for testing, it enables both DOM and node.js testing and provides command line options to
enable testing of both
Testing DOM with electon-mocha follows the same invocation and declaration patterns as [jsdom()](https://www.npmjs.com/package/mocha-jsdom)

Javascript is followed the `module.exports` pattern for module interface
Tests have adopted a provisional pattern of using underscore `_` to denote private methods and making them available to
 the unit test environment through the following addition to the `module.exports` pattern
 ```
 module.exports = {
   // public interface
 };
 if (process.env.NODE_ENV === 'test') {
   module.exports._private = {
    // private methods made available for unit tests
   }
 }

Tests set a local NODE_ENV paramter when executing

##running the tests
to run tests for the main (i.e. runtime) javascript:
    electron-mocha app/test/main/

to run tests for the renderer (i.e. client facing/side) javascript:
    electron-mocha --renderer app/test/renderer/