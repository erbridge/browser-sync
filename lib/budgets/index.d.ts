export declare interface Budget {
  id: string;
}

export declare class BudgetProvider<Options extends object> {
  constructor(options: Options);

  listBudgets(): Promise<Budget[]>;
}
