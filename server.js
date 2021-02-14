require('dotenv').config();
const http = require('http');
const app = require('./app');
const config = require('./config/index');
const connectMongo = require('./config/mongo');
const log = require('./log');

// This might be deprecated since I am unlikely to switch to MySQL for now
// const sequelize = require("./config/sequelize");

// init server instance
const server = http.createServer(app);

// connect to services
connectMongo();

/* This might be deprecated since I am unlikely to switch to MySQL for now
sequelize.authenticate().then(() => {
  log.log('mysql', "Connected to Sequelize MySQL server");
}).catch((error) => {
  console.error('Unable to connect to Sequelize database:', error);
});
*/

// start server
server.listen(config.server.port, err => {
  if (err) {
    log.err('server', 'could not start listening', err.message || err);
    process.exit();
  }
  log.log('env', `app starting in "${config.env}" mode...`);
  log.log('server', `Express server is listening on ${config.server.port}...`);
});

module.exports = server;
