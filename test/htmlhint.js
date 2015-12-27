/*jslint es6, node, maxlen: 80 */

'use strict';

const fs = require('fs');
const lint = require('./lint.js');
const htmlHint = require('htmlhint').HTMLHint;

const files = [
    'src/popup.html'
];

function logWarning(warning) {
    console.log(`    line ${warning.line} column ${warning.col}
        ${warning.message}`);
}

function parseRulesAndLintFiles(err, rulesAsData) {
    if (err) {
        throw err;
    }

    const rules = JSON.parse(rulesAsData);

    function lintAndLogWarnings(data, logWarnings) {
        const warnings = htmlHint.verify(data, rules);
        logWarnings(warnings);
    }

    lint({
        files: files,
        lintAndLogWarnings: lintAndLogWarnings,
        logWarning: logWarning
    });
}

console.log("Running HTMLHint...");

fs.readFile('.htmlhintrc', 'utf8', parseRulesAndLintFiles);
