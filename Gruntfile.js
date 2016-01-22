'use strict';

var spawn = require('child_process').spawn;

module.exports = function(grunt) {

  grunt.initConfig({
    babel: {
      options: {
        sourceMap: 'inline',
        plugins: ['transform-runtime'],
      },
      build: {
        src: '**/*.js',
        expand: true,
        cwd: 'src',
        dest: 'build',
      },
    },
    eslint: {
      src: {
        options: {
          configFile: '.eslintrc-es2015.yaml',
        },
        // src: 'src/**/*.js',
        src: [
          'src/index.js',
          'src/lib/args.js',
          'src/lib/bot.js',
          'src/lib/db.js',
          'src/lib/slack.js',
          'src/thanksbot/**',
          'src/robocoup/index.js',
          'src/robocoup/commands/expertise.js',
          'src/robocoup/commands/help.js',
        ],
      },
      root: {
        options: {
          configFile: '.eslintrc-node.yaml',
        },
        src: '*.js',
      },
      test: {
        options: {
          configFile: '.eslintrc-mocha.yaml',
        },
        src: 'test/**/*.js',
      },
    },
    clean: {
      build: 'build',
    },
    copy: {
      build: {
        expand: true,
        cwd: 'src',
        src: ['db/**/*'],
        dest: 'build',
      },
    },
    mochaTest: {
      unit: {
        options: {
          reporter: 'spec',
          quiet: false,
          clearRequireCache: true,
          require: [
            'babel-register',
            'test/globals',
          ],
        },
        src: 'test/lib/*.js',
      },
    },
    watch: {
      options: {
        spawn: false,
      },
      config: {
        files: ['config.js'],
        tasks: ['kill', 'start'],
      },
      src: {
        // files: ['<%= eslint.src.src %>'],
        files: ['src/**/*'],
        tasks: ['eslint:src', 'mochaTest', 'build', 'kill', 'start'],
      },
      root: {
        files: ['<%= eslint.root.src %>'],
        tasks: ['eslint:root'],
      },
      test: {
        files: ['<%= eslint.test.src %>'],
        tasks: ['eslint:test', 'mochaTest'],
      },
      lint: {
        options: {
          reload: true,
        },
        files: ['.eslintrc*', 'eslint/*'],
        tasks: ['eslint'],
      },
    },
  });

  grunt.registerTask('start', function() {
    global._BOT = spawn('node', ['build/index'], {stdio: 'inherit'});
  });

  grunt.registerTask('kill', function() {
    global._BOT.kill('SIGKILL');
  });

  grunt.registerTask('test', ['eslint', 'mochaTest']);
  grunt.registerTask('build', ['clean', 'babel', 'copy']);
  grunt.registerTask('default', ['build', 'start', 'watch']);

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-eslint');
};
