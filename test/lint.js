/*jslint es6, node, maxlen: 80 */

'use strict';

const fs = require('fs');

function readAndLintFiles(settings) {
    function readAndLintFile(file) {
        function logWarnings(warnings) {
            if (warnings.length > 0) {
                console.log();
                console.log(file);
                process.exitCode = 1;
            }
            warnings.forEach(settings.logWarning);
        }

        function lintFile(err, data) {
            if (err) {
                throw err;
            }
            settings.lintAndLogWarnings(data, logWarnings);
        }

        fs.readFile(file, 'utf8', lintFile);
    }

    settings.files.forEach(readAndLintFile);
}

module.exports = readAndLintFiles;
