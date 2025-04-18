const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

const videoMap = {
    '1': '203678-922748476_tiny.mp4',
    '2': '270940_tiny.mp4'
};


app.use(express.static(path.join(__dirname, 'public')));

app.get('/video/:id', (req, res) => {
    const filename = videoMap[req.params.id];

    if (!filename) {
        return res.status(404).send('ID de video no encontrado');
    }

    const filePath = path.join(__dirname, 'media', filename);

    fs.stat(filePath, (err, stats) => {
        if (err) {
            return res.status(404).send('Archivo no encontrado');
        }

        const range = req.headers.range;
        if (!range) {
            return res.status(416).send('Se requiere cabecera Range');
        }

        const CHUNK_SIZE = 10 ** 6;
        const start = Number(range.replace(/\D/g, ''));
        const end = Math.min(start + CHUNK_SIZE, stats.size - 1);

        const contentLength = end - start + 1;
        const headers = {
            'Content-Range': `bytes ${start}-${end}/${stats.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': contentLength,
            'Content-Type': 'video/mp4',
        };

        res.writeHead(206, headers);
        const stream = fs.createReadStream(filePath, { start, end });
        stream.pipe(res);
    });
});


app.listen(PORT, () => {
    console.log(`Servidor de medios corriendo en http://localhost:${PORT}`);
});
