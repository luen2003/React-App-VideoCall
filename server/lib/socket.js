const io = require('socket.io');
const users = require('./users'); // Assuming users is a module to manage users

function initSocket(socket) {
  let id; // Store the user ID (could be the username or generated ID)
  let newId; // For new user ID

  // Handle 'init' event from client: either use username or generate a new ID
  socket.on('init', async (data) => {
    if (data && data.username) {
      // If a username is passed, use it as the ID
      id = data.username;
      await users.create(socket, id);  // Register the username in users.js
      console.log(`User connected: ${id}`); // Log the username that is connected
    } else {
      // Otherwise, generate a new ID for the user
      newId = await users.create(socket);  // Create a random ID
      users.update(newId, id);
      console.log(`User connected with generated ID: ${id}`); // Log the generated ID
    }

    if (id) {
      socket.emit('init', { id }); // Send the user ID back to the client
    } else {
      socket.emit('error', { message: 'Failed to generate user ID' });
    }
  });

  // Handle updating the user ID
  socket.on('updateID', (newID) => {
    if (users.get(id)) {
      users.update(id, newID); // Update the ID for this socket in the users map
      id = newID; // Update the local ID reference
      socket.emit('init', { id: newID }); // Send the updated ID back to the client
      console.log(`User ID updated to: ${newID}`); // Log the ID update
    }
  });

  // Handle incoming call requests
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
  // Set up the socket.io server
  io({ path: '/bridge', serveClient: false })
    .listen(server, { log: true })
    .on('connection', initSocket); // When a new connection occurs, initialize the socket
};
