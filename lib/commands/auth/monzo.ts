import open from "open";
import polka from "polka";
import yargs from "yargs";
import Monzo from "../../accounts/monzo";

export interface Argv {
  monzoClientId?: string;
  monzoClientSecret?: string;
  quiet?: boolean;
}

export const builder: { [key: string]: yargs.Options } = {
  "monzo-client-id": {
    string: true,
  },
  "monzo-client-secret": {
    string: true,
  },
  quiet: {
    boolean: true,
    default: false,
    describe: "Suppress non-essential output",
  },
};

export const handler = async ({
  monzoClientId,
  monzoClientSecret,
  quiet,
}: yargs.Arguments<Argv>) => {
  if (!monzoClientId || !monzoClientSecret) {
    throw new Error("You must provide a client ID and secret to auth Monzo");
  }

  await auth(monzoClientId, monzoClientSecret, quiet);
};

async function auth(clientId: string, clientSecret: string, quiet?: boolean) {
  const port = 3333;
  const redirectUri = `http://localhost:${port}`;

  const { state, url: authUrl } = Monzo.makeOAuthURL(clientId, redirectUri);

  quiet || console.log(`Opening your browser to: ${authUrl}`);
  await open(authUrl);

  const code = await new Promise<string>((resolve, reject) => {
    const app = polka();

    app.get("/", (req, res) => {
      const isSuccess = req.query.state === state;

      if (isSuccess) {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Success! Return to your terminal to continue...");
        quiet || console.log("Success!");
      } else {
        res.writeHead(401, { "Content-Type": "text/plain" });
        res.end("Invalid state!");
        quiet || console.log("Something went wrong.");
      }

      app.server!.close(() => {
        isSuccess
          ? resolve(req.query.code as string)
          : reject(new Error("Unable to successfully auth with Monzo"));
      });
    });

    app.listen(port, (err: any) => {
      if (err) {
        throw err;
      }

      quiet ||
        console.log(`Waiting for response from Monzo on port ${port}...`);
    });
  });

  quiet || console.log("Requesting access token from Monzo...");

  const { accessToken } = await Monzo.completeOAuth(
    clientId,
    clientSecret,
    redirectUri,
    code
  );

  quiet || console.log("Success!");

  console.log(`BUDGET_SYNC_MONZO_ACCESS_TOKEN=${accessToken}`);

  quiet || console.log("Now approve access in your Monzo app!");
}
