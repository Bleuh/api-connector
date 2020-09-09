const pagination = (config, page) => {
  return {
    ...config,
    params: {
      ...config.params,
      page,
    },
  };
};

const unique = (objects, comparedPropriety) => {
  return objects.reduce(
    (unique, item) =>
      unique.find((uniqueItem) => uniqueItem[comparedPropriety] === item[comparedPropriety])
        ? unique
        : [...unique, item],
    []
  );
};

const format = (accountsWithTransaction) => {
  return accountsWithTransaction.filter(Boolean).map((accountWithTransaction) => {
    const { account, transactions } = accountWithTransaction;
    return {
      acc_number: account.acc_number,
      amount: account.amount,
      transactions: transactions.map((transaction) => ({
        label: transaction.label,
        amount: transaction.amount,
        currency: transaction.currency,
      })),
    };
  });
};

module.exports = { pagination, unique, format };
