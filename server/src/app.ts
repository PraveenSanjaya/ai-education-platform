import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { errorHandler, notFound } from './middleware/http.js';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { adminRouter } from './routes/admin.js';
import { dictionaryRouter } from './routes/dictionary.js';
import { wordsRouter } from './routes/words.js';

export function createApp() {
  const app = express();
  app.use(cors({ origin: config.clientOrigin }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/dictionary', dictionaryRouter);
  app.use('/api/words', wordsRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
