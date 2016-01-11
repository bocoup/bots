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
      }
    },
    clean: {
      build: 'build',
    },
    watch: {
      options: {
        spawn: false,
      },
      babel: {
        files: ['src/**/*.js'],
        tasks: ['build', 'kill', 'start'],
      }
    }
  });

  var proc;
  grunt.registerTask('start', function() {
    proc = spawn('node', ['build/index'], {stdio: 'inherit'});
  });

  grunt.registerTask('kill', function() {
    proc.kill('SIGKILL');
  });

  grunt.registerTask('build', ['clean', 'babel']);
  grunt.registerTask('default', ['build', 'start', 'watch']);

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
};
