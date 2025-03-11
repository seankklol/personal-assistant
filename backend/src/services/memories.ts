import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp, limit } from 'firebase/firestore';
import { db } from './firebase.js';

// Memory collection name
const MEMORIES_COLLECTION = 'memories';

// Memory type definition
export interface Memory {
  id?: string;      // The Firestore document ID
  content: string;
  timestamp: Date | any;  // Could be a Date or a Firestore timestamp
  source?: string;  // The message that generated this memory (now optional)
  isGlobal: boolean;  // Whether this is a global memory
}

/**
 * Retrieve relevant memories for a given message
 * This is a simple implementation that retrieves the most recent memories
 * In a real implementation, you would use semantic search or embeddings to find relevant memories
 * @param message The message to retrieve relevant memories for
 * @param maxMemories Maximum number of memories to retrieve (default: 5)
 * @returns Array of relevant memories
 */
export async function getRelevantMemories(message: string, maxMemories: number = 5): Promise<Memory[]> {
  try {
    console.log('\n=== RETRIEVING RELEVANT MEMORIES ===');
    console.log(`Input message: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`);
    console.log(`Max memories to retrieve: ${maxMemories}`);
    
    // In a production system, you would:
    // 1. Generate an embedding for the input message
    // 2. Perform a vector similarity search to find relevant memories
    // 3. Return the most relevant memories
    
    // For now, we'll just retrieve the most recent memories as a simple implementation
    const q = query(
      collection(db, MEMORIES_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(maxMemories)
    );
    
    console.log('Executing Firestore query for relevant memories');
    const querySnapshot = await getDocs(q);
    console.log(`Query returned ${querySnapshot.size} memories`);
    
    const memories: Memory[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<Memory, 'id'>;
      
      // Convert Firestore timestamp to JavaScript Date if needed
      let timestamp = data.timestamp;
      if (timestamp && typeof timestamp.toDate === 'function') {
        timestamp = timestamp.toDate();
      }
      
      const memory = {
        ...data,
        timestamp,
        id: doc.id
      };
      
      console.log(`Relevant memory [${doc.id}]: "${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}"`);
      memories.push(memory);
    });
    
    console.log(`=== RETRIEVED ${memories.length} RELEVANT MEMORIES ===\n`);
    return memories;
  } catch (error) {
    console.error('\n=== ERROR RETRIEVING RELEVANT MEMORIES ===');
    console.error('Error getting relevant memories:', error);
    return [];
  }
}

/**
 * Store a new memory in Firestore
 * @param content The content of the memory
 * @param source Optional source message that generated this memory
 * @returns The ID of the created memory document
 */
export async function storeMemory(content: string, source?: string): Promise<string> {
  try {
    console.log('\n=== STORING NEW MEMORY ===');
    console.log(`Memory content: "${content}"`);
    if (source) {
      console.log(`Source: "${source.substring(0, 50)}${source.length > 50 ? '...' : ''}"`);
    } else {
      console.log('Source: Manually added by user');
    }
    
    const newMemory: Memory = {
      content,
      timestamp: serverTimestamp(),
      isGlobal: true // For now, all memories are global
    };
    
    // Only add source if provided
    if (source) {
      newMemory.source = source;
    }
    
    console.log('Memory object:', {
      ...newMemory,
      content: newMemory.content.length > 50 ? 
        `${newMemory.content.substring(0, 50)}... (${newMemory.content.length} chars)` : 
        newMemory.content,
      source: newMemory.source && newMemory.source.length > 50 ? 
        `${newMemory.source.substring(0, 50)}... (${newMemory.source.length} chars)` : 
        newMemory.source || 'Manually added'
    });
    
    // Add to memories collection
    console.log(`Adding to Firestore collection: ${MEMORIES_COLLECTION}`);
    const docRef = await addDoc(collection(db, MEMORIES_COLLECTION), newMemory);
    console.log(`Successfully stored memory with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('\n=== ERROR STORING MEMORY ===');
    console.error('Error storing memory:', error);
    throw error;
  }
}

/**
 * Delete a memory from Firestore
 * @param memoryId The ID of the memory to delete
 * @returns A promise that resolves when the memory is deleted
 */
export async function deleteMemory(memoryId: string): Promise<void> {
  try {
    // Delete the memory document
    await deleteDoc(doc(db, MEMORIES_COLLECTION, memoryId));
    console.log(`Deleted memory with ID: ${memoryId}`);
  } catch (error) {
    console.error(`Error deleting memory with ID: ${memoryId}:`, error);
    throw error;
  }
}

/**
 * Get all memories from Firestore
 * @returns Array of memories
 */
export async function getAllMemories(): Promise<Memory[]> {
  try {
    console.log('\n=== RETRIEVING ALL MEMORIES ===');
    
    // Query memories collection, ordered by timestamp
    const q = query(
      collection(db, MEMORIES_COLLECTION),
      orderBy('timestamp', 'desc')
    );
    
    console.log('Executing Firestore query on collection:', MEMORIES_COLLECTION);
    const querySnapshot = await getDocs(q);
    console.log(`Query returned ${querySnapshot.size} documents`);
    
    const memories: Memory[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<Memory, 'id'>;
      
      // Convert Firestore timestamp to JavaScript Date if needed
      let timestamp = data.timestamp;
      if (timestamp && typeof timestamp.toDate === 'function') {
        timestamp = timestamp.toDate();
      }
      
      const memory = {
        ...data,
        timestamp,
        id: doc.id // Add the document ID to the memory object
      };
      
      console.log(`Memory [${doc.id}]: "${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}" ${data.source ? `(Source: "${data.source.substring(0, 30)}${data.source.length > 30 ? '...' : ''}")` : '(Manually added)'}`);
      memories.push(memory);
    });
    
    console.log(`=== RETRIEVED ${memories.length} MEMORIES ===\n`);
    return memories;
  } catch (error) {
    console.error('\n=== ERROR RETRIEVING MEMORIES ===');
    console.error('Error getting memories:', error);
    return [];
  }
} 