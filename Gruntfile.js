'use strict';

var spawn = require('child_process').spawn;

module.exports = function(grunt) {

  grunt.initConfig({
    babel: {
      options: {
        sourceMap: 'inline',
        presets: ['es2015'],
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
          'src/lib/db.js',
          'src/lib/slack.js',
          'src/lib/token.js',
          'src/robocoup/index.js',
          'src/robocoup/commands/expertise.js',
        ],
      },
      root: {
        options: {
          configFile: '.eslintrc-node.yaml',
        },
        src: '*.js',
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
    watch: {
      options: {
        spawn: false,
      },
      src: {
        // files: ['<%= eslint.src.src %>'],
        files: ['src/**/*'],
        tasks: ['eslint:src', 'build', 'kill', 'start'],
      },
      root: {
        files: ['<%= eslint.root.src %>'],
        tasks: ['eslint:root'],
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

  grunt.registerTask('test', ['eslint']);
  grunt.registerTask('build', ['clean', 'babel', 'copy']);
  grunt.registerTask('default', ['build', 'start', 'watch']);

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-eslint');
};
