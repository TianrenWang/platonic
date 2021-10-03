const express = require('express');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');
const errorMiddleware = require('./middleware/error');
const config = require('./config');

// import routes
const messageRoutes = require('./routes/message');

// initialize the app
const app = express();

app.use(require('prerender-node').set('prerenderToken', process.env.PRERENDER_TOKEN));

// middleware
app.use(cors());
app.use(logger('dev'));
app.use(express.json({limit: '25mb'}));
app.use(express.urlencoded({limit: '25mb', extended: true}));
var distDir = __dirname + "/dist/";
app.use(express.static(distDir));

// static folder
app.use(config.root, express.static(path.join(__dirname, 'public')));

// set routes
app.use(`${config.apiPath}/messages`, messageRoutes);

// set error handling middleware
app.use(errorMiddleware);

app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

module.exports = app;
