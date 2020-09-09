const axios = require('axios');
const { pagination, unique } = require('./util');

const getTransactions = async (url, accessToken, account) => {
  let page = 1;
  let hasNext = true;
  const configTransaction = {
    baseURL: url,
    method: 'get',
    url: `/accounts/${account.acc_number}/transactions`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  const transactions = [];

  try {
    while (hasNext) {
      const response = await axios(pagination(configTransaction, page));
      transactions.push(...response.data.transactions);
      page += 1;
      if (!response.data.link || !response.data.link.next) {
        hasNext = false;
      }
    }
    return {
      account,
      transactions: unique(transactions, 'id'),
    };
  } catch (error) {
    console.log(
      `Error durring transaction api call | code ${error.response.status} | ${error.response.data}`
    );
    return null;
  }
};

module.exports = { getTransactions };
