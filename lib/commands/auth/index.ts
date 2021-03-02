import yargs from "yargs";
import * as monzo from "./monzo";

export enum Provider {
  Monzo = "monzo",
}

export interface Argv extends monzo.Argv {
  provider?: Provider;
}

export type Command = yargs.CommandModule<Argv, Argv>;

export const command: Command["command"] = "auth <provider>";
export const describe: Command["describe"] =
  "Auth an account or budget provider";

export const builder: Command["builder"] = (args) =>
  args
    .positional("provider", {
      describe: "Account or budget provider to auth",
      choices: [Provider.Monzo],
    })
    .group(["help"], "General options:")
    .options(monzo.builder)
    .group(Object.keys(monzo.builder), "Monzo options:");

export const handler: Command["handler"] = async (
  args: yargs.Arguments<Argv>
) => {
  switch (args.provider) {
    case Provider.Monzo:
      await monzo.handler(args);
      break;
    default:
      throw new Error("Unknown provider");
  }
};
