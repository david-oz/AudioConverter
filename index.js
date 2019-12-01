const FFMpeg = require('./lib/ffmpeg_wrapper');
const Extractor = require('./lib/extractor');
const path = require('path');
const desktopPath = path.join(process.env['USERPROFILE'], '/Desktop');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fileUpload = require('express-fileupload')
const { promisify } = require('util');
const fs = require('fs');

app.use(fileUpload())

app.use(express.static(path.join(__dirname, '/webPages')))

app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/webPages/page.html'));
});

app.post('/uploadFile', async function (req, res) {
    if (!req.files) {
        return res.status(400).send('לא נבחרו קבצים')
    }

    let file = req.files.myFile
    let mvAsync = promisify(file.mv);
    let fileType;

    let extractor = new Extractor();
    let ffmpeg = new FFMpeg();
    let copiedFilePath;
    let extractionOutPath;

    try {
        fileType = path.extname(file.name);
        if (fileType !== '.zip') {
            throw Error(`Unsupported file type: ${fileType}`)
        }
        let fileNoExt = file.name.split('.')[0];
        let ts = Math.ceil(new Date().getTime() / 1000);
        let fileName = `${fileNoExt}_${ts}${fileType}`;
        copiedFilePath = path.join(__dirname, '/uploadedFiles/', fileName);
        extractionOutPath = path.join(__dirname, '/uploadedFiles/', `${fileNoExt}_${ts}`);
        let conversionOutPath = path.join(desktopPath, `${fileNoExt}_${ts}`);
        await mvAsync(copiedFilePath);
        await extractor.extract(copiedFilePath, extractionOutPath);
        if (!fs.existsSync(conversionOutPath)) {
            fs.mkdirSync(conversionOutPath);
        } else {
            console.log(`${conversionOutPath} path already exists`);
        }
        await ffmpeg.convert(extractionOutPath, conversionOutPath);
    } catch (ex) {
        console.log(ex);
        return res.redirect('/error.html');
    } finally {
        try {
            fs.unlinkSync(copiedFilePath);
            //fs.unlinkSync(extractionOutPath);
            deleteFolderRecursive(extractionOutPath);
        } catch (ex) {
            console.log(ex);
            return res.redirect('/error.html');
        }
    }
    res.redirect('/uploadSuccessPage.html')
})

let deleteFolderRecursive = function(path) {
    if( fs.existsSync(path) ) {
      fs.readdirSync(path).forEach(function(file,index){
        var curPath = path + "/" + file;
        if(fs.lstatSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  };

app.listen(4000, () => {
    console.log('listening...');
})
// runExtraction();
// runConversion();
