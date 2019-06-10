const socketio = require('socket.io');

const { port } = require('./config.js');
const { createSequelize } = require('./infra/sequelize/index.js');
const { createApp } = require('./infra/http/app.js');
const { reportError } = require('./infra/report-error.js');

(async () => {
  const sequelize = await createSequelize();
  const app = createApp({
    reportError,
    sequelize,
  });

  const server = app.listen(port, () => {
    console.info(`Listening on ${port}`); // eslint-disable-line no-console
    const io = socketio(server);
    app.set('io', io);
  });

  const cleanUp = async () => {
    try {
      await sequelize.close();
      await server.close();
      process.exit(0);
    } catch (err) {
      process.exit(1);
    }
  };

  process.on('SIGINT', cleanUp);
  process.on('SIGTERM', cleanUp);

  // ngrock used to test the webhook requests on local machine
  // eslint-disable-next-line global-require
  // const ngrok = require('ngrok');
  // ngrok.authtoken('3fBH81hs4SMfEXSwWvNXo_4epJv34BBN88mJGqNaRz');
  // ngrok.connect(5005, (err, url) => {
  //   /* eslint-disable no-console */
  //   if (err) console.log(err);
  //   console.log(url);
  //   /* eslint-enable no-console */
  // });
})();
