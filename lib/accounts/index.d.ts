import { DateTime } from "luxon";

export declare interface Account {
  id: string;
  createdOn: DateTime;
  isOpen: boolean;
}

export declare interface AccountTransaction {
  id: string;
  on: DateTime;
  payee: string;
  amount: number;
}

export declare class AccountProvider<Options extends object> {
  constructor(options: Options);

  listAccounts(): Promise<Account[]>;
  listTransactions(
    accountId: string,
    since: DateTime,
    before?: DateTime
  ): Promise<AccountTransaction[]>;
}
