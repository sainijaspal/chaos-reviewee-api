const request = require('request');

const createRollbarServices = () => {
  const getRollbarErrorCount = rollbarToken => {
    const url = `https://api.rollbar.com/api/1/items/?access_token=${rollbarToken}&status=active`;
    return new Promise((resolve, reject) => {
      request({ url, json: true }, (err, response, body) => {
        if (err) {
          reject(err);
        }
        if (response.statusCode === 200) {
          resolve({
            success: true,
            error_count: body.result.total_count,
          });
        } else {
          resolve({
            success: false,
            error_count: 0,
          });
        }
      });
    });
  };

  return {
    getRollbarErrorCount,
  };
};

module.exports = { createRollbarServices };
