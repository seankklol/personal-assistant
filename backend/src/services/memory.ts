import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendMessageToNebiusAI } from './nebius.js';

// Get the directory name using fileURLToPath
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the memory agent prompt file
const MEMORY_AGENT_PROMPT_PATH = path.join(__dirname, '..', 'memory_agent_prompt.txt');

// Read the memory agent system prompt
let memoryAgentPrompt: string | null = null;

/**
 * Loads the memory agent system prompt from file
 */
function loadMemoryAgentPrompt(): string {
  if (memoryAgentPrompt === null) {
    try {
      memoryAgentPrompt = fs.readFileSync(MEMORY_AGENT_PROMPT_PATH, 'utf-8');
      console.log('Memory agent prompt loaded successfully');
    } catch (error) {
      console.error('Error loading memory agent prompt:', error);
      memoryAgentPrompt = "You are a Memory Agent. Extract important information from user messages that should be remembered.";
    }
  }
  return memoryAgentPrompt;
}

/**
 * Process a user message through the memory agent to extract memories
 * @param userMessage The user message to process
 * @returns Array of extracted memories or empty array if none
 */
export async function processMessageForMemories(userMessage: string): Promise<string[]> {
  try {
    // Load the memory agent prompt
    const systemPrompt = loadMemoryAgentPrompt();
    
    // Send the user message to the memory agent
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userMessage }
    ];
    
    console.log('Sending message to memory agent for processing');
    const memoryAgentResponse = await sendMessageToNebiusAI(messages);
    console.log('Memory agent response:', memoryAgentResponse);
    
    // Process the response to extract memories
    if (memoryAgentResponse.includes('NO_MEMORY')) {
      console.log('No memories extracted from message');
      return [];
    }
    
    // Extract memories (format: MEMORY: [content])
    const memories: string[] = [];
    const memoryRegex = /MEMORY:\s*(.+?)(?=MEMORY:|$)/g;
    let match;
    
    while ((match = memoryRegex.exec(memoryAgentResponse)) !== null) {
      if (match[1] && match[1].trim()) {
        memories.push(match[1].trim());
      }
    }
    
    console.log(`Extracted ${memories.length} memories from message`);
    return memories;
  } catch (error) {
    console.error('Error processing message for memories:', error);
    return [];
  }
} 