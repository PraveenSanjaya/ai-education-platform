// Starts everything the e2e suite needs: in-memory MongoDB, the API and the Vite dev client.
// Playwright runs this as its webServer and waits for the client URL.
import { spawn } from 'node:child_process';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { resolve } from 'node:path';

const root = process.cwd();

const API_PORT = 4100;
const CLIENT_PORT = 5180;
const mongo = await MongoMemoryServer.create();
const children = [];

const run = (cmd, args, cwd, env) => {
  const c = spawn(process.execPath, [cmd, ...args], {
    cwd,
    env: { ...process.env, ...env },
    stdio: 'inherit',
  });
  c.on('exit', (code) => {
    if (code) console.error(`${cmd} exited with ${code}`);
  });
  children.push(c);
};

run(resolve(root, 'node_modules/tsx/dist/cli.mjs'), ['server/src/index.ts'], root, {
  PORT: String(API_PORT),
  MONGODB_URI: mongo.getUri('e2e'),
  JWT_SECRET: 'e2e-secret-e2e-secret-e2e-secret-123',
  CLIENT_ORIGIN: `http://localhost:${CLIENT_PORT}`,
  GOOGLE_TRANSLATE_API_KEY: '',
});
run(
  resolve(root, 'node_modules/vite/bin/vite.js'),
  ['--port', String(CLIENT_PORT), '--strictPort', '--host', '127.0.0.1'],
  resolve(root, 'client'),
  {
    API_PROXY: `http://localhost:${API_PORT}`,
  },
);

const stop = async () => {
  children.forEach((c) => c.kill());
  await mongo.stop();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
