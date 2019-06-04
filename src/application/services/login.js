const request = require('request');
const qs = require('querystring');
const github = require('octonode');

exports.sessionRegenerate = async (isAdmin, req, user) => {
  await new Promise(resolve => {
    req.session.regenerate(() => {
      user.role = isAdmin ? 'admin' : 'member'; // eslint-disable-line no-param-reassign
      user.isAdmin = isAdmin; // eslint-disable-line no-param-reassign
      user.isSuperAdmin = isAdmin; // eslint-disable-line no-param-reassign
      req.session.user = user;
      req.session.returnUrl = req.session.returnUrl;
      return resolve({
        success: true,
        message: '',
        requiredOtp: false,
        user,
      });
    });
  });
};

exports.getGitHubAccessToken = async ({ query: { code } }) =>
  new Promise(resolve => {
    request(
      {
        url: 'https://github.com/login/oauth/access_token',
        method: 'POST',
        body: qs.stringify({
          code,
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_SECRET_ID,
        }),
        headers: {
          'User-Agent': 'terminal/0.0',
        },
      },
      async (err, body, data) => {
        resolve(data);
      },
    );
  });

exports.validateUser = (token, callback) => {
  const client = github.client(token);
  client.me().info((err, data) => {
    callback(err, data);
  });
};

exports.getGitHubClient = token => github.client(token);

exports.getGitHubMyInfo = async (ghme, token) =>
  new Promise(resolve => {
    ghme.info((err, data) => {
      if (err) {
        return resolve({
          success: false,
          message: err.message,
        });
      }
      return resolve({
        login: data.login || '',
        avatar_url: data.avatar_url,
        id: data.id,
        name: data.name,
        token,
        email: data.email,
        success: true,
      });
    });
  });

exports.login = async (username, password) => {
  const scopes = {
    scopes: ['user', 'repo', 'gist'],
    note: Math.floor(Date.now() / 1000).toString(),
  };
  const githubAuth = github.auth.config({
    username,
    password,
  });
  return new Promise(resolve => {
    githubAuth.login(scopes, (err, id, token) => {
      if (err) {
        resolve({
          success: false,
          message: err.message,
        });
      } else {
        resolve({
          success: true,
          token,
        });
      }
    });
  });
};

exports.getOrganizationInfo = async ghme =>
  new Promise(resolve => {
    ghme.orgs((err, orgs) => {
      if (err) {
        resolve({
          success: false,
          message: err.message,
        });
      }
      resolve({
        success: true,
        orgs,
      });
    });
  });
