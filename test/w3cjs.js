/*jslint es6, node, maxlen: 80 */

'use strict';

const fs = require('fs');
const w3cjs = require('w3cjs');

const files = [
    'popup.html'
];

function readFile(file) {
    function logWarning(warning) {
        console.log();
        console.log(`${file}:`);
        console.log(warning);
    }

    function logWarnings(result) {
        const warnings = result.messages.filter(
            (message) => message.type === 'error'
        );
        if (warnings.length > 0) {
            process.exitCode = 1;
        }
        warnings.forEach(logWarning);
    }

    function lintFile(err, data) {
        if (err) {
            throw err;
        }
        w3cjs.validate({
            input: data,
            callback: logWarnings
        });
    }

    fs.readFile(file, 'utf8', lintFile);
}

console.log("Running w3cjs...");

files.forEach(readFile);
