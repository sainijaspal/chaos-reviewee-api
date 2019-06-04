const config = require('../../../config');

const url = process.env.BASE_URL;
const providers = ['github'];
const callbacks = providers.map(provider => {
  return `${url}/${provider}/callback`;
});

const [githubURL] = callbacks;

exports.GITHUB_CONFIG = {
  clientID: config.githubClientId,
  clientSecret: config.githubSecretKey,
  callbackURL: githubURL,
  scope: 'gist repo user admin admin:org',
};
