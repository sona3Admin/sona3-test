const path = require('path');
const fs = require('fs');
let teirsFile = path.join(__dirname, '../teirs.json');


exports.getTeirs = (key) => {
    try {
        const data = fs.readFileSync(teirsFile);
        const teirs = JSON.parse(data);
        return (key ? teirs[key] : teirs);
    } catch (err) {
        console.error('Error reading teirs file:', err.message);
        return null;
    }
}


exports.listTeirs = async () => {
    try {
        const data = fs.readFileSync(teirsFile);
        const teirs = JSON.parse(data);
        return {
            code: 200,
            result: teirs,
            success: true
        };

    } catch (err) {
        console.log('Error reading teirs file:', err);
        return {
            code: 500,
            error: err.message,
            success: false
        };
    }
}

