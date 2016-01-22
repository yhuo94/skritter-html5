var application = require('./package.json');

exports.config = {
    files: {
        javascripts: {
            joinTo: {
                'js/application.js': /^app[\\/]/,
                'js/libraries.js': /^(bower_components|vendor)[\\/]/,
                'js/startup.js': /^startup[\\/]/,
                'js/test.js': /^test[\\/]/
            },
            order: {
                before: [
                    'vendor/gelato-0.2.0.js',
                    'vendor/bootstrap-3.3.6.js',
                    'vendor/d3-3.5.13.js',
                    'vendor/async-1.5.2.js',
                    'vendor/chai-3.4.2.js',
                    'vendor/createjs.easel-0.8.2.js',
                    'vendor/createjs.tween-0.6.2.js',
                    'vendor/dexie-1.2.0.js',
                    'vendor/mocha-2.3.4.js',
                    'vendor/moment-2.11.1.js',
                    'vendor/moment.timezone-0.5.0.js',
                    'vendor/jquery.mobile-1.4.5.js',
                    'vendor/jquery.ui-1.11.4.js',
                    'vendor/bootstrap.datetimepicker-4.15.37.js',
                    'vendor/bootstrap.notify-3.1.5.js',
                    'vendor/bootstrap.switch-3.3.2.js',
                    'vendor/heatmap-3.5.4.js',
                    'vendor/highcharts-4.2.1.js',
                    'vendor/keypress-2.1.3.js',
                    'vendor/wanakana-1.3.7.js'
                ]
            }
        },
        stylesheets: {
            joinTo: {
                'styles/application.css': /^app[\\/]/,
                'styles/libraries.css': /^(bower_components|vendor)[\\/]/,
                'styles/startup.css': /^startup[\\/]/,
                'styles/test.css': /^test[\\/]/
            }
        },
        templates: {
            joinTo: {
                'js/application.js': /^app[\\/]/,
                'js/startup.js': /^startup[\\/]/
            }
        }
    },
    paths: {
        'public': 'public',
        'watched': ['app', 'startup', 'test', 'vendor']
    },
    plugins: {
        replace: {
            mappings: {
                'application-description': application.description,
                'application-title': application.title,
                'application-version': application.version
            },
            paths: [
                'public/js/application.js',
                'public/js/libraries.js',
                'public/js/startup.js',
                'public/styles/application.css',
                'public/styles/libraries.css',
                'public/styles/startup.css'
            ]
        }
    }
};
