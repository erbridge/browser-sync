import yargs from "yargs";
import * as run from "./lib/commands/run";

process.on("unhandledRejection", (error) => {
  console.error(error);
  process.exit(1);
});

yargs(process.argv.slice(2))
  .env("BUDGET_SYNC")
  .command(run)
  .demandCommand(1, "You must specify a command")
  .recommendCommands()
  .completion("completion", "Generate a completion script")
  .help()
  .version(false)
  .strictCommands()
  .parse();
