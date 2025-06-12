const clamdClient = require('clamav.js');
const fs = require('fs');

const clamav = clamdClient.createScanner('127.0.0.1', 3310);

function scanFile(filePath) {
    return new Promise((resolve, reject) => {
        clamav.scan_file(filePath, (err, object, virus) => {
            if (err) {
                return reject(err);
            }

            if (virus) {
                fs.unlinkSync(filePath); // Delete infected file
                return reject(new Error(`Virus detected: ${virus}`));
            }

            resolve(true);
        });
    });
}

module.exports = { scanFile };