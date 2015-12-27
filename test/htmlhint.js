/*jslint es6, node, maxlen: 80 */

'use strict';

const lint = require('./lint.js');
const htmlHint = require('htmlhint').HTMLHint;
const rules = require('./htmlhintrc.json');

const files = [
    'src/popup.html'
];

function lintAndLogWarnings(data, logWarnings) {
    const warnings = htmlHint.verify(data, rules);
    logWarnings(warnings);
}

function logWarning(warning) {
    console.log(`    line ${warning.line} column ${warning.col}
        ${warning.message}`);
}

console.log("Running HTMLHint...");

lint({
    files: files,
    lintAndLogWarnings: lintAndLogWarnings,
    logWarning: logWarning
});
