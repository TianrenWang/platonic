// get configs from environment
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 8080;
const MONGO_HOST = process.env.MONGO_HOST || 'mongodb://localhost/chat-app';
const SECRET = process.env.SECRET || 'supersecretalltheway';
const ROOT = process.env.ROOT || '';
const CHAT_PATH = process.env.CHAT_PATH || '/chat-path';
const CHANNEL_PATH = process.env.CHANNEL_PATH || '/channel-path';
const MYSQL_USERNAME = process.env.MYSQL_USERNAME || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || 'needpassword';
const CLEAR_HOST = process.env.CLEAR_HOST || `mysql://${MYSQL_USERNAME}:${MYSQL_PASSWORD}@localhost:3306/platonic`;

const apiPath = `${ROOT !== '/' ? ROOT : ''}/api`;

// init config obj containing the app settings
const config = {
  env: NODE_ENV,
  root: ROOT,
  apiPath,
  server: {
    port: PORT,
  },
  mongo: {
    host: MONGO_HOST,
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
  },
  secret: SECRET,
  chatPath: CHAT_PATH,
  channelPath: CHANNEL_PATH,
  clearDB: {
    host: CLEAR_HOST
  }
};

module.exports = config;
