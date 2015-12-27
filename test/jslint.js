/*jslint es6, node, maxlen: 80 */

'use strict';

const lint = require('./lint.js');
const jslinter = require('jslinter');

const files = [
    'test/test.js',
    'test/lint.js',
    'test/jslint.js',
    'test/csslint.js',
    'test/htmlhint.js',
    'test/w3cjs.js',

    'src/background.js',
    'src/content-script.js',
    'src/popup.js',
    'src/manifest.json',

    '.htmlhintrc',
    'package.json'
];

function lintAndLogWarnings(data, logWarnings) {
    const warnings = jslinter(data).warnings;
    logWarnings(warnings);
}

function logWarning(warning) {
    console.log(`    line ${warning.line} column ${warning.column}
        ${warning.message}`);
}

console.log("Running JSLint...");

lint({
    files: files,
    lintAndLogWarnings: lintAndLogWarnings,
    logWarning: logWarning
});
