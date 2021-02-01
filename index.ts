import { DateTime } from "luxon";
import { AccountProvider } from "./lib/accounts";
import Monzo from "./lib/accounts/monzo";
import YNAB from "./lib/budgets/ynab";

const {
  MONZO_ACCESS_TOKEN,
  YNAB_ACCESS_TOKEN,
  YNAB_BUDGET_ID,
  YNAB_ACCOUNT_MAP,
  DAYS_TO_SYNC,
} = process.env;

const DEFAULT_DAYS_TO_SYNC = 14;

process.on("unhandledRejection", (error) => {
  console.error(error);
  process.exit(1);
});

(async function run() {
  const since = DateTime.utc()
    .startOf("day")
    .minus({
      days: DAYS_TO_SYNC ? parseInt(DAYS_TO_SYNC) : DEFAULT_DAYS_TO_SYNC,
    });

  const providers: { [name: string]: AccountProvider<any> } = {};

  if (MONZO_ACCESS_TOKEN) {
    console.log("Initializing monzo provider...");
    providers.monzo = new Monzo({ accessToken: MONZO_ACCESS_TOKEN });
  }

  if (YNAB_ACCESS_TOKEN && YNAB_BUDGET_ID && YNAB_ACCOUNT_MAP) {
    console.log("Initializing ynab provider...");
    const ynab = new YNAB({ accessToken: YNAB_ACCESS_TOKEN });

    console.log("Syncing ynab budget following $YNAB_ACCOUNT_MAP...");
    const accountMap = JSON.parse(YNAB_ACCOUNT_MAP);

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
        YNAB_BUDGET_ID,
        budgetAccountId,
        since,
        accountTransactions
      );
      console.log(`Synced ${count} transactions with ynab.`);
    }
  }

  console.log("Done!");
})();
