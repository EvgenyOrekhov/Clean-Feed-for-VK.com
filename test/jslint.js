/*jslint es6, node, maxlen: 80 */

'use strict';

const fs = require('fs');
const jslinter = require('jslinter');

const files = [
    'test/jslint.js',
    'test/csslint.js',
    'test/htmlhint.js',
    'test/w3cjs.js',
    'background.js',
    'content-script.js',
    'popup.js',
    'manifest.json',
    'package.json'
];

function readFile(file) {
    function logWarning(warning) {
        console.log(`${file} line ${warning.line} column ${warning.column}:
    ${warning.message}`);
    }

    function lintFile(err, data) {
        if (err) {
            throw err;
        }
        const result = jslinter(data);
        if (!result.ok) {
            process.exitCode = 1;
        }
        result.warnings.forEach(logWarning);
    }

    fs.readFile(file, 'utf8', lintFile);
}

console.log("Running JSLint...");

files.forEach(readFile);
