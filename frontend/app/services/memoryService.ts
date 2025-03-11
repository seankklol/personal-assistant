import { trpc } from '../utils/trpc';

/**
 * Fetch all memories from the backend
 * @returns Query result with all memories
 */
export function useGetMemories() {
  return trpc.chat.getMemories.useQuery();
}

/**
 * Create a new memory
 * @returns Mutation function to create a memory
 */
export function useCreateMemory() {
  return trpc.chat.createMemory.useMutation();
}

/**
 * Delete a memory
 * @returns Mutation function to delete a memory
 */
export function useDeleteMemory() {
  return trpc.chat.deleteMemory.useMutation();
} 