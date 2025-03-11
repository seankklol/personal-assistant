import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import { QueryClient } from '@tanstack/react-query';

// Import types - using a type-only import with a relative path to the backend
import type { AppRouter } from '../../../backend/src/routers/index.js';

export const trpc = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient();

// Create tRPC client
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:3001/trpc',
    }),
  ],
}); 