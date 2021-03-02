import open from "open";
import polka from "polka";
import yargs from "yargs";
import Monzo from "../../accounts/monzo";

export interface Argv {
  monzoClientId?: string;
  monzoClientSecret?: string;
}

export const builder: { [key: string]: yargs.Options } = {
  "monzo-client-id": {
    string: true,
  },
  "monzo-client-secret": {
    string: true,
  },
};

export const handler = async ({
  monzoClientId,
  monzoClientSecret,
}: yargs.Arguments<Argv>) => {
  if (!monzoClientId || !monzoClientSecret) {
    throw new Error("You must provide a client ID and secret to auth Monzo");
  }

  await auth(monzoClientId, monzoClientSecret);
};

async function auth(clientId: string, clientSecret: string) {
  const port = 3333;
  const redirectUri = `http://localhost:${port}`;

  const { state, url: authUrl } = Monzo.makeOAuthURL(clientId, redirectUri);

  console.log(`Opening your browser to: ${authUrl}`);
  await open(authUrl);

  const code = await new Promise<string>((resolve, reject) => {
    const app = polka();

    app.get("/", (req, res) => {
      const isSuccess = req.query.state === state;

      if (isSuccess) {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Success! Return to your terminal to continue...");
        console.log("Success!");
      } else {
        res.writeHead(401, { "Content-Type": "text/plain" });
        res.end("Invalid state!");
        console.log("Something went wrong.");
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

      console.log(`Waiting for response from Monzo on port ${port}...`);
    });
  });

  console.log("Requesting access token from Monzo...");

  const { accessToken } = await Monzo.completeOAuth(
    clientId,
    clientSecret,
    redirectUri,
    code
  );

  console.log("Success!");

  console.log(`BUDGET_SYNC_MONZO_ACCESS_TOKEN=${accessToken}`);

  console.log("Now approve access in your Monzo app!");
}
