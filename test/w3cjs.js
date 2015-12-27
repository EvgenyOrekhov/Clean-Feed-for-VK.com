/*jslint es6, node, maxlen: 80 */

'use strict';

const lint = require('./lint.js');
const w3cjs = require('w3cjs');

const files = [
    'src/popup.html'
];

function lintAndLogWarnings(data, logWarnings) {
    function filterAndLogWarnings(result) {
        const warnings = result.messages.filter(
            (message) => message.type === 'error'
        );
        logWarnings(warnings);
    }

    w3cjs.validate({
        input: data,
        callback: filterAndLogWarnings
    });
}

function logWarning(warning) {
    console.log(warning);
}

console.log("Running w3cjs...");

lint({
    files: files,
    lintAndLogWarnings: lintAndLogWarnings,
    logWarning: logWarning
});
