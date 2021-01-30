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
}
