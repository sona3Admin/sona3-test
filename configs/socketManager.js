let io;

const setSocketIo = (ioInstance) => {
    io = ioInstance;
};

const getSocketIo = () => {
    if (!io) throw new Error("Socket.io instance not initialized");
    return io;
};

module.exports = { setSocketIo, getSocketIo };
