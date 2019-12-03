const spawn = require('child_process').spawn;
const fs = require('fs')
const path = require('path')

function FFMpeg() {

}

FFMpeg.prototype.convert = function (inFolder, outFolder) {
    return new Promise(function (resolve, reject) {
        let args = [];
        let fileNames = fs.readdirSync(inFolder);
        if (!fs.existsSync(outFolder)) {
            fs.mkdirSync(outFolder);
        } else {
            console.log(`${outFolder} path already exists`);
        }
        while (fileNames.length > 0) {
            let fileName = fileNames.pop();
            let p = path.join(outFolder, fileName);
            let i = path.join(inFolder, fileName);
            if (fs.lstatSync(i).isDirectory()) {
                if (!fs.existsSync(p)) {
                    fs.mkdirSync(p);
                } else {
                    console.log(`${p} path already exists`);
                }
                let insideFolderFiles = fs.readdirSync(i);
                for (let insideFile of insideFolderFiles){
                    fileNames.push(path.join(i, insideFile));
                }
            }
            console.log();
        }
        for (let fileName of fileNames) {
            let nameWithoutExt = fileName.split('.')[0];
            args.push('-i'); args.push(path.join(inFolder, `/${fileName}`)); args.push(path.join(outFolder, `/${nameWithoutExt}.mp3`));
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
}
module.exports = FFMpeg;