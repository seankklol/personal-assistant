import { z } from 'zod';
import { publicProcedure, router } from '../trpc.js';
import { sendMessageToNebiusAI } from '../services/nebius.js';
import { logUserMessage, logAIResponse, logError } from '../services/logger.js';
import { processMessageForMemories } from '../services/memory.js';
import { storeMemory, getAllMemories, deleteMemory, getRelevantMemories } from '../services/memories.js';

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
      console.log('\n=== NEW USER QUERY ===');
      console.log('User Query:', input.message);
      
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
        console.log('\n=== MEMORY AGENT PROCESSING ===');
        console.log('Sending to Memory Agent:', input.message);
        const memoryPromise = processMessageForMemories(input.message);
        
        // Get relevant memories for this message
        const relevantMemories = await getRelevantMemories(input.message);
        
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
        
        // Add memories to the context if there are any
        if (relevantMemories.length > 0) {
          console.log('\n=== ADDING MEMORIES TO CONTEXT ===');
          
          // Format memories as a string to add to the system message
          const memoriesText = relevantMemories
            .map((memory, index) => `Memory ${index + 1}: ${memory.content}`)
            .join('\n');
          
          // Append memories to the system message
          const systemMessageIndex = nebiusMessages.findIndex(msg => msg.role === 'system');
          if (systemMessageIndex !== -1) {
            const originalSystemMessage = nebiusMessages[systemMessageIndex].content;
            
            nebiusMessages[systemMessageIndex].content = `${originalSystemMessage}\n\nHere are some relevant memories that might help with your response:\n${memoriesText}\n\nUse these memories when they are relevant to the conversation.`;
            
            console.log('Updated system message with memories');
          } else {
            console.log('Could not find system message to update with memories');
          }
        } else {
          console.log('No relevant memories to add to context');
        }
        
        console.log('\n=== ASSISTANT AI INPUT ===');
        console.log('Full context sent to Assistant AI:');
        nebiusMessages.forEach((msg, index) => {
          console.log(`[${index}] ${msg.role}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
        });
        
        // Send to Nebius AI and get response
        const aiResponseText = await sendMessageToNebiusAI(nebiusMessages);
        
        console.log('\n=== ASSISTANT AI RESPONSE ===');
        console.log(`Response: ${aiResponseText.substring(0, 100)}${aiResponseText.length > 100 ? '...' : ''}`);
        
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
        
        console.log('\n=== MEMORY AGENT RESULTS ===');
        if (extractedMemories.length > 0) {
          console.log('Extracted memories:', extractedMemories);
          
          // Store each memory in Firestore
          for (const memoryContent of extractedMemories) {
            try {
              const memoryId = await storeMemory(memoryContent, input.message);
              console.log(`Stored memory: "${memoryContent}" with ID: ${memoryId}`);
              storedMemoryIds.push(memoryId);
            } catch (error) {
              console.error('Error storing memory:', error);
            }
          }
        } else {
          console.log('No memories extracted from this message');
        }
        
        console.log('\n=== RESPONSE COMPLETE ===\n');
        
        return {
          message: assistantMessage,
          memories: extractedMemories,
          usedMemories: relevantMemories.map(m => m.content)
        };
      } catch (error) {
        console.error('\n=== ERROR IN PROCESSING ===');
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
          memories: [],
          usedMemories: []
        };
      }
    }),
  
  // Get all chat messages
  getMessages: publicProcedure
    .query(() => {
      console.log('Retrieving all chat messages');
      return chatMessages;
    }),
    
  // Get all memories
  getMemories: publicProcedure
    .query(async () => {
      console.log('Retrieving all memories from database');
      const memories = await getAllMemories();
      console.log(`Retrieved ${memories.length} memories`);
      return memories;
    }),
    
  // Delete a memory
  deleteMemory: publicProcedure
    .input(z.object({
      memoryId: z.string()
    }))
    .mutation(async ({ input }) => {
      console.log(`Deleting memory with ID: ${input.memoryId}`);
      try {
        await deleteMemory(input.memoryId);
        console.log(`Successfully deleted memory: ${input.memoryId}`);
        return { success: true };
      } catch (error) {
        console.error('Error deleting memory:', error);
        throw error;
      }
    }),

  // Create a new memory
  createMemory: publicProcedure
    .input(z.object({
      content: z.string()
    }))
    .mutation(async ({ input }) => {
      console.log(`Creating new memory: "${input.content}"`);
      try {
        const memoryId = await storeMemory(input.content);
        console.log(`Successfully created memory with ID: ${memoryId}`);
        return { success: true, memoryId };
      } catch (error) {
        console.error('Error creating memory:', error);
        throw error;
      }
    }),
}); 