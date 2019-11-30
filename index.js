const FFMpeg = require('./lib/ffmpeg_wrapper');
const path = require('path');

let foo = async () => {
    let ffmpeg = new FFMpeg();
    try {
        let res = await ffmpeg.start(path.join(__dirname + '/input'), path.join(__dirname, '/output'));
        console.log(res);
    } catch (ex) {
        console.log(ex);
    }
};
foo();
