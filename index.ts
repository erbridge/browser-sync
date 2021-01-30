import YNAB from "./lib/budgets/ynab";

const { YNAB_ACCESS_TOKEN } = process.env;

(async function run() {
  if (YNAB_ACCESS_TOKEN) {
    const ynab = new YNAB({ accessToken: YNAB_ACCESS_TOKEN });

    console.log(await ynab.listBudgets());
  }

  console.log("Done!");
})();
