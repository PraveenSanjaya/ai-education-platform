# AI Education Platform

An English-learning web app for Sinhala-speaking learners: save words with automatic Sinhala meanings,
practise vocabulary, follow an adaptive grammar path, and review your history.

## Stack

React 18 + Vite + TypeScript + Tailwind (client) · Node + Express + TypeScript (server) · MongoDB + Mongoose.

## Run

```bash
cp .env.example .env     # edit values
npm install
npm run dev              # client :5173, server :4000
npm test
npm run lint
```

Requires a running MongoDB (`MONGODB_URI` in `.env`).
