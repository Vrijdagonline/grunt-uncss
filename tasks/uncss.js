/**
 * grunt-uncss
 * https://github.com/addyosmani/grunt-uncss
 *
 * Copyright (c) 2014 Addy Osmani
 * Licensed under the MIT license.
 */

'use strict';
var uncss  = require( 'uncss' ),
    chalk  = require( 'chalk' ),
    maxmin = require( 'maxmin' );

module.exports = function ( grunt ) {
    grunt.registerMultiTask( 'uncss', 'Remove unused CSS', function () {

        var done    = this.async(),
            options = this.options({
                report: 'min'
            });

        options.urls = options.urls || [];

        this.files.forEach(function ( file ) {

            var src = file.src.filter(function ( filepath ) {
                // Warn on and remove invalid source files (if nonull was set).
                if ( !grunt.file.exists( filepath ) ) {
                    grunt.log.warn( 'Source file ' + chalk.cyan( filepath ) + ' not found.' );
                    return false;
                } else {
                    return true;
                }
            });

            if ( src.length === 0 && file.orig.src.length === 0 ) {
                grunt.fail.warn( 'Destination (' + file.dest + ') not written because src files were empty.' );
            }

            try {
                uncss( src, options, function ( error, output, report ) {
                    if ( error ) {
                        throw error;
                    }

                    // Why `report` is `undefined` when `.uncssrc` is used???
                    console.log('report.original.length', report.original.length);
                    var max = report && report.original !== 'undefined' ? report.original : '';
                    grunt.file.write( file.dest, output );
                    grunt.log.writeln('File ' + chalk.cyan( file.dest ) + ' created: ' + maxmin( max, output, options.report === 'gzip' ) );

                    done();
                });
            } catch ( e ) {
                var err = new Error( 'Uncss failed.' );
                if ( e.msg ) {
                    err.message += ', ' + e.msg + '.';
                }
                err.origError = e;
                grunt.log.warn( 'Uncssing source "' + src + '" failed.' );
                grunt.fail.warn( err );
            }


        });

    });

};
