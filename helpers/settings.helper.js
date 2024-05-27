const path = require('path');
const fs = require('fs');
let settingsFile = path.join(__dirname, '../settings.json');


exports.getSettings = (key) => {
    try {
        const data = fs.readFileSync(settingsFile);
        const settings = JSON.parse(data);
        return (key ? settings[key] : settings);
    } catch (err) {
        console.error('Error reading settings file:', err.message);
        return null;
    }
}


exports.setSettings = (newSettings) => {
    try {
        const data = fs.readFileSync(settingsFile);
        let settings = JSON.parse(data);
        for (let key in newSettings) {
            if (settings.hasOwnProperty(key)) settings[key] = newSettings[key];
            else settings[key] = newSettings[key];
        }

        fs.writeFileSync(settingsFile, JSON.stringify(settings));
        return {
            code: 200,
            result: settings,
            success: true
        };

    } catch (err) {
        console.log('Error setting settings file:', err);
        return {
            code: 500,
            error: err.message,
            success: false
        };
    }
}


exports.listSettings = async () => {
    try {
        const data = fs.readFileSync(settingsFile);
        const settings = JSON.parse(data);
        return {
            code: 200,
            result: settings,
            success: true
        };

    } catch (err) {
        console.log('Error reading settings file:', err);
        return {
            code: 500,
            error: err.message,
            success: false
        };
    }
}

