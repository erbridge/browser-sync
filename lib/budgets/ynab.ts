import { DateTime } from "luxon";
import { nullAsUndefined } from "null-as-undefined";
import { API, SaveTransaction } from "ynab";
import type { BudgetProvider, NewBudgetTransaction } from ".";

const defaultOptions = {};

export interface YNABOptions extends Partial<typeof defaultOptions> {
  accessToken: string;
}

export default class YNAB implements BudgetProvider<YNABOptions> {
  private api: API;

  constructor(options: YNABOptions) {
    const { accessToken } = { ...defaultOptions, ...options };

    this.api = new API(accessToken);
  }

  async listBudgets() {
    const response = await this.api.budgets.getBudgets();
    const { budgets } = response.data;

    return budgets.map(({ id }) => ({ id }));
  }

  async listAccountTransactions(
    budgetId: string,
    accountId: string,
    since: DateTime
  ) {
    const response = await this.api.transactions.getTransactionsByAccount(
      budgetId,
      accountId,
      since.toJSDate()
    );
    const { transactions } = response.data;

    return transactions
      .filter(({ deleted }) => !deleted)
      .map(({ id, date, amount, payee_name, import_id }) => ({
        id,
        on: DateTime.fromISO(date)
          .toUTC(0, { keepLocalTime: true })
          .startOf("day"),
        payee: nullAsUndefined(payee_name),
        amount: amount / 10,
        importId: nullAsUndefined(import_id),
      }));
  }

  async createTransactions(
    budgetId: string,
    accountId: string,
    transactions: NewBudgetTransaction[]
  ) {
    const budgetTransactions = transactions.map((transaction) => {
      const amount = transaction.amount * 10;
      const date = transaction.on.toISO();

      return {
        account_id: accountId,
        date,
        amount,
        payee_name: transaction.payee,
        cleared: SaveTransaction.ClearedEnum.Cleared,
        import_id: this.makeImportId(transaction),
      };
    });

    await this.api.transactions.createTransactions(budgetId, {
      transactions: budgetTransactions,
    });
  }

  private makeImportId(transaction: NewBudgetTransaction) {
    const amount = transaction.amount * 10;
    const date = transaction.on.toISO();

    return `BUDGET-SYNC:${amount}:${date.split("T")[0]}:${
      transaction.payee
    }`.substr(0, 34);
  }
}
