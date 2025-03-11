import axios from 'axios';
import { CONFIG } from '../config.js';
import OpenAI from 'openai';

// Interface definitions
interface NeblusRequestMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface NebiusResponse {
  result: {
    generations: Array<{
      text: string;
    }>;
  };
}

/**
 * Simple test mode response generator for when the API key is not configured
 * This allows testing without an actual API key
 */
function generateTestResponse(messages: NeblusRequestMessage[]): string {
  console.log('\n=== NEBIUS AI TEST MODE ===');
  console.log('API key not configured, using test mode response');
  
  // Get the last user message
  const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
  
  if (!lastUserMessage) {
    return "I didn't receive a message to respond to. How can I help you?";
  }
  
  const userMessage = lastUserMessage.content.toLowerCase();
  console.log('Last user message:', userMessage);
  
  // Simple response patterns
  if (userMessage.includes('hello') || userMessage.includes('hi')) {
    return "Hello there! I'm running in test mode since the Nebius API key is not configured. To use the actual AI, please set the NEBIUS_API_KEY in your .env file.";
  }
  
  if (userMessage.includes('help')) {
    return "I'm here to help! Currently running in test mode. To use the full Nebius AI capabilities, please configure your API key.";
  }
  
  if (userMessage.includes('weather')) {
    return "I'm sorry, I can't check the weather in test mode. To use the full AI capabilities, please configure your Nebius API key.";
  }
  
  // Default response
  return `You said: "${lastUserMessage.content}". This is a test response because the Nebius API key is not configured. To use the actual AI, please set the NEBIUS_API_KEY in your .env file.`;
}

// Initialize OpenAI client with Nebius API settings
let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!openaiClient && CONFIG.NEBIUS_API_KEY) {
    console.log('Initializing OpenAI client with Nebius API settings');
    openaiClient = new OpenAI({
      baseURL: 'https://api.studio.nebius.com/v1/',
      apiKey: CONFIG.NEBIUS_API_KEY,
    });
  }
  return openaiClient;
}

/**
 * Send a message to Nebius AI and get a response
 * @param messages Conversation history in the format expected by Nebius API
 * @returns The AI response text
 */
export async function sendMessageToNebiusAI(messages: NeblusRequestMessage[]): Promise<string> {
  try {
    console.log('\n=== NEBIUS AI SERVICE ===');
    
    if (!CONFIG.NEBIUS_API_KEY || CONFIG.NEBIUS_API_KEY === 'your_api_key_here') {
      console.log('Using test mode because API key is not configured');
      return generateTestResponse(messages);
    }

    const client = getOpenAIClient();
    if (!client) {
      throw new Error('Failed to initialize OpenAI client');
    }
    
    console.log('Sending request to Nebius AI via OpenAI client');
    
    // Prepare messages for the API
    const formattedMessages = [];
    
    // Add system message if not present
    if (!messages.some(msg => msg.role === 'system')) {
      formattedMessages.push({
        role: 'system' as const,
        content: 'You are a helpful, friendly and intelligent personal assistant.'
      });
    }
    
    // Add all messages
    messages.forEach(msg => {
      formattedMessages.push({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      });
    });
    
    console.log('\n--- NEBIUS AI REQUEST ---');
    console.log('Model: meta-llama/Llama-3.3-70B-Instruct');
    console.log('Temperature: 0.5');
    console.log('Messages:');
    formattedMessages.forEach((msg, index) => {
      console.log(`[${index}] ${msg.role}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
    });
    
    console.log('\nSending request to Nebius AI...');
    const startTime = Date.now();
    
    const response = await client.chat.completions.create({
      model: 'meta-llama/Llama-3.3-70B-Instruct',
      messages: formattedMessages,
      temperature: 0.5,
    });

    const endTime = Date.now();
    console.log(`Request completed in ${endTime - startTime}ms`);
    
    console.log('\n--- NEBIUS AI RESPONSE ---');
    
    // Extract the generated text from the response
    if (response?.choices?.[0]?.message?.content) {
      const content = response.choices[0].message.content;
      console.log(`Response (${content.length} chars): ${content.substring(0, 150)}${content.length > 150 ? '...' : ''}`);
      return content;
    } else {
      console.error('Invalid response format from Nebius API:', response);
      throw new Error('Invalid response format from Nebius API');
    }
  } catch (error) {
    console.error('\n--- NEBIUS AI ERROR ---');
    console.error('Error calling Nebius AI API:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      if (error.code === 'ConnectionRefused' || error.code === 'ECONNREFUSED') {
        return `Error connecting to Nebius API. Please check your internet connection and firewall settings. If the issue persists, verify that the API URL is correct.`;
      }
      
      if (error.response) {
        // The request was made and the server responded with a status code
        return `Error from Nebius API: Status ${error.response.status} - ${error.response.statusText}. ${JSON.stringify(error.response.data || {})}`;
      } else if (error.request) {
        // The request was made but no response was received
        return `No response received from Nebius API. Please check your API URL and internet connection.`;
      }
      return `Error: ${error.message}`;
    }
    
    return `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
  }
}