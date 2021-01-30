import { DateTime } from "luxon";
import { nullAsUndefined } from "null-as-undefined";
import { API } from "ynab";
import type { BudgetProvider } from ".";

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
      .map(({ id, date, amount, payee_name }) => ({
        id,
        on: DateTime.fromISO(date)
          .toUTC(0, { keepLocalTime: true })
          .startOf("day"),
        payee: nullAsUndefined(payee_name),
        amount: amount / 10,
      }));
  }
}
