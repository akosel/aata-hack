'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      files: ['public/js/*.js', '!public/js/*min.js']
    },

    sass: {
      dist: {
        files: {
          'public/css/stylesheet.css': 'public/css/stylesheet.scss'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.registerTask('default', ['jshint', 'sass']);
};
