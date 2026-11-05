import { createApp } from './app.js';
import { connectDb } from './db.js';
import { config } from './config.js';

async function main() {
  await connectDb();
  createApp().listen(config.port, () => console.log(`API listening on :${config.port}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
