const io = require('socket.io');
const users = require('./users');

/**
 * Initialize when a connection is made
 * @param {SocketIO.Socket} socket
 */
function initSocket(socket) {
  let id;

    socket.on('init', async () => {
      id = await users.create(socket);  // Create a random ID initially
      if (id) {
        socket.emit('init', { id });  // Emit the random ID to the frontend
      } else {
        socket.emit('error', { message: 'Failed to generate user ID' });
      }
    });
  
    // When the frontend sends an updateID event, use the userInfo.name instead of the random ID
    socket.on('updateID', (newID) => {
      if (users.get(id)) {
        users.update(id, newID);  // Update the user's ID in the backend
        id = newID;  // Change the ID to the userInfo.name
        socket.emit('init', { id: newID });  // Emit the updated ID to the frontend
      }
    });
    
    socket.on('request', (data) => {
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
