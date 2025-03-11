import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase.js';

// Define the log entry interface
export interface LogEntry {
  type: 'user_message' | 'ai_response' | 'error' | 'system';
  content: string;
  metadata?: Record<string, any>;
  timestamp?: any;
}

/**
 * Logs an entry to console only (no longer saving to Firestore)
 * @param entry The log entry to display
 * @returns Empty string as we no longer return a document ID
 */
export async function logToFirestore(entry: LogEntry): Promise<string> {
  try {
    // Add timestamp if not provided
    const entryWithTimestamp = {
      ...entry,
      timestamp: entry.timestamp || new Date()
    };
    
    // Log to console instead of Firestore
    console.log(`LOG [${entry.type}]:`, entry.content, entryWithTimestamp.metadata || '');
    return '';
  } catch (error) {
    console.error('Error logging:', error);
    // Still log to console if there's an error
    console.log('Log entry that failed:', JSON.stringify(entry));
    return '';
  }
}

/**
 * Logs a user message
 * @param message The user's message
 * @param metadata Additional metadata
 * @returns Empty string as we no longer return a document ID
 */
export async function logUserMessage(message: string, metadata?: Record<string, any>): Promise<string> {
  return logToFirestore({
    type: 'user_message',
    content: message,
    metadata
  });
}

/**
 * Logs an AI response
 * @param response The AI's response
 * @param metadata Additional metadata
 * @returns Empty string as we no longer return a document ID
 */
export async function logAIResponse(response: string, metadata?: Record<string, any>): Promise<string> {
  return logToFirestore({
    type: 'ai_response',
    content: response,
    metadata
  });
}

/**
 * Logs an error
 * @param error The error message or object
 * @param metadata Additional metadata
 * @returns Empty string as we no longer return a document ID
 */
export async function logError(error: string | Error, metadata?: Record<string, any>): Promise<string> {
  const errorMessage = error instanceof Error ? error.message : error;
  return logToFirestore({
    type: 'error',
    content: errorMessage,
    metadata: {
      ...metadata,
      stack: error instanceof Error ? error.stack : undefined
    }
  });
}

/**
 * Logs a system message
 * @param message The system message
 * @param metadata Additional metadata
 * @returns Empty string as we no longer return a document ID
 */
export async function logSystem(message: string, metadata?: Record<string, any>): Promise<string> {
  return logToFirestore({
    type: 'system',
    content: message,
    metadata
  });
} 