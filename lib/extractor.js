const extractZip = require('extract-zip')
const path = require('path');

function Extractor() {

}

Extractor.prototype.extract = function (filePath, outPath) {
    return new Promise(function (resolve, reject) {
        extractZip(filePath, { dir: outPath }, (err) => {
            if (err) {
                return reject(err);
            } else {
                return resolve();
            }
        });
    });
}

module.exports = Extractor;