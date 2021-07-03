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
  userPropsToIgnore: "-password -__v -ng_webpush",
  userIgnorePassOnly: "-password -__v",
  twilio: {
    account_sid: process.env.TWILIO_ACCOUNT_SID || "need twilio account SID",
    auth_token: process.env.TWILIO_AUTH_TOKEN || "need twilio auth token",
    api_key: process.env.TWILIO_API_KEY || "need twilio API key",
    api_secret: process.env.TWILIO_API_SECRET || "need twilio API secret",
    chat_service_sid: process.env.TWILIO_CHAT_SERVICE_SID || "need twilio chat service SID",
    notification_service_sid: process.env.TWILIO_NOTIFICATION_SERVICE_SID || "need twilio notification service SID"
  },
  email: {
    email: process.env.EMAIL,
    password: process.env.EMAIL_PASSWORD
  },
  slugify: {
    lower: true,
    strict: true,
  }
};

module.exports = config;
