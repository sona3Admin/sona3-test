const i18n = require('i18n');
const socketLocales = {};
const { chatSocketHandler } = require("./chat.socket")
const { notificationSocketHandler } = require("./notification.socket")
const { adminSocketHandler } = require("./admin.socket")
const { customerSocketHandler } = require("./customer.socket")


exports.serverSocketHandler = (socket, io) => {
    try {
        let socketId = socket.id
        let acceptLanguage = socket.handshake.headers['accept-language'] || "en";
        socketLocales[socketId] = acceptLanguage;
        const locale = socketLocales[socketId];
        let localeMessages = setLocalizedMessage(locale)


        io.to(socketId).emit("connectionStatus", {
            success: true,
            code: 201,
            message: localeMessages.welcomeMessage
        })

        adminSocketHandler(socket, io, socketId, localeMessages, locale);
        chatSocketHandler(socket, io, socketId, localeMessages, locale);
        notificationSocketHandler(socket, io, socketId, localeMessages, locale);
        customerSocketHandler(socket, io, socketId, localeMessages, locale);
    } catch (err) {
        return console.log(`err.message`, err.message);
    }

}


function setLocalizedMessage(locale) {
    return {
        welcomeMessage: i18n.__({ phrase: 'welcomeMessage', locale }),
        internalServerError: i18n.__({ phrase: 'internalServerError', locale }),
        roomBlocked: i18n.__({ phrase: 'roomBlocked', locale }),
        newMessage: i18n.__({ phrase: 'newMessage', locale })
    }
}
