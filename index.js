const qs = require("qs");
const axios = require("axios");

const apiUrl = 'http://localhost';
const apiPort = '3000';

const apiBaseUrl = `${apiUrl}:${apiPort}`;

async function getAndFormatAccount(accessToken, account) {
  const configTransactions = {
    baseURL: apiBaseUrl,
    method: "get",
    url: `/accounts/${account.acc_number}/transactions`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  };
  try {
    const response = await axios(configTransactions);
    const transactions = response.data.transactions;
    return {
      acc_number: account.acc_number,
      amout: account.amount,
      transactions: transactions.map((transaction) => ({
        label: transaction.label,
        amout: transaction.amount,
        currency: transaction.currency,
      })),
    };
  } catch (error) {
    return {};
  }
}

async function main() {
  const basicAuth = `Basic ${Buffer.from(
    `BankinClientId:secret`,
    "utf8"
  ).toString("base64")}`;

  const configLogin = {
    baseURL: apiBaseUrl,
    method: "post",
    url: "/login",
    headers: {
      Authorization: basicAuth,
      "Content-Type": "application/json",
    },
    data: {
      user: "BankinUser",
      password: "12345678",
    },
  };

  try {
    const response = await axios(configLogin);
    const refreshToken = response.data.refresh_token;

    const configToken = {
      baseURL: apiBaseUrl,
      method: "post",
      url: "/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    };

    try {
      const response = await axios(configToken);
      const accessToken = response.data.access_token;
      const configAccounts = {
        baseURL: apiBaseUrl,
        method: "get",
        url: "/accounts",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      };
      try {
        const response = await axios(configAccounts);
        const accounts = response.data.account;
        const formatedAccount = await Promise.all(
          accounts.map((account) => getAndFormatAccount(accessToken, account))
        );
        console.log(formatedAccount);
      } catch (error) {
        console.error(error.response.data);
      }
    } catch (error) {
      console.error(error.response.data);
    }
  } catch (error) {
    console.error(error.response.data);
  }
}

main();
