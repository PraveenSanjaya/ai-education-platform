import { config as loadEnv } from 'dotenv';
import { fileURLToPath } from 'node:url';

// Load the repo-root .env (works from src/ and dist/), then fall back to a .env in the cwd.
loadEnv({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });
loadEnv();

export const config = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/ai-education-platform',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  translateKey: process.env.GOOGLE_TRANSLATE_API_KEY ?? '',
};
