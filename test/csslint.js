/*jslint es6, node, maxlen: 80 */

'use strict';

const lint = require('./lint.js');
const cssLint = require('csslint').CSSLint;

const files = [
    'popup.css'
];

function lintAndLogWarnings(data, logWarnings) {
    const warnings = cssLint.verify(data).messages;
    logWarnings(warnings);
}

function logWarning(file, warning) {
    console.log(`${file} line ${warning.line} column ${warning.col}:
    ${warning.message}`);
}

console.log("Running CSS Lint...");

lint({
    files: files,
    lintAndLogWarnings: lintAndLogWarnings,
    logWarning: logWarning
});
