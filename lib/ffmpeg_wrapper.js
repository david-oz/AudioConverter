const spawn = require('child_process').spawn;
const fs = require('fs')
const path = require('path')

function FFMpeg() {

}


FFMpeg.prototype.convert = function (inFolder, outFolder) {
    return new Promise(function (resolve, reject) {
        let args = [];
        if (!fs.existsSync(outFolder)) {
            fs.mkdirSync(outFolder);
        } else {
            console.log(`${outFolder} path already exists`);
        }
        let files = [];
        getFiles(files, inFolder, outFolder);
        for (let file of files) {
            args.push('-i'); args.push(file.inPath); args.push(file.outPath);
        }
        const prc = spawn('ffmpeg.exe', args);
        prc.on('error', (error) => {
            return reject(error);
        });

        prc.on('close', (code) => {
            if (code === 0) {
                return resolve(true);
            } else {
                return reject('ffmpeg process exited with code = 1');
            }
        });
    });

    function getFiles(arr, inFolder, outFolder) {
        let fileNames = fs.readdirSync(inFolder);
        for (fileName of fileNames) {
            let outPath = path.join(outFolder, fileName);
            let inPath = path.join(inFolder, fileName);
            if (fs.lstatSync(inPath).isDirectory()) {
                if (!fs.existsSync(outPath)) {
                    fs.mkdirSync(outPath);
                } else {
                    console.log(`${outPath} path already exists`);
                }
                getFiles(arr, inPath, outPath);
            } else {
                arr.push({ outPath, inPath });
            }
        }
    }
}





module.exports = FFMpeg;