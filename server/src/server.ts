import { env } from "./config/env";
import { createApp } from "./app";

const app = createApp();

app.listen(env.port, () => {
  console.log(`Urja Basket API listening on http://localhost:${env.port}`);
});
