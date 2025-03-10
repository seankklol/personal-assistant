import { useState } from 'react';
import { trpc } from '../utils/trpc';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export function Chat() {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const utils = trpc.useContext();
  
  // Query to get all messages
  const allMessages = trpc.chat.getMessages.useQuery(undefined, {
    onSuccess: (data) => {
      setMessages(data);
    },
  });
  
  // Mutation to send a message
  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      // Refetch messages after sending
      utils.chat.getMessages.invalidate();
      setInputMessage('');
    },
  });
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() === '') return;
    
    sendMessageMutation.mutate({ 
      message: inputMessage 
    });
  };
  
  return (
    <div className="flex flex-col h-screen max-h-[600px] border rounded-lg overflow-hidden">
      {/* Chat messages container */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start a conversation!
          </div>
        ) : (
          messages.map((msg, index) => (
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
        
        {/* Loading indicator */}
        {allMessages.isLoading && (
          <div className="flex justify-center">
            <div className="animate-pulse text-gray-500">Loading messages...</div>
          </div>
        )}
        
        {/* Error display */}
        {allMessages.isError && (
          <div className="text-red-500 p-3 text-center">
            Error loading messages: {allMessages.error.message}
          </div>
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
          disabled={sendMessageMutation.isLoading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={sendMessageMutation.isLoading || inputMessage.trim() === ''}
        >
          {sendMessageMutation.isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
} 