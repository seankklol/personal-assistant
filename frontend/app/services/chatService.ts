import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  Timestamp,
  arrayUnion,
  serverTimestamp,
  deleteDoc
} from '@firebase/firestore';
import { db } from '../utils/firebase';
import type { Chat, ChatMessage } from '../models/chat';

const CHATS_COLLECTION = 'chats';

export async function createChat(title: string = 'New chat'): Promise<string> {
  try {
    const now = Date.now();
    const newChat: Omit<Chat, 'id'> = {
      title,
      createdAt: now,
      updatedAt: now,
      messages: []
    };
    
    const docRef = await addDoc(collection(db, CHATS_COLLECTION), newChat);
    return docRef.id;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
}

export async function getChats(): Promise<Chat[]> {
  try {
    const q = query(collection(db, CHATS_COLLECTION), orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const chats: Chat[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<Chat, 'id'>;
      chats.push({
        id: doc.id,
        ...data
      });
    });
    
    return chats;
  } catch (error) {
    console.error('Error getting chats:', error);
    throw error;
  }
}

export async function getChatById(chatId: string | null | undefined): Promise<Chat | null> {
  if (!chatId) {
    return null;
  }
  
  try {
    const chatDoc = await getDoc(doc(db, CHATS_COLLECTION, chatId));
    
    if (!chatDoc.exists()) {
      return null;
    }
    
    const chatData = chatDoc.data() as Omit<Chat, 'id'>;
    return {
      id: chatDoc.id,
      ...chatData
    };
  } catch (error) {
    console.error('Error getting chat:', error);
    throw error;
  }
}

export async function addMessageToChat(chatId: string, message: Partial<ChatMessage>, usedMemories?: string[]): Promise<void> {
  try {
    const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
    const now = Date.now();
    
    // Prepare the message to add
    const newMessage: ChatMessage = {
      content: message.content || '',
      role: message.role || 'user',
      timestamp: now,
      usedMemories: usedMemories || []
    };
    
    // Update the chat document
    await updateDoc(chatDocRef, {
      messages: arrayUnion(newMessage),
      updatedAt: now
    });
  } catch (error) {
    console.error('Error adding message to chat:', error);
    throw error;
  }
}

export async function updateChatTitle(chatId: string, title: string): Promise<void> {
  try {
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    await updateDoc(chatRef, {
      title,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error('Error updating chat title:', error);
    throw error;
  }
}

export async function deleteChat(chatId: string): Promise<void> {
  try {
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    await deleteDoc(chatRef);
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
} 