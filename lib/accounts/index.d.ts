export declare interface Account {
  id: string;
  isOpen: boolean;
  createdAt: Date;
}

export declare class AccountProvider<Options extends object> {
  constructor(options: Options);

  listAccounts(): Promise<Account[]>;
}
