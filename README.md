# budget-sync

Sync account transactions with your budgeting service!

## What?

I use a budgeting service called YNAB. I'm based in the UK, while YNAB is in the
USA, so their built-in account synchronization doesn't support any of my bank
accounts. I finally got fed up of how flaky the third-party sync service I was
using was, so I built this!

This tool is configured entirely by environment variables. It's set up to run
for me every hour via a GitHub Actions workflow, but you're welcome to fork it
for yourself.

## How?

1. Fork this repository.
1. Set the GitHub secrets according to the `.env.example` file.

   - You'll need to get API access tokens for the services you're using. I leave
     that as an exercise for the reader.
   - You'll also want to specify an account map (eg `$YNAB_ACCOUNT_MAP` for
     YNAB), to tell budget-sync how your accounts match up with your budgets. We
     expect an account map to be a JSON string in the following form:

     ```json
     { "<budget_account_id>": "<account_provider>:<account_id>", "<budget_account_id>": "<account_provider>:<account_id>", ... }
     ```

     where `<budget_account_id>` is the ID of an account's internal
     representation in your budgeting service, `<account_provider>` is the name
     of the module to use to communicate with your account (eg `monzo` for
     Monzo), and `<account_id>` is the account provider's ID for your account in
     their API.

1. Wait up to an hour and check the action ran.

You can also run the tool locally using a `.env` file and `npm run dev`, if
you'd prefer.

### Supported services

Accounts:

- Monzo (`monzo`)

Budgets:

- YNAB (`ynab`)

Open a pull request to add more!
