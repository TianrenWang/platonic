require('dotenv').config();
const http = require('http');
const app = require('./app');
const config = require('./config/index');
const connectMongo = require('./config/mongo');
const log = require('./log');
const chat_sockets = require('./sockets/chat');

// init server instance
const server = http.createServer(app);

// connect to services
connectMongo();
chat_sockets(server);
// channel_sockets(server);

// start server
server.listen(config.server.port, err => {
  if (err) {
    log.err('server', 'could not start listening', err.message || err);
    process.exit();
  }
  log.log('env', `app starting in "${config.env}" mode...`);
  log.log('server', `Express server is listening on ${config.server.port}...`);
});
