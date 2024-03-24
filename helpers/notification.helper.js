const firebase = require("../utils/firebaseConfig.util")


exports.sendPushNotification = (notificationTitle, notificationBody, deviceTokensArray) => {
    try {
        const message = {
            notification: {
                title: notificationTitle,
                body: notificationBody
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
                console.log('Successfully sent message:', response.successCount);
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


