const express = require('express');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');
const passport = require('passport');
const errorMiddleware = require('./middleware/error');
const config = require('./config');

// import routes
const userRoutes = require('./routes/user');
const messageRoutes = require('./routes/message');
const channelRoutes = require('./routes/channel');
const subscriptionRoutes = require('./routes/subscription');
const twilioRoutes = require('./routes/twilio');
const emailRoutes = require('./routes/email');
const webpushRoutes = require('./routes/webpush');

// initialize the app
const app = express();

// middleware
app.use(cors());
app.use(logger('dev'));
app.use(express.json({limit: '25mb'}));
app.use(express.urlencoded({limit: '25mb', extended: true}));
app.use(passport.initialize());
require('./config/passport').normal_authentication(passport);
var distDir = __dirname + "/dist/";
app.use(express.static(distDir));

// static folder
app.use(config.root, express.static(path.join(__dirname, 'public')));

// set routes
app.use(`${config.apiPath}/users`, userRoutes);
app.use(`${config.apiPath}/messages`, messageRoutes);
app.use(`${config.apiPath}/channels`, channelRoutes);
app.use(`${config.apiPath}/twilio`, twilioRoutes);
app.use(`${config.apiPath}/email`, emailRoutes);
app.use(`${config.apiPath}/subscription`, subscriptionRoutes);
app.use(`${config.apiPath}/webpush`, webpushRoutes);

// set error handling middleware
app.use(errorMiddleware);

app.get('*', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

module.exports = app;
