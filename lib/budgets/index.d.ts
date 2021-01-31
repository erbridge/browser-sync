import { DateTime } from "luxon";

export declare interface Budget {
  id: string;
}

export declare interface NewBudgetTransaction {
  on: DateTime;
  payee: string;
  amount: number;
}

export declare interface BudgetTransaction extends NewBudgetTransaction {
  id: string;
  payee?: string;
  importId?: string;
}

export declare class BudgetProvider<Options extends object> {
  constructor(options: Options);

  listBudgets(): Promise<Budget[]>;
  listAccountTransactions(
    budgetId: string,
    accountId: string,
    since: DateTime
  ): Promise<BudgetTransaction[]>;
  selectNewAccountTransactions(
    budgetId: string,
    accountId: string,
    since: DateTime,
    accountTransactions: AccountTransaction[]
  ): Promise<AccountTransaction[]>;
  createTransactions(
    budgetId: string,
    accountId: string,
    transactions: NewBudgetTransaction[]
  ): Promise<number>;
  syncTransactions(
    budgetId: string,
    accountId: string,
    since: DateTime,
    accountTransactions: AccountTransaction[]
  ): Promise<number>;
}
