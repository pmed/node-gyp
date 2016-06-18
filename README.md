node-gyp.js
===========
### Node.js native addon build tool

`node-gyp.js` is a drop in replacement for [`node-gyp`](https://github.com/nodejs/node-gyp),
a cross-platform command-line tool for compiling native addon modules for Node.js.

`node-gyp.js` written in Node.js and uses [gyp.js](https://github.com/indutny/gyp.js)
project to generate [Ninja](https://ninja-build.org/) build files. Unlike the original
`node-gyp`, `node-gyp.js` does not requre Python, and uses only
[Ninja](https://ninja-build.org/) build tool and a C/C++ toolchain
to build native addon modules for Node.js.

Multiple target versions of node are supported, regardless of what version of
node is actually installed on your system (`node-gyp.js` downloads the necessary
development files for the target version).


Installation
------------

You can install with `npm`:

``` bash
$ npm install -g node-gyp.js
```

You will also need to install [Ninja](https://ninja-build.org/) build tool and a proper
C/C++ compiler toolchain.

  * On Unix:
    * [GCC](https://gcc.gnu.org)
  * On Mac OS X:
    * [Xcode](https://developer.apple.com/xcode/download/)
      * You also need to install the `Command Line Tools` via Xcode. You can find this under the menu `Xcode -> Preferences -> Downloads`
      * This step will install `gcc` and the related toolchain containing `make`
  * On Windows:
    * Visual C++ Build Environment:
      * Option 1: Install [Visual C++ Build Tools](http://landinghub.visualstudio.com/visual-cpp-build-tools) using the **Default Install** option.

      * Option 2: Install [Visual Studio 2015](https://www.visualstudio.com/products/visual-studio-community-vs) (or modify an existing installation) and select *Common Tools for Visual C++* during setup. This also works with the free Community and Express for Desktop editions.

      > :bulb: [Windows Vista / 7 only] requires [.NET Framework 4.5.1](http://www.microsoft.com/en-us/download/details.aspx?id=40773)


How to Use
----------

To compile your native addon, first go to its root directory:

``` bash
$ cd my_node_addon
```

The next step is to generate the appropriate project build files for the current
platform. Use `configure` for that:

``` bash
$ node-gyp configure
```

__Note__: The `configure` step looks for the `binding.gyp` file in the current
directory to process. See below for instructions on creating the `binding.gyp` file.

Now you will have a `build.ninja` file in the `build/` directory. Next invoke
the `build` command:

``` bash
$ node-gyp build
```

Now you have your compiled `.node` bindings file! The compiled bindings end up
in `build/Debug/` or `build/Release/`, depending on the build mode. At this point
you can require the `.node` file with Node and run your tests!

__Note:__ To create a _Debug_ build of the bindings file, pass the `--debug` (or
`-d`) switch when running either the `configure`, `build` or `rebuild` command.


The "binding.gyp" file
----------------------

Previously when node had `node-waf` you had to write a `wscript` file. The
replacement for that is the `binding.gyp` file, which describes the configuration
to build your module in a JSON-like format. This file gets placed in the root of
your package, alongside the `package.json` file.

A barebones `gyp` file appropriate for building a node addon looks like:

``` python
{
  "targets": [
    {
      "target_name": "binding",
      "sources": [ "src/binding.cc" ]
    }
  ]
}
```

Some additional resources for addons and writing `gyp` files:

 * ["Going Native" a nodeschool.io tutorial](http://nodeschool.io/#goingnative)
 * ["Hello World" node addon example](https://github.com/nodejs/node/tree/master/test/addons/hello-world)
 * [gyp user documentation](https://gyp.gsrc.io/docs/UserDocumentation.md)
 * [gyp input format reference](https://gyp.gsrc.io/docs/InputFormatReference.md)
 * [*"binding.gyp" files out in the wild* wiki page](https://github.com/nodejs/node-gyp/wiki/%22binding.gyp%22-files-out-in-the-wild)


Commands
--------

`node-gyp` responds to the following commands:

| **Command**   | **Description**
|:--------------|:---------------------------------------------------------------
| `help`        | Shows the help dialog
| `build`       | Invokes `make`/`msbuild.exe` and builds the native addon
| `clean`       | Removes the `build` directory if it exists
| `configure`   | Generates project build files for the current platform
| `rebuild`     | Runs `clean`, `configure` and `build` all in a row
| `install`     | Installs node header files for the given version
| `list`        | Lists the currently installed node header versions
| `remove`      | Removes the node header files for the given version


Command Options
--------

`node-gyp` accepts the following command options:

| **Command**                       | **Description**
|:----------------------------------|:------------------------------------------
| `-j n`, `--jobs n`                | Run make in parallel
| `--target=v6.2.1`                 | Node version to build for (default=process.version)
| `--silly`, `--loglevel=silly`     | Log all progress to console
| `--verbose`, `--loglevel=verbose` | Log most progress to console
| `--silent`, `--loglevel=silent`   | Don't log anything to console
| `debug`, `--debug`                | Make Debug build (default=Release)
| `--release`, `--no-debug`         | Make Release build
| `-C $dir`, `--directory=$dir`     | Run command in different directory
| `--thin=yes`                      | Enable thin static libraries
| `--arch=$arch`                    | Set target architecture (e.g. ia32)
| `--tarball=$path`                 | Get headers from a local tarball
| `--ensure`                        | Don't reinstall headers if already present
| `--dist-url=$url`                 | Download header tarball from custom URL
| `--proxy=$url`                    | Set HTTP proxy for downloading header tarball
| `--cafile=$cafile`                | Override default CA chain (to download tarball)
| `--nodedir=$path`                 | Set the path to the node binary
| `--msvs_version=$version`         | Set Visual Studio version (win)


License
-------

(The MIT License)

Copyright (c) 2016 Pavel Medvedev <pmedvedev@gmail.com>

Copyright (c) 2012 Nathan Rajlich <nathan@tootallnate.net>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
