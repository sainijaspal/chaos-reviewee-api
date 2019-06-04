const express = require('express');
const passport = require('passport');
const authController = require('./auth.controller');

const router = express.Router();
const githubAuth = passport.authenticate('github');

router.get('/github/callback', githubAuth, authController.github);

router.use((req, res, next) => {
  req.session.socketId = req.query.socketId;
  next();
});

router.get('/github', githubAuth);

module.exports = router;
