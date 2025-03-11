import express, { Request, Response } from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './routers/index.js';
import { CONFIG, validateConfig } from './config.js';

// Initialize and validate configuration
validateConfig();

const app = express();
const PORT = CONFIG.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// tRPC middleware
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Welcome to the Express server!',
    aiStatus: CONFIG.NEBIUS_API_KEY ? 'connected' : 'not configured'
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok',
    aiStatus: CONFIG.NEBIUS_API_KEY ? 'configured' : 'not configured'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Nebius AI API ${CONFIG.NEBIUS_API_KEY ? 'is configured' : 'is NOT configured - set NEBIUS_API_KEY in .env'}`);
  if (CONFIG.NEBIUS_API_KEY) {
    console.log('Nebius AI API is configured to use the OpenAI-compatible endpoint');
  }
});

export default app;
export type { AppRouter } from './routers/index.js'; 