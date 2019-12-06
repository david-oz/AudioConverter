const spawn = require('child_process').spawn;

const SEVEN_ZIP_PATH = "C:\\Program Files\\7-Zip\\7z.exe";

function SevenZWrapper() {

}


SevenZWrapper.prototype.extract = function (inFolder, outFolder) {
    return new Promise(function (resolve, reject) {
        const prc = spawn(SEVEN_ZIP_PATH, ['x', inFolder, `-o${outFolder}`]);
        
        prc.on('error', (error) => {
            return reject(error);
        });

        prc.on('close', (code) => {
            if (code === 0) {
                return resolve(true);
            } else {
                return reject('7z.exe process exited with code = 1');
            }
        });
    });
}





module.exports = SevenZWrapper;
