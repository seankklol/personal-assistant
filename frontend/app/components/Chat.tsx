import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { createChat, getChatById, addMessageToChat } from '../services/chatService';
import type { Chat as ChatType, ChatMessage } from '../models/chat';

interface ChatProps {
  chatId?: string;
}

export function Chat({ chatId: propChatId }: ChatProps = {}) {
  const [inputMessage, setInputMessage] = useState('');
  const [chat, setChat] = useState<ChatType | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { chatId: paramChatId } = useParams<{ chatId?: string }>();
  
  // Use the prop chatId if provided, otherwise use the one from URL params
  const chatId = propChatId || paramChatId;
  
  useEffect(() => {
    const initChat = async () => {
      try {
        setLoading(true);
        let id = chatId;
        
        // If no chatId is provided, create a new chat
        if (!id) {
          id = await createChat();
        }
        
        // Get the chat data
        const chatData = await getChatById(id);
        setChat(chatData);
      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initChat();
  }, [chatId]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() === '' || !chat?.id || sending) return;
    
    try {
      setSending(true);
      
      // Add user message to Firestore
      await addMessageToChat(chat.id, {
        content: inputMessage,
        role: 'user'
      });
      
      // Clear input
      setInputMessage('');
      
      // Simulate AI response (in a real app, you would call your AI API here)
      setTimeout(async () => {
        await addMessageToChat(chat.id, {
          content: 'This is a simulated response from the AI assistant.',
          role: 'assistant'
        });
        
        // Refresh chat data
        if (chat.id) {
          const updatedChat = await getChatById(chat.id);
          setChat(updatedChat);
        }
        setSending(false);
      }, 1000);
      
      // Refresh chat to show user message immediately
      if (chat.id) {
        const updatedChat = await getChatById(chat.id);
        setChat(updatedChat);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSending(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col h-screen max-h-[600px] border rounded-lg overflow-hidden items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading chat...</div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen max-h-[600px] border rounded-lg overflow-hidden">
      {/* Chat messages container */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {!chat?.messages || chat.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start a conversation!
          </div>
        ) : (
          chat.messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                <p>{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={sending}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={sending || inputMessage.trim() === ''}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
} 