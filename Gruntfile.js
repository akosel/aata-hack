'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      files: ['public/js/*.js', '!public/js/*min.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.registerTask('default', 'jshint');
};
