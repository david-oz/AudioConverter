const FFMpeg = require('./lib/ffmpeg_wrapper');
const Extractor = require('./lib/extractor');
const path = require('path');
const desktopPath = path.join(process.env['USERPROFILE'], '/Desktop');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fileUpload = require('express-fileupload')
const { promisify } = require('util');


let runConversion = async () => {
    let ffmpeg = new FFMpeg();
    try {
        let res = await ffmpeg.start(path.join(__dirname + '/input'), path.join(__dirname, '/output'));
        console.log(res);
    } catch (ex) {
        console.log(ex);
    }
};

app.use(fileUpload())

app.use(express.static(path.join(__dirname, '/webPages')))

app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/webPages/page.html'));
});

app.post('/uploadFile', async function (req, res) {
    if (!req.files) {
        return res.status(400).send('No files were uploaded.')
    }

    let file = req.files.myFile
    let mvAsync = promisify(file.mv);
    let fileType;

    let extractor = new Extractor();

    try {
        fileType = path.extname(file.name);
        if (fileType !== '.zip') {
            throw Error(`Unsupported file type: ${fileType}`)
        }
        let fileNoExt = file.name.split('.')[0];
        let ts = Math.ceil(new Date().getTime() / 1000);
        let fileName = `${fileNoExt}_${ts}${fileType}`;
        let copiedFilePath = path.join(__dirname, '/uploadedFiles/', fileName);
        let outPath = path.join(__dirname, '/uploadedFiles/',`${fileNoExt}_${ts}`);
        await mvAsync(copiedFilePath);
        await extractor.extract(copiedFilePath, outPath);
    } catch (ex) {
        console.log(ex);
        return res.send(500);
    }
    res.redirect('/uploadSuccessPage.html')
})


app.listen(4000, () => {
    console.log('listening...');
})
// runExtraction();
// runConversion();
