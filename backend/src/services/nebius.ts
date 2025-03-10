import axios from 'axios';
import { CONFIG } from '../config.js';

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
  // Get the last user message
  const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
  
  if (!lastUserMessage) {
    return "I didn't receive a message to respond to. How can I help you?";
  }
  
  const userMessage = lastUserMessage.content.toLowerCase();
  
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

/**
 * Send a message to Nebius AI and get a response
 * @param messages Conversation history in the format expected by Nebius API
 * @returns The AI response text
 */
export async function sendMessageToNebiusAI(messages: NeblusRequestMessage[]): Promise<string> {
  try {
    if (!CONFIG.NEBIUS_API_KEY || CONFIG.NEBIUS_API_KEY === 'your_api_key_here') {
      console.log('Using test mode because API key is not configured');
      return generateTestResponse(messages);
    }

    // Construct the full API URL with the model path
    const apiUrl = `${CONFIG.NEBIUS_API_URL}/qwq`;
    
    console.log(`Sending request to Nebius AI at: ${apiUrl}`);
    
    const response = await axios.post<NebiusResponse>(
      apiUrl,
      {
        model: 'qwq-32b-v0', // Model ID for Nebius QwQ-32B
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Api-Key ${CONFIG.NEBIUS_API_KEY}`,
        },
        timeout: 30000, // 30 second timeout
      }
    );

    // Extract the generated text from the response
    if (response.data?.result?.generations?.[0]?.text) {
      return response.data.result.generations[0].text;
    } else {
      console.error('Invalid response format from Nebius API:', response.data);
      throw new Error('Invalid response format from Nebius API');
    }
  } catch (error) {
    console.error('Error calling Nebius AI API:', error);
    
    if (axios.isAxiosError(error)) {
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