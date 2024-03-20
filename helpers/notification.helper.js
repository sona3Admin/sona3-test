const firebase = require("../utils/firebaseConfig.util")


exports.sendPushNotification = (notificationTitle, notificationBody, deviceToken) => {
    try {
        const message = {
            notification: {
                title: notificationTitle,
                body: notificationBody
            },
            token: deviceToken
        };

        firebase.messaging().send(message)
            .then((response) => {
                console.log('Successfully sent message:', response);
                return {
                    success: true,
                    result: response,
                    code: 200
                }
            })
            .catch((error) => {
                console.log('Error sending message:', error);
                return {
                    success: false,
                    code: 500,
                    error: error.message
                }
            });

    } catch (err) {
        console.log("err.message", err.message);
        return {
            success: false,
            code: 500,
            error: err.message
        }
    }
}


