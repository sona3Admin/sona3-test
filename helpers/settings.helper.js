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
        return settings;

    } catch (error) {
        console.error('Error updating settings file:', error);
        return null;
    }
}


exports.listSettings = async () => {
    try {
        const data = fs.readFileSync(settingsFile);
        const settings = JSON.parse(data);
        return settings;
        
    } catch (error) {
        console.error('Error reading settings file:', error);
        return null;
    }
}

