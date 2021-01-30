import Monzo from "./lib/accounts/monzo";
import YNAB from "./lib/budgets/ynab";

const { MONZO_ACCESS_TOKEN, YNAB_ACCESS_TOKEN } = process.env;

(async function run() {
  if (MONZO_ACCESS_TOKEN) {
    const monzo = new Monzo({ accessToken: MONZO_ACCESS_TOKEN });

    console.log(await monzo.listAccounts());
  }

  if (YNAB_ACCESS_TOKEN) {
    const ynab = new YNAB({ accessToken: YNAB_ACCESS_TOKEN });

    console.log(await ynab.listBudgets());
  }

  console.log("Done!");
})();
