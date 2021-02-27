import { DateTime } from "luxon";
import yargs from "yargs";
import { AccountProvider } from "../accounts";
import Monzo from "../accounts/monzo";
import YNAB from "../budgets/ynab";

export interface Argv {
  daysToSync?: number;
  monzoAccessToken?: string;
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
    .group(["days-to-sync", "help"], "General options:")
    .group(["monzo-access-token"], "Monzo options:")
    .group(
      ["ynab-access-token", "ynab-account-map", "ynab-budget-id"],
      "YNAB options:"
    );

export const handler: Command["handler"] = async ({
  daysToSync,
  monzoAccessToken,
  ynabAccessToken,
  ynabBudgetId,
  ynabAccountMap,
}) => {
  const since = DateTime.utc().startOf("day").minus({ days: daysToSync });

  const providers: { [name: string]: AccountProvider<any> } = {};

  if (monzoAccessToken) {
    console.log("Initializing monzo provider...");
    providers.monzo = new Monzo({ accessToken: monzoAccessToken });
  }

  if (Object.keys(providers).length === 0) {
    console.error("No account providers specified.");
    return;
  }

  if (ynabAccessToken && ynabBudgetId && ynabAccountMap) {
    console.log("Initializing ynab provider...");
    const ynab = new YNAB({ accessToken: ynabAccessToken });

    console.log("Syncing ynab budget following the ynab account map...");
    const accountMap = JSON.parse(ynabAccountMap);

    for (const [budgetAccountId, realAccountId] of Object.entries<string>(
      accountMap
    )) {
      const [accountProviderName, accountId] = realAccountId.split(":");
      const accountProvider = providers[accountProviderName];

      console.log(`Fetching ${accountProviderName} transactions...`);
      const accountTransactions = await accountProvider.listTransactions(
        accountId,
        since
      );

      console.log("Syncing transactions with ynab...");
      const count = await ynab.syncTransactions(
        ynabBudgetId,
        budgetAccountId,
        since,
        accountTransactions
      );
      console.log(`Synced ${count} transactions with ynab.`);
    }
  }

  console.log("Done!");
};