/* eslint-disable no-await-in-loop */
const { setTimeout } = require('node:timers/promises');
const haiku = require('./haiku'); // Assuming haiku() generates random IDs

const MAX_TRIES = 10; // Maximum number of attempts to generate a unique ID
const users = {}; // Users map

// Generate a unique random ID until the ID is available or max tries is reached
async function randomID(counter = 0) {
  if (counter > MAX_TRIES) {
    return null; // If we exceed the max number of retries, return null
  }

  await setTimeout(10); // Small delay between retries
  const id = haiku(); // Generate a random ID using haiku()
  
  // If the generated ID is already taken, try again recursively
  return id in users ? randomID(counter + 1) : id;
}

// Create or register a user with a specific ID or generate a new ID if needed
exports.create = async (socket, id) => {
  if (id) {
    // If a specific ID is passed (e.g., username), use that ID
    if (!users[id]) {
      users[id] = socket; // Register the socket with the provided ID
    }
    return id; // Return the provided ID
  }

  // If no ID is passed, generate a random ID
  const newId = await randomID();
  if (newId) {
    users[newId] = socket; // Register the socket with the generated ID
  }
  return newId; // Return the generated ID
};

// Retrieve a user by ID
exports.get = (id) => users[id];

// Remove a user by ID
exports.remove = (id) => delete users[id];

// Update the user ID
exports.update = (oldID, newID) => {
  if (users[oldID]) {
    users[newID] = users[oldID]; // Assign the socket to the new ID
    delete users[oldID]; // Remove the old ID from the users map
    console.log(`User ID updated to: ${newID}`); // Log the ID update
  }
};
