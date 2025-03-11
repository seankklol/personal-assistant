import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createChat, getChatById, addMessageToChat } from '../services/chatService';
import type { Chat as ChatType, ChatMessage } from '../models/chat';
import { trpc } from '../utils/trpc';

interface ChatProps {
  chatId?: string;
}

export function Chat({ chatId: propChatId }: ChatProps = {}) {
  const [inputMessage, setInputMessage] = useState('');
  const [chat, setChat] = useState<ChatType | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { chatId: paramChatId } = useParams<{ chatId?: string }>();
  const navigate = useNavigate();
  
  // Initialize the sendMessage mutation
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  
  // Use the prop chatId if provided, otherwise use the one from URL params
  const chatId = propChatId || paramChatId;
  
  useEffect(() => {
    const initChat = async () => {
      try {
        setLoading(true);
        
        // Only load the chat if we have a chatId
        if (chatId) {
          // Get the chat data
          const chatData = await getChatById(chatId);
          setChat(chatData);
        } else {
          // If no chatId, just set loading to false - we'll create a new chat when user sends a message
          setChat(null);
        }
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
    if (inputMessage.trim() === '' || sending) return;
    
    try {
      setSending(true);
      
      // Store the message before clearing input
      const messageToSend = inputMessage.trim();
      
      // Create a new chat if none exists
      let currentChatId = chat?.id;
      
      if (!currentChatId) {
        // Create a new chat with a title based on the first message
        const chatTitle = messageToSend.length > 30 
          ? `${messageToSend.substring(0, 30)}...` 
          : messageToSend;
        
        // Create a new chat and get its ID
        currentChatId = await createChat(chatTitle);
        // Get the chat data to update state
        const newChat = await getChatById(currentChatId);
        setChat(newChat);
        
        // Use navigate for proper routing instead of just changing URL
        navigate(`/chat/${currentChatId}`, { replace: true });
      }
      
      // Add user message to Firestore
      await addMessageToChat(currentChatId, {
        content: messageToSend,
        role: 'user'
      });
      
      // Add a temporary loading message
      const tempLoadingMessage: ChatMessage = {
        content: '...',
        role: 'assistant',
        timestamp: Date.now()
      };
      
      // Update the chat with the user message and loading indicator
      const updatedChatWithUserMessage = await getChatById(currentChatId);
      if (updatedChatWithUserMessage) {
        setChat({
          ...updatedChatWithUserMessage,
          messages: [...updatedChatWithUserMessage.messages, tempLoadingMessage]
        });
      }
      
      // Clear input
      setInputMessage('');
      
      // Send message to AI via tRPC
      const aiResponse = await sendMessageMutation.mutateAsync({
        message: messageToSend
      });
      
      // Log memory-related information to console
      console.log('----------- MEMORY AGENT PROCESSING -----------');
      console.log('User Message:', messageToSend);
      console.log('AI Response:', aiResponse.message.content);
      
      if (aiResponse.memories && aiResponse.memories.length > 0) {
        console.log('Extracted Memories:');
        aiResponse.memories.forEach((memory, index) => {
          console.log(`Memory ${index + 1}: ${memory}`);
        });
      } else {
        console.log('No memories extracted from this message.');
      }
      
      if (aiResponse.usedMemories && aiResponse.usedMemories.length > 0) {
        console.log('Memories Used in Context:');
        aiResponse.usedMemories.forEach((memory, index) => {
          console.log(`Used Memory ${index + 1}: ${memory}`);
        });
      } else {
        console.log('No memories were used in the context.');
      }
      console.log('--------------------------------------------');
      
      // Add AI response to Firestore
      await addMessageToChat(currentChatId, {
        content: aiResponse.message.content,
        role: 'assistant'
      }, aiResponse.usedMemories);
      
      // Refresh chat data
      if (currentChatId) {
        const updatedChat = await getChatById(currentChatId);
        setChat(updatedChat);
      }
      
      setSending(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setSending(false);
      
      // Add error message to chat
      if (chat?.id) {
        await addMessageToChat(chat.id, {
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
          role: 'assistant'
        });
        
        // Refresh chat
        const updatedChat = await getChatById(chat.id);
        setChat(updatedChat);
      }
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
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} mb-4`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                {msg.content === '...' && msg.role === 'assistant' ? (
                  <div className="flex space-x-2 items-center">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
              
              {/* Display used memories for assistant messages */}
              {msg.role === 'assistant' && msg.usedMemories && msg.usedMemories.length > 0 && (
                <div className="mt-2 ml-2 p-2 bg-blue-50 rounded border border-blue-100 max-w-[90%]">
                  <p className="text-xs font-semibold text-blue-800 mb-1">Context Memories:</p>
                  <ul className="list-disc pl-4 text-xs text-blue-700">
                    {msg.usedMemories.map((memory, i) => (
                      <li key={i}>{memory}</li>
                    ))}
                  </ul>
                </div>
              )}
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