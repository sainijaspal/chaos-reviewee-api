const passport = require('passport');
const { Strategy: GithubStrategy } = require('passport-github');
const { GITHUB_CONFIG } = require('./config');

module.exports = () => {
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((obj, cb) => cb(null, obj));

  const callback = (accessToken, refreshToken, profile, cb) =>
    cb(null, profile, accessToken);

  passport.use(new GithubStrategy(GITHUB_CONFIG, callback));
};
