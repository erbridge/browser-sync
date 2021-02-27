# budget-sync

Sync account transactions with your budgeting service!

## What's this for?

I use a budgeting service called YNAB. I'm based in the UK, while YNAB is in the
USA, so their built-in account synchronization doesn't support any of my bank
accounts. I finally got fed up with how flaky the third-party sync service I was
using was, so I built this!

This tool is a command line interface to synchronize your accounts with your
budgets. It's set up to run for me every hour from this repository via a GitHub
Actions workflow, and you're welcome to fork it to have the same for yourself.
Or you can install the package and run it any other way you choose.

## Usage

### Manual

To install:

```
npm install --global budget-sync
```

To see general usage instructions:

```
budget-sync help
```

To see usage instructions for a specific command:

```
budget-sync <command> help
```

All options can be also be set via environment variables using a
`SCREAMING_SNAKE_CASE` formatted version of the option name with a
`BUDGET_SYNC_` prefix. For example, the option `--days-to-sync` matches the
environment variable named `BUDGET_SYNC_DAYS_TO_SYNC`.

### On a schedule

1. Fork this repository
1. Set the GitHub respository secrets according to the `.env.example` file

   - You'll need to get API access tokens for the services you're using. I leave
     that as an exercise for the reader.
   - You'll also want to specify an account map (eg
     `$BUDGET_SYNC_YNAB_ACCOUNT_MAP` for YNAB), to tell budget-sync how your
     accounts match up with your budgets. We expect an account map to be
     stringified JSON in the following form:

     ```json
     { "<budget_account_id>": "<account_provider>:<account_id>", ... }
     ```

     where `<budget_account_id>` is the ID of an account's internal
     representation in your budgeting service, `<account_provider>` is the name
     of the module to use to communicate with your account (eg `monzo` for
     Monzo), and `<account_id>` is the account provider's ID for your account in
     their API.

1. Wait up to an hour and check the workflow ran successfully

## Supported services

Accounts:

- Monzo (`monzo`)

Budgets:

- YNAB (`ynab`)

Open a pull request to add more!
