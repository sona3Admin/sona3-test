const i18n = require('i18n');
const socketLocales = {};
const { adminSocketHandler } = require("../sockets/admin/admin.socket")
const { customerSocketHandler } = require("../sockets/customer/customer.socket")
const { sellerSocketHandler } = require("../sockets/seller/seller.socket")


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


        adminSocketHandler(socket, io, socketId, localeMessages);
        customerSocketHandler(socket, io, socketId, localeMessages);
        sellerSocketHandler(socket, io, socketId, localeMessages);


        socket.on('disconnect', () => {
            console.log('A client disconnected.');
        });


    } catch (err) {
        return console.log(`err.message`, err.message);
    }

}


function setLocalizedMessage(locale) {
    return {
        welcomeMessage: i18n.__({ phrase: 'welcomeMessage', locale }),
        internalServerError: i18n.__({ phrase: 'internalServerError', locale }),
    }
}
