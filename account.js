const axios = require('axios');
const { pagination, unique } = require('./util');

const getAccounts = async (apiBaseUrl, accessToken) => {
  let page = 1;
  let hasNext = true;

  const configAccounts = {
    baseURL: apiBaseUrl,
    method: 'get',
    url: '/accounts',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  const accounts = [];

  try {
    while (hasNext) {
      const response = await axios(pagination(configAccounts, page));
      accounts.push(...response.data.account);
      page += 1;
      if (!response.data.link || !response.data.link.next) {
        hasNext = false;
      }
    }

    return unique(accounts, 'acc_number');
  } catch (error) {
    throw new Error(
      `Error durring accounts api call | code ${error.response.status} | ${error.response.data}`
    );
  }
};

module.exports = { getAccounts };
