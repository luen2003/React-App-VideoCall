const io = require('socket.io');
const users = require('./users');

/**
 * Initialize when a connection is made
 * @param {SocketIO.Socket} socket
 */
function initSocket(socket) {
  let id;

  socket.on('init', async (data) => {
    if (data && data.username) {
      // If the username is provided, use it as the user ID
      id = data.username;
    } else {
      // If no username is provided, generate a random ID
      id = await users.create(socket);
    }

    if (id) {
      users[id] = socket;
      socket.emit('init', { id });  // Send the ID back to the frontend
    } else {
      socket.emit('error', { message: 'Failed to generate user ID' });
    }
  });

  socket.on('updateID', (newID) => {
    if (users.get(id)) {
      users.update(id, newID);  // Update the user's ID in the backend
      id = newID;  // Update the ID to the new username
      socket.emit('init', { id: newID });  // Send the updated ID to the frontend
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
