import { z } from 'zod';
import { publicProcedure, router } from '../trpc.js';
import { sendMessageToNebiusAI } from '../services/nebius.js';

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
        
        // Store the assistant response
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: aiResponseText,
          timestamp: new Date()
        };
        chatMessages.push(assistantMessage);
        
        return assistantMessage;
      } catch (error) {
        console.error('Error in sendMessage:', error);
        
        // Create an error response
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: `I'm sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date()
        };
        chatMessages.push(errorMessage);
        
        return errorMessage;
      }
    }),
  
  // Get all chat messages
  getMessages: publicProcedure
    .query(() => {
      return chatMessages;
    }),
}); 