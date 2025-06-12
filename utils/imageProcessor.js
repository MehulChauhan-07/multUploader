const sharp = require('sharp');
const path = require('path');

async function processImage(filePath, options = {}) {
    const { width = 800, quality = 80, format = 'jpeg' } = options;

    const fileInfo = path.parse(filePath);
    const outputPath = path.join(
        fileInfo.dir,
        `${fileInfo.name}-processed${fileInfo.ext}`
    );

    await sharp(filePath)
        .resize(width)
        .toFormat(format, { quality })
        .toFile(outputPath);

    return outputPath;
}

module.exports = { processImage };