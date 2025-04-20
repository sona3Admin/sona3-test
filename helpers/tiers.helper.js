const path = require('path');
const fs = require('fs');
let tiersFile = path.join(__dirname, '../tiers.json');
const { logInTestEnv } = require("./logger.helper");


exports.getTiers = (key) => {
    try {
        const data = fs.readFileSync(tiersFile);
        const tiers = JSON.parse(data);
        return (key ? tiers[key] : tiers);
    } catch (err) {
        console.error('Error reading tiers file:', err.message);
        return null;
    }
}


exports.listTiers = async () => {
    try {
        const data = fs.readFileSync(tiersFile);
        const tiers = JSON.parse(data);
        return {
            code: 200,
            result: tiers,
            success: true
        };

    } catch (err) {
        logInTestEnv('Error reading tiers file:', err);
        return {
            code: 500,
            error: err.message,
            success: false
        };
    }
}

