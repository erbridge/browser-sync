import { DateTime } from "luxon";

export declare interface Budget {
  id: string;
}

export declare interface BudgetTransaction {
  id: string;
  on: DateTime;
  payee?: string;
  amount: number;
}

export declare class BudgetProvider<Options extends object> {
  constructor(options: Options);

  listBudgets(): Promise<Budget[]>;
  listAccountTransactions(
    budgetId: string,
    accountId: string,
    since: DateTime
  ): Promise<BudgetTransaction[]>;
}
