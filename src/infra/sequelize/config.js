const { Op } = require('sequelize');
const dotenv = require('dotenv');

dotenv.load();

const operatorsAliases = Op; // https://github.com/sequelize/sequelize/issues/8417#issuecomment-355123149
const env = process.env.NODE_ENV || 'development';
const DOCKER_TEST_DB_URL = 'postgres://postgres:postgres@localhost:5433/test';
const config = {
  development: {
    url: process.env.DATABASE_URL,
    sync: false,
    logging: console.log, // eslint-disable-line no-console,
    operatorsAliases,
    ssl: Boolean(process.env.DATABASE_SSL),
    dialectOptions: {
      ssl: Boolean(process.env.DATABASE_SSL),
    },
  },
  production: {
    url: process.env.DATABASE_URL,
    sync: false,
    logging: false,
    operatorsAliases,
    ssl: Boolean(process.env.DATABASE_SSL),
    dialectOptions: {
      ssl: Boolean(process.env.DATABASE_SSL),
    },
  },
  test: {
    url: process.env.TEST_DATABASE_URL || DOCKER_TEST_DB_URL,
    sync: process.env.SYNC_DATABASE || false,
    logging: false,
    operatorsAliases,
    ssl: false,
    dialectOptions: {
      ssl: false,
    },
  },
};

module.exports = config;
module.exports.config = config[env];
