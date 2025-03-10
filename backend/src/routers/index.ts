import { router } from '../trpc.js';
import { helloRouter } from './hello.js';
import { chatRouter } from './chat.js';

// Combine all routers
export const appRouter = router({
  hello: helloRouter,
  chat: chatRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter; 