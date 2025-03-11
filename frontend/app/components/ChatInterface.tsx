import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { addMessageToChat, getChatById } from "../services/chatService";
import type { Chat, ChatMessage } from "../models/chat";

interface ChatInterfaceProps {
  chatId?: string;
}

export function ChatInterface({ chatId = "default" }: ChatInterfaceProps) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (chatId) {
      fetchChat();
    }
  }, [chatId]);
  
  const fetchChat = async () => {
    try {
      const chatData = await getChatById(chatId);
      setChat(chatData);
    } catch (error) {
      console.error("Error fetching chat:", error);
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatId) return;
    
    try {
      setLoading(true);
      
      // Add user message
      await addMessageToChat(chatId, {
        content: input,
        role: "user"
      });
      
      // Clear input
      setInput("");
      
      // Simulate assistant response (in a real app, this would call your AI API)
      setTimeout(async () => {
        await addMessageToChat(chatId, {
          content: "This is a simulated response from the assistant.",
          role: "assistant"
        });
        
        // Refresh chat
        await fetchChat();
        setLoading(false);
      }, 1000);
      
      // Refresh chat to show user message
      await fetchChat();
    } catch (error) {
      console.error("Error sending message:", error);
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {chat?.messages && chat.messages.length > 0 ? (
          <div className="space-y-4">
            {chat.messages.map((message, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg max-w-3xl ${
                  message.role === "user" 
                    ? "bg-blue-600 text-white ml-auto" 
                    : "bg-gray-800 text-white"
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            No messages yet. Start a conversation!
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={loading || !input.trim()}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
} 