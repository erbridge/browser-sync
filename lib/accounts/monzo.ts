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
      isOpen: !closed,
      createdAt: new Date(created),
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
