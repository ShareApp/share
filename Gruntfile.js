// Grunt configuration file. It manages processes of building and deploying application.
'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT });
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  // tasks related to app translations
  grunt.loadNpmTasks('grunt-angular-translate');
  // tasks which generate relevant documentation
  grunt.loadNpmTasks('grunt-docular');
  grunt.loadNpmTasks('grunt-ngdocs');


  var yeomanConfig = {
    app: 'shareApp/app',
    dist: 'cloudCode/public'
  };

  try {
    yeomanConfig.app = require('shareApp/bower.json').appPath || yeomanConfig.app;
  } catch (e) {
  }

  grunt.initConfig({
    // configuration of task which generates documentation
    ngdocs: {
      options: {
        dest: 'docs/build/',
        html5Mode: false,
        startPage: '/api',
        title: 'Share❣',
        titleLink: "/api"
      },
      api: {
        src: ['docs/src/api/*.ngdoc', '<%= yeoman.app %>/scripts/**/*.js', 'cloudCode/cloud/**/*.js'],
        title: 'API Documentation'
      }
    },
    yeoman: yeomanConfig,
    watch: {
      coffee: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
        tasks: ['coffee:dist']
      },
      coffeeTest: {
        files: ['test/spec/{,*/}*.coffee'],
        tasks: ['coffee:test']
      },
      compass: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass']
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
          '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
          '{.tmp,<%= yeoman.app %>}/scripts/lib/PersistentParseOffline/ppo.js',
          '<%= yeoman.app %>/img/{,*/}*.{png,jpg,jpeg,gif,webp,svg,ico}'
        ]
      }
    },
    // configuration for task which manages translation files
    i18nextract: {
      default_options: {
        // change here to add new languages
        lang: ['en_EN', 'pl_PL', 'ja_JP', 'it_IT', 'ru_RU', 'tr_TR', 'es_ES'],
        src: ['<%= yeoman.app %>/views/*.html', '<%= yeoman.app %>/scripts/*/*.js', '<%= yeoman.app %>/scripts/app.js', '<%= yeoman.app %>/scripts/globals.js', ],
        prefix: 'lang_',
        suffix: '.js',
        dest: '<%= yeoman.app %>/i18n'
      }
    },
    connect: {
      options: {
        port: 9000,
        hostname: '0.0.0.0'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, yeomanConfig.app)
            ];
          }
        }
      },
      test: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'test')
            ];
          }
        }
      },
      dist: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, yeomanConfig.dist)
            ];
          }
        }
      }
    },
    open: {
      server: {
        // change following line to modify domain used for local development
        url: 'http://share.test:<%= connect.options.port %>'
      }
    },
    clean: {
      dist: {
        files: [
          {
            dot: true,
            src: [
              '.tmp',
              '<%= yeoman.dist %>/*',
              '!<%= yeoman.dist %>/.git*'
            ]
          }
        ]
      },
      server: '.tmp'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js'
      ]
    },
    coffee: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>/scripts',
            src: '{,*/}*.coffee',
            dest: '.tmp/scripts',
            ext: '.js'
          }
        ]
      },
      test: {
        files: [
          {
            expand: true,
            cwd: 'test/spec',
            src: '{,*/}*.coffee',
            dest: '.tmp/spec',
            ext: '.js'
          }
        ]
      }
    },
    // compass configuration
    compass: {
      options: {
        sassDir: '<%= yeoman.app %>/styles',
        cssDir: '<%= yeoman.app %>/styles',
        imagesDir: '<%= yeoman.app %>/img',
        javascriptsDir: '<%= yeoman.app %>/scripts',
        fontsDir: '<%= yeoman.app %>/styles/fonts',
        importPath: '<%= yeoman.app %>/bower_components',
        relativeAssets: true
      },
      dist: {},
      server: {
        options: {
          debugInfo: true
        }
      }
    },
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    },
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },
    usemin: {
      html: ['<%= yeoman.dist %>/views/{,*/}*.html', '<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        dirs: ['<%= yeoman.dist %>']
      }
    },
    imagemin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>/img',
            src: '{,*/}*.{png,jpg,jpeg,ico}',
            dest: '<%= yeoman.dist %>/img'
          }
        ]
      }
    },
    cssmin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>/styles',
            src: ['{,*/}*.css', '!*.min.css'],
            dest: '<%= yeoman.dist %>/styles'
          }
        ]
      }
    },
    htmlmin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>',
            src: ['*.html', 'views/*.html'],
            dest: '<%= yeoman.dist %>'
          }
        ]
      }
    },
    // Put files not handled in other tasks here
    copy: {
      dist: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= yeoman.app %>',
            dest: '<%= yeoman.dist %>',
            src: [
              '*.{ico,png,txt,appcache}',
              '.htaccess',
              'bower_components/**/*',
              'img/{,*/}*.{gif,webp,svg,ico}',
              'styles/fonts/*',
              'i18n/*',
              'settings.js'
            ]
          },
          {
            expand: true,
            cwd: '.tmp/img',
            dest: '<%= yeoman.dist %>/img',
            src: [
              'generated/*'
            ]
          }
        ]
      }
    },
    concurrent: {
      server: [
        'coffee:dist'
      ],
      test: [
        'coffee'
      ],
      dist: [
        'coffee',
        'imagemin',
        'htmlmin'
      ]
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },
    ngmin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.dist %>/scripts',
            src: '*.js',
            dest: '<%= yeoman.dist %>/scripts'
          }
        ]
      }
    },
    uglify: {
      dist: {
        files: {
          '<%= yeoman.dist %>/scripts/scripts.js': [
            '<%= yeoman.dist %>/scripts/scripts.js'
          ]
        }
      }
    }
  });

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'compass:server',
      'concurrent:server',
      'connect:livereload',
      'open',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'compass',
    'concurrent:test',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'compass:dist',
    'useminPrepare',
    'concurrent:dist',
    'concat',
    'copy',
    'cdnify',
    'ngmin',
    'cssmin',
    'uglify',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'test',
    'build',
    'docular'
  ]);

};



