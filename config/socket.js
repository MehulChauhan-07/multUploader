const socketIO = require('socket.io');

function setupSocket(server) {
    const io = socketIO(server);

    io.on('connection', (socket) => {
        console.log('New client connected');

        socket.on('startUpload', (data) => {
            console.log('Upload started:', data);
            socket.join(`upload-${data.userId}`);
        });

        socket.on('uploadProgress', (data) => {
            io.to(`upload-${data.userId}`).emit('uploadStatus', data);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
}

module.exports = setupSocket;