const i18n = require('i18n');
const socketLocales = {};

const setLocalizedMessage = (locale) => {
    return {
        welcomeMessage: i18n.__({ phrase: 'welcomeMessage', locale }),
        internalServerError: i18n.__({ phrase: 'internalServerError', locale }),
    }
}

exports.adminSockeHandler = (socket, io) => {

    let acceptLanguage = socket.handshake.headers['accept-language'] || "en";
    socketLocales[socket.id] = acceptLanguage;
    const locale = socketLocales[socket.id];
    let localeMessages = setLocalizedMessage(locale)
    
    let socketId = socket.id
    io.to(socketId).emit("connection", { success: true, code: 201, message: localeMessages.welcomeMessage })

    socket.on("joinAdminRoom", (dataObject) => {
        socket.join(dataObject.roleId);
        // socket.join(dataObject._id);
    })


    socket.on("revokeAccess", (dataObject) => {
        io.to(dataObject.roleId).emit("revokeAccess", {});
    })

}