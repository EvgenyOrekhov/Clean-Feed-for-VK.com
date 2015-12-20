/*jslint es6, node, maxlen: 80 */

'use strict';

const fs = require('fs');
const htmlHint = require('htmlhint').HTMLHint;

const rules = {
    'tagname-lowercase': true,
    'attr-lowercase': true,
    'attr-value-double-quotes': true,
    'doctype-first': true,
    'tag-pair': true,
    'spec-char-escape': true,
    'id-unique': true,
    'src-not-empty': true,
    'attr-no-duplication': true,
    'head-script-disabled': true,
    'img-alt-require': true,
    'doctype-html5': true,
    'space-tab-mixed-disabled': 'space',
    'id-class-ad-disabled': true,
    'attr-unsafe-chars': true,
    'title-require': true,
    'alt-require': true,
    'id-class-value': 'dash',
    'style-disabled': true,
    'inline-style-disabled': true,
    'inline-script-disabled': true
};

const files = [
    'popup.html'
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
        const warnings = htmlHint.verify(data, rules);
        if (warnings.length > 0) {
            process.exitCode = 1;
        }
        warnings.forEach(logWarning);
    }

    fs.readFile(file, 'utf8', lintFile);
}

console.log("Running HTMLHint...");

files.forEach(readFile);
