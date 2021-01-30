export declare interface Account {
  id: string;
  isOpen: boolean;
  createdAt: Date;
}

export declare interface AccountTransaction {
  id: string;
  payee: string;
  amount: number;
  createdAt: Date;
}

export declare class AccountProvider<Options extends object> {
  constructor(options: Options);

  listAccounts(): Promise<Account[]>;
  listTransactions(
    accountId: string,
    since: Date
  ): Promise<AccountTransaction[]>;
}
