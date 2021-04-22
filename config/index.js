// get configs from environment
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = NODE_ENV === 'testing' ? 8000 : process.env.PORT;
const MONGO_HOST = process.env.MONGO_HOST || 'mongodb://localhost/chat-app';
const SECRET = process.env.SECRET || 'supersecretalltheway';
const ROOT = process.env.ROOT || '';
const CHAT_PATH = process.env.CHAT_PATH || '/chat-path';
const CHANNEL_PATH = process.env.CHANNEL_PATH || '/channel-path';
const DATABASE_USERNAME = process.env.DATABASE_USERNAME || 'root';
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || 'needpassword';
const WEBPUSH_PUBLIC_KEY = process.env.WEBPUSH_PUBLIC_KEY || 'need a public key';
const WEBPUSH_PRIVATE_KEY = process.env.WEBPUSH_PRIVATE_KEY || 'need a private';

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
  databaseUsername: DATABASE_USERNAME,
  databasePw: DATABASE_PASSWORD,
  webpush: {
    publicKey: WEBPUSH_PUBLIC_KEY,
    privateKey: WEBPUSH_PRIVATE_KEY
  },
  userPropsToIgnore: "-password -__v -ng_webpush"
};

module.exports = config;
