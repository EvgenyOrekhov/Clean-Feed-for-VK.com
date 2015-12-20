/*jslint es6, node, maxlen: 80 */

'use strict';

const fs = require('fs');
const cssLint = require('csslint').CSSLint;

const files = [
    'popup.css'
];

function readFile(file) {
    function logWarning(warning) {
        console.log(`${file} line ${warning.line} column ${warning.col}:
    ${warning.message}`);
    }

    function lintFile(err, data) {
        if (err) {
            throw err;
        }
        const result = cssLint.verify(data);
        if (result.messages.length > 0) {
            process.exitCode = 1;
        }
        result.messages.forEach(logWarning);
    }

    fs.readFile(file, 'utf8', lintFile);
}

console.log("Running CSS Lint...");

files.forEach(readFile);
