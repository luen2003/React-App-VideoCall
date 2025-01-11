const http = require('http');
const express = require('express');
const config = require('../config');
const socket = require('./lib/socket');
const userRoutes = require('./routes/userRoutes.js');
const connectDB = require('./config/db.js');


const app = express();
const server = http.createServer(app);
connectDB();

app.use('/', express.static(`${__dirname}/../client/dist`));

const port = config.PORT || 8080;
server.listen(port, () => {
  socket(server);
  console.log(`Server is listening at : ${port}`);
});