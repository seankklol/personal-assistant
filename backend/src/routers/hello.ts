import { z } from 'zod';
import { publicProcedure, router } from '../trpc.js';

export const helloRouter = router({
  greeting: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name ?? 'world'}!`,
        timestamp: new Date(),
      };
    }),
}); 