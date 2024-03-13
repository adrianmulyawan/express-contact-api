const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();
const cors = require('cors');

const morganMiddleware = require('./middleware/morgan.middleware.js');
const logger = require('./utils/logger.js');

const indexRouter = require('./routes/index.route.js');

const app = express();
const port = +process.env.APP_PORT;

app.use(cors({
  origin: true,
  credentials: true,
  preflightContinue: false,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
}));
app.options("*", cors());

app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use(cookieParser());

app.use(indexRouter);
app.use('*', (req, res, next) => {
  return res.status(404).json({
    status: 'Failed',
    statusCode: 404,
    message: 'Ooops something error! Route not defined!'
  });
});

app.listen(port, () => {
  logger.info(`Express run in http://localhost:${port}`);
});