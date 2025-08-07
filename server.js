const express = require('express');
const multer = require('multer');
const docxPdf = require('docx-pdf');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/convert', upload.single('wordFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const inputPath = req.file.path;
    const outputPath = inputPath + '.pdf';

    docxPdf(inputPath, outputPath, (err) => {
        if (err) {
            fs.unlinkSync(inputPath);
            return res.status(500).send('Conversion error');
        }
        res.download(outputPath, 'converted.pdf', (err) => {
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
