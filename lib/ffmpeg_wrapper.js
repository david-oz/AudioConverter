const spawn = require('child_process').spawn;
const fs = require('fs')
const path = require('path')

function FFMpeg (){

}

FFMpeg.prototype.start = function (inFolder, outFolder) {
    return new Promise(function (resolve, reject) {
        let args = [];
        let fileNames = fs.readdirSync(inFolder);
        for (let fileName of fileNames){
            let nameWithoutExt = fileName.split('.')[0];
            args.push('-i'); args.push(path.join(inFolder, `/${fileName}`)); args.push(path.join(outFolder, `/${nameWithoutExt}.mp3`));
        }
        const pr = spawn('ffmpeg.exe', args);
        pr.on('error', (error)=> {
            console.log(error);
            return reject();
        });

        pr.on('close', (code)=>{
            if (code === 0){
                return resolve(true);
            } else{
                return reject();
            }
        });
    });
}
module.exports = FFMpeg;