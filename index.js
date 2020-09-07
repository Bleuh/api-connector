const qs = require("qs");
const axios = require("axios");

const apiUrl = "http://localhost";
const apiPort = "3000";

const apiBaseUrl = `${apiUrl}:${apiPort}`;

function generateConfigWithPagination(config, page) {
  return {
    ...config,
    params: {
      ...config.params,
      page,
    },
  }
}

async function getAndFormatAccount(accessToken, account) {
  let page = 1;
  let hasNext = true;
  const configTransaction = {
    baseURL: apiBaseUrl,
    method: "get",
    url: `/accounts/${account.acc_number}/transactions`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  };
  const accountWithTransactions = {
    acc_number: account.acc_number,
    amount: account.amount,
    transactions: [],
  };
  try {
    while (hasNext) {
      const response = await axios(generateConfigWithPagination(configTransaction, page));
      const transactions = response.data.transactions;
      accountWithTransactions.transactions.push(
        ...transactions.map((transaction) => ({
          label: transaction.label,
          amount: transaction.amount,
          currency: transaction.currency,
        }))
      );
      page += 1;
      if (!response.data.link || !response.data.link.next) {
        hasNext = false;
      }
    }
    return accountWithTransactions;
  } catch (error) {
    return accountWithTransactions;
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

      let page = 1;
      let hasNext = true;

      const configAccounts = {
        baseURL: apiBaseUrl,
        method: "get",
        url: "/accounts",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      };

      const accounts = [];

      try {
        while (hasNext) {
          const response = await axios(generateConfigWithPagination(configAccounts, page));
          accounts.push(...response.data.account);
          page += 1;
          if (!response.data.link || !response.data.link.next) {
            hasNext = false;
          }
        }
        const uniqueAccounts = accounts.reduce(
          (unique, item) =>
            unique.find(
              (uniqueItem) => uniqueItem.acc_number === item.acc_number
            )
              ? unique
              : [...unique, item],
          []
        );
        const formatedAccount = await Promise.all(
          uniqueAccounts.map((account) =>
            getAndFormatAccount(accessToken, account)
          )
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
