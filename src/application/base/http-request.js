const request = require('request');
const {
  NotFoundError,
  UnprocessableEntityError,
} = require('../helper/errors.js');

const userAgent =
  'octonode/0.3 (https://github.com/pksunkara/octonode) terminal/0.0';

const createHttpServices = () => {
  const getHeader = token => ({
    'User-Agent': userAgent,
    authorization: `token ${token}`,
    'content-type': 'application/json',
  });

  const getResponse = async (url, token) => {
    const options = {
      method: 'GET',
      url, // along with qs parameters;
      headers: getHeader(token),
    };

    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (response && response.statusCode === 404) {
          reject(new NotFoundError());
        }
        if (response && response.statusCode === 422) {
          reject(new UnprocessableEntityError());
        }
        if (error) {
          reject(error);
        }
        resolve(JSON.parse(body));
      });
    });
  };

  const sendRequest = (url, token, parameters, method) => {
    const options = {
      method,
      url,
      json: true,
      headers: getHeader(token),
      body: parameters,
    };
    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (response && response.statusCode === 404) {
          reject(new NotFoundError());
        }
        if (response && response.statusCode === 422) {
          reject(new UnprocessableEntityError());
        }
        if (error) {
          reject(error);
        }
        resolve(body);
      });
    });
  };

  const postRequest = async (url, token, body) =>
    sendRequest(url, token, body, 'POST');

  const putRequest = async (url, token, body) =>
    sendRequest(url, token, body, 'PUT');

  const patchRequest = async (url, token, body) =>
    sendRequest(url, token, body, 'PATCH');

  const deleteRequest = async (url, token) =>
    sendRequest(url, token, null, 'DELETE');

  return {
    getResponse,
    postRequest,
    putRequest,
    patchRequest,
    deleteRequest,
  };
};

module.exports = { createHttpServices };
