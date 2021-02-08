const axios = require('axios');

const get = async (path, params) => {
  try {
    const response = await axios.request({
      method: 'GET',
      url: `https://indonesia-market.vercel.app/api/${path}`,
      params,
    });

    return response.data.data;
  } catch (error) {
    const message = error.response ? error.response.data.error : error.message;

    throw new Error(message);
  }
};

module.exports = {
  get,
};