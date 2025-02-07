const io = require('socket.io');
const users = require('./users');

/**
 * Initialize when a connection is made
 * @param {SocketIO.Socket} socket
 */
function initSocket(socket) {
  let id;

  socket
    .on('init', async () => {
      id = await users.create(socket);
      if (id) {
        socket.emit('init', { id });
      } else {
        socket.emit('error', { message: 'Failed to generating user id' });
      }
    })
    .on('updateID', (newID) => {
      // Cập nhật ID của người dùng
      if (users.get(id)) {
        users.update(id, newID); // Cập nhật ID trong danh sách người dùng
        id = newID; // Thay đổi ID
        socket.emit('init', { id: newID }); // Cập nhật ID trên client
      }
    })
    .on('request', (data) => {
      const receiver = users.get(data.to);
      if (receiver) {
        receiver.emit('request', { from: id });
      }
    })
    .on('call', (data) => {
      const receiver = users.get(data.to);
      if (receiver) {
        receiver.emit('call', { ...data, from: id });
      } else {
        socket.emit('failed');
      }
    })
    .on('end', (data) => {
      const receiver = users.get(data.to);
      if (receiver) {
        receiver.emit('end');
      }
    })
    .on('disconnect', () => {
      users.remove(id);
      console.log(id, 'disconnected');
    });
}

module.exports = (server) => {
  io({ path: '/bridge', serveClient: false })
    .listen(server, { log: true })
    .on('connection', initSocket);
};
