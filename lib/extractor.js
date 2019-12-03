const extractZip = require('extract-zip')
const path = require('path');
const Unrar = require('unrar')
const fs = require('fs')
const mkdirp = require('mkdirp');
const getDirName = require('path').dirname;
const { promisify } = require('util');

function Extractor() {

}

Extractor.prototype.extract = async function (filePath, outPath) {
    return new Promise(async function (resolve, reject) {
        let mkdirpAsync = promisify(mkdirp);
        let extractZipAsync = promisify(extractZip);
        let fileType = path.extname(filePath);
        if (fileType === '.zip') {
            try {
                await extractZipAsync(filePath, { dir: outPath });
            } catch (ex) {
                return reject(ex);
            }
            return resolve();
        } else if (fileType === '.rar') {
            let archive = new Unrar(filePath);
            archive.list(async (err, entries) => {
                for (let entry of entries) {
                    let stream = archive.stream(entry.name);
                    let dirName = path.join(outPath, entry.name);
                    try {
                        await mkdirpAsync(getDirName(dirName));
                        fs.writeFileSync(dirName, stream);
                    } catch (ex) {
                        continue;
                    }
                }
                return resolve();
            });
        }
    });
}

module.exports = Extractor;