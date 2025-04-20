const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const { logInTestEnv } = require("./logger.helper");

AWS.config.update({
    accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
    region: process.env.BUCKETEER_AWS_REGION
});

const BUCKET_NAME = process.env.BUCKETEER_BUCKET_NAME;
const SETTINGS_KEY = 'settings.json';


exports.getSettings = async (key) => {
    try {
        const params = {
            Bucket: BUCKET_NAME,
            Key: SETTINGS_KEY
        };

        const data = await s3.getObject(params).promise();
        const settings = JSON.parse(data.Body.toString());
        return (key ? settings[key] : settings);
    } catch (err) {
        console.error('Error reading settings from S3:', err.message);
        return null;
    }
};


exports.setSettings = async (newSettings) => {
    try {
        const currentSettings = await this.getSettings();
        // logInTestEnv("currentSettings", currentSettings)
        for (const key in newSettings) {
            if (Object.prototype.hasOwnProperty.call(currentSettings, key)) {
                currentSettings[key] = newSettings[key];
            }
        }

        const params = {
            Bucket: BUCKET_NAME,
            Key: SETTINGS_KEY,
            Body: JSON.stringify(currentSettings),
            ContentType: 'application/json'
        };

        await s3.putObject(params).promise();

        return {
            code: 200,
            result: currentSettings,
            success: true
        };
    } catch (err) {
        logInTestEnv('Error setting settings in S3:', err);
        return {
            code: 500,
            error: err.message,
            success: false
        };
    }
};


exports.listSettings = async () => {
    try {
        const settings = await this.getSettings();
        return {
            code: 200,
            result: settings,
            success: true
        };
    } catch (err) {
        logInTestEnv('Error reading settings from S3:', err);
        return {
            code: 500,
            error: err.message,
            success: false
        };
    }
};