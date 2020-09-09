const { login, auth } = require('./auth');
const { getAccounts } = require('./account');
const { getTransactions } = require('./transation');
const { format } = require('./util');

require('dotenv').config();

const apiUrl = process.env.API_URL || 'http://localhost';
const apiPort = process.env.API_PORT || '3000';

const apiBaseUrl = `${apiUrl}:${apiPort}`;

async function main() {
  try {
    // login & auth
    const refreshToken = await login(
      apiBaseUrl,
      'BankinClientId',
      'secret',
      'BankinUser',
      '12345678'
    );
    const accessToken = await auth(apiBaseUrl, refreshToken);
    // accounts
    const accounts = await getAccounts(apiBaseUrl, accessToken);
    // all transactions
    const accountsWithTransactions = await Promise.all(
      accounts.map((account) => getTransactions(apiBaseUrl, accessToken, account))
    );
    // formated
    console.log(format(accountsWithTransactions));
  } catch (error) {
    console.error(error);
  }
}

main();
