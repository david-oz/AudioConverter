const spawn = require('child_process').spawn;
const fs = require('fs')
const path = require('path')

function FFMpeg() {

}


FFMpeg.prototype.convert = async function (inFolder, outFolder) {
        if (!fs.existsSync(outFolder)) {
            fs.mkdirSync(outFolder);
        } else {
            console.log(`${outFolder} path already exists`);
        }
        let files = [];
        getFiles(files, inFolder, outFolder);
        for (let file of files) {
            let args = [];
            args.push('-i'); args.push(file.inPath);
            let ext = path.extname(file.outPath);
            let fileOutPath = file.outPath.replace(ext, '.mp3')
            args.push(fileOutPath);
            await this.convertFile(args);
        }
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
                let ext = path.extname(inPath);
                if (ext === '.mp3' || ext === '.wma') {
                    arr.push({ outPath, inPath });
                } else {
                    console.log(`skip unsupported type ${inPath}`);
                }
            }
        }
    }
}

FFMpeg.prototype.convertFile = function (args) {
    return new Promise(function (resolve, reject) {
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

}



module.exports = FFMpeg;