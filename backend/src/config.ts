import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name for current module (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
// Try to load from project root as well as current directory
try {
  const rootEnvPath = path.resolve(__dirname, '../../.env');
  dotenv.config({ path: rootEnvPath });
} catch (error) {
  console.warn('Could not load .env file from root directory, trying current directory');
  dotenv.config();
}

// Export configuration variables
export const CONFIG = {
  PORT: process.env.PORT || 3000,
  NEBIUS_API_KEY: process.env.NEBIUS_API_KEY || '',
  NEBIUS_API_URL: process.env.NEBIUS_API_URL || 'https://api.studio.nebius.com/v1',
  
  // Firebase configuration
  FIREBASE: {
    apiKey: process.env.VITE_FIREBASE_API_KEY || '',
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.VITE_FIREBASE_APP_ID || '',
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || ''
  },
  
  // App configuration
  APP_ENV: process.env.NODE_ENV || 'development',
  TEST_MODE: !process.env.NEBIUS_API_KEY || process.env.NEBIUS_API_KEY === 'your_api_key_here',
};

// Validate required environment variables
export function validateConfig(): void {
  // Check if API key is provided but likely a placeholder
  if (CONFIG.NEBIUS_API_KEY && CONFIG.NEBIUS_API_KEY === 'your_api_key_here') {
    console.warn('Warning: NEBIUS_API_KEY is set to the placeholder value. Please replace with your actual API key.');
    console.warn('The application will run in test mode with simulated AI responses.');
  } 
  // Check if API key is not provided at all
  else if (!CONFIG.NEBIUS_API_KEY) {
    console.warn('Warning: NEBIUS_API_KEY is not set. The application will run in test mode with simulated AI responses.');
    console.warn('To use the full Nebius AI functionality, add your API key to the .env file.');
  }
  else {
    console.log('Nebius AI API key is configured.');
  }
  
  // Check Firebase configuration
  if (!CONFIG.FIREBASE.apiKey || !CONFIG.FIREBASE.projectId) {
    console.warn('Warning: Firebase configuration is incomplete. Logging to Firestore will not work.');
  } else {
    console.log('Firebase configuration is set up.');
  }
} 