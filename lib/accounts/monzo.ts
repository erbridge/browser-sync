import { DateTime } from "luxon";
import fetch, { Headers } from "node-fetch";
import { URLSearchParams } from "url";
import type { AccountProvider } from ".";

const API_BASE_URL = "https://api.monzo.com";

const defaultOptions = {};

export interface MonzoOptions extends Partial<typeof defaultOptions> {
  accessToken: string;
}

export default class Monzo implements AccountProvider<MonzoOptions> {
  static makeOAuthURL(
    clientId: string,
    redirectUri: string,
    state?: string | number
  ) {
    state = state ?? Math.floor(Math.random() * 1000000).toString();

    const url = `https://auth.monzo.com/?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&state=${state}`;

    return { state, url };
  }

  static async completeOAuth(
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    code: string
  ) {
    const response = await fetch(API_BASE_URL + "/oauth2/token", {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    const { access_token } = (await response.json()) as {
      access_token: string;
    };

    return {
      accessToken: access_token,
    };
  }

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
      `/transactions?` +
        `account_id=${accountId}&` +
        `since=${since.toISO()}&` +
        `expand[]=merchant`
    );

    return transactions
      .filter(({ decline_reason, amount }) => !decline_reason || amount !== 0)
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
