
module.exports = exports = build

/**
 * Module dependencies.
 */

var fs = require('graceful-fs')
  , path = require('path')
  , log = require('npmlog')
  , which = require('which')
  , processRelease = require('./process-release')
  , win = process.platform == 'win32'

exports.usage = 'Invokes `ninja` and builds the module'

function build (gyp, argv, callback) {
  var release = processRelease(argv, gyp, process.version, process.release)
    , command = gyp.opts.ninja || process.env.NINJA || 'ninja'
    , buildDir = path.resolve('build')
    , configPath = path.resolve(buildDir, 'config.gypi')
    , jobs = gyp.opts.jobs || process.env.JOBS
    , buildType
    , config
    , arch
    , nodeDir
    , vcDir
    , copyDevLib

  loadConfigGypi()

  /**
   * Load the "config.gypi" file that was generated during "configure".
   */

  function loadConfigGypi () {
    fs.readFile(configPath, 'utf8', function (err, data) {
      if (err) {
        if (err.code == 'ENOENT') {
          callback(new Error('You must run `node-gyp configure` first!'))
        } else {
          callback(err)
        }
        return
      }
      config = JSON.parse(data.replace(/\#.+\n/, ''))

      // get the 'arch', 'buildType', and 'nodeDir' vars from the config
      buildType = config.target_defaults.default_configuration
      arch = config.variables.target_arch
      nodeDir = config.variables.nodedir
      copyDevLib = config.variables.copy_dev_lib == 'true'

      if ('debug' in gyp.opts) {
        buildType = gyp.opts.debug ? 'Debug' : 'Release'
      }
      if (!buildType) {
        buildType = 'Release'
      }

      log.verbose('build type', buildType)
      log.verbose('architecture', arch)
      log.verbose('node dev dir', nodeDir)

      if (win) {
        findMSVS()
      } else {
        doWhich()
      }
    })
  }

  /**
   * On Windows, find Visual C++ toolset
   */

  function findMSVS () {
    var msvs_version = gyp.opts.msvs_version || 'auto'
    var vs_versions = (msvs_version === 'auto'? [14, 12, 10] : [msvs_version])
    vs_versions.find(function(version) {
      var vscomntools = process.env['VS' + version + '0COMNTOOLS']
      if (vscomntools) {
        // remove quotes to work with path.join()
        if (vscomntools.substr(0, 1) === '"' && vscomntools.substr(-1, 1) === '"') {
          vscomntools = vscomntools.substr(1, vscomntools.length - 2)
        }
        vcDir = path.join(vscomntools, '..', '..', 'VC')
        if (vcDir) {
          log.verbose('found Visual C++ in ', vcDir)
          return true
        }
      }
    })
    if (!vcDir) {
      callback(new Error('Visual C++ not found, please setup a C++ compiler toolset'))
    }
    doWhich()
  }

  /**
   * Uses node-which to locate the msbuild / make executable.
   */

  function doWhich () {
    // First make sure we have the build command in the PATH
    which(command, function (err, execPath) {
      if (err) {
        return callback(err)
      }
      log.verbose('`which` succeeded for `' + command + '`', execPath)
      doBuild()
    })
  }

  /**
   * Actually spawn the process and compile the module.
   */

  function doBuild () {

    // Enable Verbose build
    var verbose = log.levels[log.level] <= log.levels.verbose
    if (verbose) {
      argv.push('-v')
    }

    // Specify the build type, Release by default
    argv.push('-C', path.join('build', buildType))
    if (jobs) {
      var j = jobs.toUpperCase() === 'MAX'? require('os').cpus().length : parseInt(jobs, 10)
      if (!isNaN(j) && j > 0) {
        argv.push('-j' + j)
      }
    }
    var proc, env;

    // invoke vcvarsall.bat before build
    if (win && vcDir) {
      argv.unshift(arch === 'ia32'? 'x86' : arch, '&', command)
      command = path.join(vcDir, 'vcvarsall.bat')
    }

    proc = gyp.spawn(command, argv)
    proc.on('exit', onExit)
  }

  /**
   * Invoked after the make/msbuild command exits.
   */

  function onExit (code, signal) {
    if (code !== 0) {
      return callback(new Error('`' + command + '` failed with exit code: ' + code))
    }
    if (signal) {
      return callback(new Error('`' + command + '` got signal: ' + signal))
    }
    callback()
  }

}
