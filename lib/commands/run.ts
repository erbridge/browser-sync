import { DateTime } from "luxon";
import yargs from "yargs";
import { AccountProvider } from "../accounts";
import Monzo from "../accounts/monzo";
import YNAB from "../budgets/ynab";

export interface Argv {
  daysToSync?: number;
  monzoAccessToken?: string;
  quiet?: boolean;
  ynabAccessToken?: string;
  ynabAccountMap?: string;
  ynabBudgetId?: string;
}

type Command = yargs.CommandModule<Argv, Argv>;

export const command: Command["command"] = "run";
export const aliases: Command["aliases"] = ["start", "sync"];
export const describe: Command["describe"] =
  "Synchronize configured accounts to budgets";

export const builder: Command["builder"] = (args) =>
  args
    .options({
      "days-to-sync": {
        describe: "Number of days in past to synchronize",
        default: 14,
        number: true,
      },
      "monzo-access-token": {
        string: true,
      },
      quiet: {
        boolean: true,
        default: false,
        describe: "Suppress non-essential output",
      },
      "ynab-access-token": {
        string: true,
      },
      "ynab-account-map": {
        describe:
          'Stringified JSON specifying how YNAB budget accounts map to real accounts:\n\n{ "<budget_account_id>": "<account_provider>:<account_id>", ... }\n\n<budget_account_id> = ID of an account\'s internal representation in your budgeting service\n\n<account_provider> = name of module to use to communicate with your account (eg "monzo" for Monzo)\n\n<account_id> = account provider\'s ID for your account in their API',
        string: true,
      },
      "ynab-budget-id": {
        string: true,
      },
    })
    .group(["days-to-sync", "help", "quiet"], "General options:")
    .group(["monzo-access-token"], "Monzo options:")
    .group(
      ["ynab-access-token", "ynab-account-map", "ynab-budget-id"],
      "YNAB options:"
    );

export const handler: Command["handler"] = async ({
  daysToSync,
  monzoAccessToken,
  quiet,
  ynabAccessToken,
  ynabBudgetId,
  ynabAccountMap,
}) => {
  const since = DateTime.utc().startOf("day").minus({ days: daysToSync });

  const accountProviders: { [name: string]: AccountProvider<any> } = {};

  if (monzoAccessToken) {
    quiet || console.log("Initializing monzo provider...");
    accountProviders.monzo = new Monzo({ accessToken: monzoAccessToken });
  }

  if (Object.keys(accountProviders).length === 0) {
    throw new Error("No account providers specified");
  }

  if (ynabAccessToken && ynabBudgetId && ynabAccountMap) {
    syncYnab(
      ynabAccessToken,
      ynabBudgetId,
      ynabAccountMap,
      accountProviders,
      since
    );
  }
};

async function syncYnab(
  accessToken: string,
  budgetId: string,
  rawAccountMap: string,
  accountProviders: { [name: string]: AccountProvider<any> },
  since: DateTime,
  quiet?: boolean
) {
  quiet || console.log("Initializing ynab provider...");
  const ynab = new YNAB({ accessToken });

  quiet || console.log("Syncing ynab budget following the ynab account map...");
  const accountMap: { [id: string]: string } = JSON.parse(rawAccountMap);

  for (const [budgetAccountId, realAccountId] of Object.entries(accountMap)) {
    const [accountProviderName, accountId] = realAccountId.split(":");
    const accountProvider = accountProviders[accountProviderName];

    quiet || console.log(`Fetching ${accountProviderName} transactions...`);
    const accountTransactions = await accountProvider.listTransactions(
      accountId,
      since
    );

    quiet || console.log("Syncing transactions with ynab...");
    const count = await ynab.syncTransactions(
      budgetId,
      budgetAccountId,
      since,
      accountTransactions
    );
    quiet || console.log(`Synced ${count} transactions with ynab.`);
  }
}
