const io = require('socket.io');
const users = require('./users');

/**
 * Initialize when a connection is made
 * @param {SocketIO.Socket} socket
 */
function initSocket(socket) {
  let id;

  // Initialize with a provided name or random ID
  socket.on('init', async (data = {}) => {
    const { name } = data;  // Accept name from frontend
    if (!name) {
      console.log('Name not provided, generating random ID.');
      id = await users.create(socket);  // Generate random ID
    } else {
      console.log('Name provided:', name);
      id = name;  // Use provided name
      users.createWithID(socket, id);  // Ensure name is added to users list
    }

    if (id) {
      socket.emit('init', { id });  // Emit the ID to the frontend
    } else {
      socket.emit('error', { message: 'Failed to generate user ID' });
    }
  });

  // Allow ID updates
  socket.on('updateID', (newID) => {
    if (users.get(id) && id != newID) {
      users.update(id, newID);  // Update the user's ID
      id = newID;  // Change the current socket's ID reference
      socket.emit('init', { id: newID });  // Notify the frontend of the updated ID
    }
  });

  // Handle other events
  socket.on('request', (data) => {
    const receiver = users.get(data.to);
    if (receiver) {
      receiver.emit('request', { from: id });
    }
  });

  socket.on('call', (data) => {
    const receiver = users.get(data.to);
    if (receiver) {
      receiver.emit('call', { ...data, from: id });
    } else {
      socket.emit('failed');
    }
  });

  socket.on('end', (data) => {
    const receiver = users.get(data.to);
    if (receiver) {
      receiver.emit('end');
    }
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    users.remove(id);
    console.log(id, 'disconnected');
  });
}

module.exports = (server) => {
  io({ path: '/bridge', serveClient: false })
    .listen(server, { log: true })
    .on('connection', initSocket);
};
