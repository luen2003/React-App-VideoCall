const http = require('http');
const express = require('express');
const config = require('../config');
const socket = require('./lib/socket');
const userRoutes = require('./routes/userRoutes.js');
const connectDB = require('./config/db.js');
const path = require('path'); // To handle file paths

const app = express();
const server = http.createServer(app);

// Connect to the database
connectDB();

app.use(express.json());  // This line is crucial for parsing the request body


// Serve static files (JS, CSS, images, etc.) directly from the dist folder
app.use(express.static(path.join(__dirname, '../client/dist')));

// API routes
app.use('/api/users', userRoutes); // Example API route for user-related functionality

// Serve React app's index.html for routes handled by React Router
// Only send index.html for routes that aren't already handled by static files
app.get(['/login', '/signup'], (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// Catch-all route for handling any other routes and serving index.html
// This will serve index.html for any React Router managed route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// Setup server to listen on the specified port
const port = config.PORT || 8080;
server.listen(port, () => {
  socket(server);
  console.log(`Server is listening at : ${port}`);
});
