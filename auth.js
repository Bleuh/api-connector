const axios = require('axios');
const qs = require('qs');

const login = async (url, id, secret, user, password) => {
  const basicAuth = `Basic ${Buffer.from(`${id}:${secret}`, 'utf8').toString('base64')}`;

  const configLogin = {
    baseURL: url,
    method: 'post',
    url: '/login',
    headers: {
      Authorization: basicAuth,
      'Content-Type': 'application/json',
    },
    data: {
      user,
      password,
    },
  };

  try {
    const response = await axios(configLogin);
    const refreshToken = response.data.refresh_token;
    if (!refreshToken) {
      throw new Error('Token not receive');
    }
    return refreshToken;
  } catch (error) {
    throw new Error(
      `Error durring login api call | code ${error.response.status} | ${error.response.data}`
    );
  }
};

const auth = async (url, refreshToken) => {
  const configToken = {
    baseURL: url,
    method: 'post',
    url: '/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  };

  try {
    const response = await axios(configToken);
    const accessToken = response.data.access_token;
    if (!accessToken) {
      throw new Error('Token not receive');
    }
    return accessToken;
  } catch (error) {
    throw new Error(
      `Error durring auth api call | code ${error.response.status} | ${error.response.data}`
    );
  }
};

module.exports = { login, auth };
