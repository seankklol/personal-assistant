import { z } from 'zod';
import { publicProcedure, router } from '../trpc.js';
import { sendMessageToNebiusAI } from '../services/nebius.js';
import { logUserMessage, logAIResponse, logError } from '../services/logger.js';
import { processMessageForMemories } from '../services/memory.js';
import { storeMemory, getAllMemories } from '../services/memories.js';

// Message type definition
type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
};

// Simple in-memory store for chat messages in the testing phase
const chatMessages: ChatMessage[] = [];

export const chatRouter = router({
  // Send a message to the AI assistant
  sendMessage: publicProcedure
    .input(z.object({ 
      message: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Store the user message
      const userMessage: ChatMessage = {
        role: 'user',
        content: input.message,
        timestamp: new Date()
      };
      chatMessages.push(userMessage);
      
      try {
        // Log the user message
        await logUserMessage(input.message, { timestamp: userMessage.timestamp });
        
        // Process the message with the memory agent in parallel with the main AI response
        const memoryPromise = processMessageForMemories(input.message);
        
        // Prepare the messages for Nebius AI
        const nebiusMessages = chatMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        // Add a system message if there isn't one at the beginning
        if (nebiusMessages.length === 0 || nebiusMessages[0].role !== 'system') {
          nebiusMessages.unshift({
            role: 'system',
            content: 'You are a helpful, friendly and intelligent personal assistant.'
          });
        }
        
        // Send to Nebius AI and get response
        const aiResponseText = await sendMessageToNebiusAI(nebiusMessages);
        
        // Log the AI response
        await logAIResponse(aiResponseText, { 
          userMessage: input.message,
          timestamp: new Date()
        });
        
        // Store the assistant response
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: aiResponseText,
          timestamp: new Date()
        };
        chatMessages.push(assistantMessage);
        
        // Wait for the memory agent processing to complete and store the memories
        const extractedMemories = await memoryPromise;
        const storedMemoryIds: string[] = [];
        
        if (extractedMemories.length > 0) {
          console.log('Storing extracted memories:', extractedMemories);
          
          // Store each memory in Firestore
          for (const memoryContent of extractedMemories) {
            try {
              const memoryId = await storeMemory(memoryContent, input.message);
              storedMemoryIds.push(memoryId);
            } catch (error) {
              console.error('Error storing memory:', error);
            }
          }
        }
        
        return {
          message: assistantMessage,
          memories: extractedMemories
        };
      } catch (error) {
        console.error('Error in sendMessage:', error);
        
        // Log the error
        await logError(error instanceof Error ? error : String(error), {
          userMessage: input.message,
          timestamp: new Date()
        });
        
        // Create an error response
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: `I'm sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date()
        };
        chatMessages.push(errorMessage);
        
        return {
          message: errorMessage,
          memories: []
        };
      }
    }),
  
  // Get all chat messages
  getMessages: publicProcedure
    .query(() => {
      return chatMessages;
    }),
    
  // Get all memories
  getMemories: publicProcedure
    .query(async () => {
      return await getAllMemories();
    }),
}); 