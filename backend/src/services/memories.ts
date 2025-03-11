import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase.js';

// Memory collection name
const MEMORIES_COLLECTION = 'memories';

// Memory type definition
export interface Memory {
  content: string;
  timestamp: Date | any;  // Could be a Date or a Firestore timestamp
  source: string;  // The message that generated this memory
  isGlobal: boolean;  // Whether this is a global memory
}

/**
 * Store a new memory in Firestore
 * @param content The content of the memory
 * @param source The source message that generated this memory
 * @returns The ID of the created memory document
 */
export async function storeMemory(content: string, source: string): Promise<string> {
  try {
    const newMemory: Memory = {
      content,
      timestamp: serverTimestamp(),
      source,
      isGlobal: true // For now, all memories are global
    };
    
    // Add to memories collection
    const docRef = await addDoc(collection(db, MEMORIES_COLLECTION), newMemory);
    console.log(`Stored memory with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('Error storing memory:', error);
    throw error;
  }
}

/**
 * Get all memories from Firestore
 * @returns Array of memories
 */
export async function getAllMemories(): Promise<Memory[]> {
  try {
    // Query memories collection, ordered by timestamp
    const q = query(
      collection(db, MEMORIES_COLLECTION),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const memories: Memory[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<Memory, 'id'>;
      
      // Convert Firestore timestamp to JavaScript Date if needed
      let timestamp = data.timestamp;
      if (timestamp && typeof timestamp.toDate === 'function') {
        timestamp = timestamp.toDate();
      }
      
      memories.push({
        ...data,
        timestamp
      });
    });
    
    return memories;
  } catch (error) {
    console.error('Error getting memories:', error);
    return [];
  }
} 