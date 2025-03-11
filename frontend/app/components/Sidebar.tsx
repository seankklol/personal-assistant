import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createChat, getChats, deleteChat } from "../services/chatService";
import type { Chat } from "../models/chat";

export function Sidebar() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch chats on component mount
    const fetchChats = async () => {
      try {
        const chatList = await getChats();
        setChats(chatList);
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const handleNewChat = async () => {
    try {
      const newChatId = await createChat();
      // Refresh the chat list
      const updatedChats = await getChats();
      setChats(updatedChats);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      // Delete the chat from the database
      await deleteChat(chatId);
      // Update the local state to remove the deleted chat
      setChats(chats.filter(chat => chat.id !== chatId));
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  return (
    <aside className="w-64 bg-gray-900 text-gray-100 h-screen border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="font-bold text-xl">AI Assistant</h1>
      </div>
      
      <div className="p-3">
        <button 
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          onClick={handleNewChat}
        >
          <Plus size={16} />
          <span>New Chat</span>
        </button>
      </div>
      
      <div className="overflow-y-auto flex-1">
        <div className="p-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Recent Chats</h2>
          <div className="space-y-1">
            {loading ? (
              <div className="px-3 py-2 text-gray-400">Loading chats...</div>
            ) : chats.length > 0 ? (
              chats.map((chat) => (
                <div 
                  key={chat.id} 
                  className="px-3 py-2 rounded-md bg-gray-800 text-white font-medium cursor-pointer hover:bg-gray-700 flex items-center justify-between group"
                >
                  <span className="truncate">{chat.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the chat selection
                      if (chat.id) handleDeleteChat(chat.id);
                    }}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete chat"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 rounded-md bg-gray-800 text-white font-medium">
                New chat
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
} 