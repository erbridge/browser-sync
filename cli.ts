#!/usr/bin/env node

import yargs from "yargs";
import * as auth from "./lib/commands/auth";
import * as run from "./lib/commands/run";

process.on("unhandledRejection", (error) => {
  console.error(error);
  process.exit(1);
});

type Argv = auth.Argv & run.Argv;

yargs(process.argv.slice(2))
  .env("BUDGET_SYNC")
  .command<Argv>(run)
  .command<Argv>(auth)
  .demandCommand(1, "You must specify a command")
  .recommendCommands()
  .completion("completion", "Generate a completion script")
  .help()
  .version(false)
  .strictCommands()
  .updateStrings({
    "Positionals:": "Subcommands:",
  })
  .parse();
