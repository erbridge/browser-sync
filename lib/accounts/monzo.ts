import { DateTime } from "luxon";
import fetch, { Headers } from "node-fetch";
import type { AccountProvider } from ".";

const API_BASE_URL = "https://api.monzo.com/";

const defaultOptions = {};

export interface MonzoOptions extends Partial<typeof defaultOptions> {
  accessToken: string;
}

export default class Monzo implements AccountProvider<MonzoOptions> {
  private accessToken: string;

  constructor(options: MonzoOptions) {
    const { accessToken } = { ...defaultOptions, ...options };

    this.accessToken = accessToken;
  }

  async listAccounts() {
    const { accounts } = await this.get<{
      accounts: { id: string; closed: boolean; created: string }[];
    }>("/accounts");

    return accounts.map(({ id, closed, created }) => ({
      id,
      createdOn: DateTime.fromISO(created)
        .toUTC(0, { keepLocalTime: true })
        .startOf("day"),
      isOpen: !closed,
    }));
  }

  async listTransactions(accountId: string, since: DateTime) {
    const { transactions } = await this.get<{
      transactions: {
        id: string;
        created: string;
        description: string;
        amount: number;
        merchant?: { name: string };
        counterparty?: { name: string; preferred_name?: string };
        decline_reason?: string;
      }[];
    }>(
      `/transactions?account_id=${accountId}&since=${since.toISO()}&expand[]=merchant`
    );

    return transactions
      .filter(({ decline_reason }) => !decline_reason)
      .map(({ id, created, description, amount, merchant, counterparty }) => ({
        id,
        on: DateTime.fromISO(created)
          .toUTC(0, { keepLocalTime: true })
          .startOf("day"),
        payee:
          counterparty?.preferred_name ||
          counterparty?.name ||
          merchant?.name ||
          description,
        amount,
      }));
  }

  private async get<T extends object>(endpoint: string) {
    const headers = new Headers({
      Authorization: "Bearer " + this.accessToken,
    });

    const response = await fetch(API_BASE_URL + endpoint, { headers });

    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as T;
  }
}
