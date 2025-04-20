const firebase = require("../utils/firebaseConfig.util")
const { logInTestEnv } = require("./logger.helper");


exports.sendPushNotification = (notificationTitle, notificationBody, deviceTokensArray) => {
    try {
        const message = {
            notification: {
                title: notificationTitle.en,
                body: notificationBody.en
            },
            tokens: deviceTokensArray,
            sound: "default",
            android: {
                notification: {
                    // imageUrl: 'https://foo.bar.pizza-monster.png',
                    icon: 'ic_launcher',
                    color: '#7e55c3'
                }
            },
        };

        firebase.messaging().sendEachForMulticast(message)
            .then((response) => {
                logInTestEnv('Successfully sent message:', response.successCount);
                return {
                    success: true,
                    result: response,
                    code: 200
                }
            })
            .catch((error) => {
                logInTestEnv('Error sending message:', error);
                return {
                    success: false,
                    code: 500,
                    error: error.message
                }
            });

    } catch (err) {
        logInTestEnv("err.message", err.message);
        return {
            success: false,
            code: 500,
            error: err.message
        }
    }
}


