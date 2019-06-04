const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const bodyParserJsonError = require('express-body-parser-json-error');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

const swaggerUI = require('swagger-ui-express');
const apiDocument = require('../../../doc/api.json');
const config = require('../../config.js');
const authRouter = require('./github/auth.router');
const passportInit = require('./github/passport.init');

const { createDAL } = require('../../application/dal/index.js');
const { createHttpRequests } = require('../../application/base/index.js');
const { createServices } = require('../../application/services/index.js');
const {
  createNotifications,
} = require('../../application/notifications/index.js');
const { createHelper } = require('../../application/helper/index.js');
const { createRepositoryRoute } = require('./routes/repository/index.js');
const { createCommitRoute } = require('./routes/commit/index.js');

const createApp = ({
  config: { origin } = config,
  sessionSecret: { sessionSecret } = config,
  sequelize,
  dal = {},
  httpRequests = {},
  services = {},
  helper = {},
  notifications = {},
}) => {
  const app = express();

  httpRequests = createHttpRequests(); // eslint-disable-line no-param-reassign
  helper = createHelper(); // eslint-disable-line no-param-reassign
  notifications = createNotifications({ helper, config }); // eslint-disable-line no-param-reassign
  services = createServices({ httpRequests, helper, config }); // eslint-disable-line no-param-reassign
  dal = createDAL({ sequelize, services, helper, config }); // eslint-disable-line no-param-reassign

  app.use(express.json());
  app.use(passport.initialize());
  passportInit();

  const repositoryRoute = createRepositoryRoute({ dal });
  const commitRoute = createCommitRoute({ dal, services, notifications });

  app.use(compression());

  app.use(
    cors({
      origin,
      methods: ['POST', 'GET', 'PATCH', 'PUT', 'DELETE'],
      credentials: true,
    }),
  );

  app.use(
    session({
      secret: sessionSecret,
      resave: true,
      saveUninitialized: true,
    }),
  );

  app.use('/', authRouter);

  app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(apiDocument));

  app.use(bodyParser.json());
  app.use(bodyParserJsonError());

  app.use('/', repositoryRoute);
  app.use('/commit', commitRoute);

  global.app = app;
  require('../../webhooks/github/webhook'); // eslint-disable-line global-require

  app.disable('x-powered-by');

  return app;
};

module.exports = { createApp };
