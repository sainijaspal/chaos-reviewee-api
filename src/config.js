const dotenv = require('dotenv');

dotenv.load();

const nodeEnv = process.env.NODE_ENV || 'development';

const config = {
  development: {
    port: 5001,
    origin: (process.env.ORIGIN || '').split(','),
    baseURL: process.env.BASE_URL,
    rollbarAccessToken: null,
    postmarkAPIKey: process.env.POSTMARK_API_KEY,
    slackWebhookKey: process.env.SLACK_WEBHOOK_KEY,
    webhookSecretKey: process.env.WEBHOOK_SECRET_KEY,
    githubAPIURL: process.env.GIT_API_URL,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubSecretKey: process.env.GITHUB_SECRET_ID,
    fromEmail: process.env.FROM_EMAIL,
    newRepositoryNotifyEmails: process.env.NEW_REPO_NOTIFIY_EMAILS,
    webConcurrency: process.env.WEB_CONCURRENCY,
    sessionSecret: process.env.SESSION_SECRET,
  },
  production: {
    port: process.env.PORT,
    origin: (process.env.ORIGIN || '').split(','),
    baseURL: process.env.BASE_URL,
    rollbarAccessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    postmarkAPIKey: process.env.POSTMARK_API_KEY,
    slackWebhookKey: process.env.SLACK_WEBHOOK_KEY,
    webhookSecretKey: process.env.WEBHOOK_SECRET_KEY,
    githubAPIURL: process.env.GIT_API_URL,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubSecretKey: process.env.GITHUB_SECRET_ID,
    fromEmail: process.env.FROM_EMAIL,
    newRepoNotifyEmails: process.env.NEW_REPO_NOTIFIY_EMAILS,
    webConcurrency: process.env.WEB_CONCURRENCY,
    sessionSecret: process.env.SESSION_SECRET,
  },
  test: {
    port: 5001,
    origin: process.env.ORIGIN,
    baseURL: process.env.BASE_URL,
    rollbarAccessToken: null,
    postmarkAPIKey: process.env.POSTMARK_API_KEY,
    slackWebhookKey: process.env.SLACK_WEBHOOK_KEY,
    webhookSecretKey: process.env.WEBHOOK_SECRET_KEY,
    githubAPIURL: process.env.GIT_API_URL,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubSecretKey: process.env.GITHUB_SECRET_ID,
    fromEmail: process.env.FROM_EMAIL,
    newRepositoryNotifyEmails: process.env.NEW_REPO_NOTIFIY_EMAILS,
    webConcurrency: process.env.WEB_CONCURRENCY,
    sessionSecret: process.env.SESSION_SECRET,
  },
};

module.exports = config[nodeEnv];
