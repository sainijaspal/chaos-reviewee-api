const socketIO = require('socket.io');

module.exports = server => {
  const socketServer = socketIO.listen(server);
  socketServer.listen(server).on('connection', socket => {
    console.log('client connected'); // eslint-disable-line no-console

    socket.on('disconnect', () => {
      console.log('client disconnect'); // eslint-disable-line no-console
    });

    socket.on('notify_all', () => {
      socket.broadcast.emit('on_new_notification');
    });
  });
};
