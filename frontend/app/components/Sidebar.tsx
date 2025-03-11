import { Plus, Trash2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createChat, getChats, deleteChat, getChatById } from "../services/chatService";
import type { Chat } from "../models/chat";
import { useNavigate } from "react-router-dom";

export function Sidebar() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch chats on component mount
    const fetchChats = async () => {
      try {
        const chatList = await getChats();
        
        // Handle empty chats (except for the default chat)
        const emptyChatsRemoved = await cleanupEmptyChats(chatList);
        
        // Create a default chat if none exists
        if (chatList.length === 0 || emptyChatsRemoved && (await getChats()).length === 0) {
          const defaultChatId = await createChat("New chat 1");
          // Navigate to the newly created chat
          navigate(`/chat/${defaultChatId}`);
          const updatedChats = await getChats();
          setChats(updatedChats);
        } else {
          // If we deleted chats, refetch the list
          const finalChatList = emptyChatsRemoved ? await getChats() : chatList;
          setChats(finalChatList);
          
          // If there's at least one chat but no currently active chat,
          // navigate to the first available chat
          if (finalChatList.length > 0 && (window.location.pathname === '/' || window.location.pathname === '/chat')) {
            navigate(`/chat/${finalChatList[0].id}`);
          }
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [navigate]);

  // Function to check for and delete empty chats
  const cleanupEmptyChats = async (chatList: Chat[]): Promise<boolean> => {
    let hasDeletedChats = false;
    
    // If there's only one chat, don't delete it even if it's empty
    if (chatList.length <= 1) {
      return false;
    }
    
    // Create an array of promises for deleting empty chats
    const deletePromises = chatList.map(async (chat) => {
      if (!chat.id) return false;
      
      // Get the full chat details with messages
      const fullChat = await getChatById(chat.id);
      
      // If the chat has no messages, delete it
      if (fullChat && fullChat.messages.length === 0) {
        await deleteChat(chat.id);
        return true;
      }
      
      return false;
    });
    
    // Wait for all deletion operations to complete
    const results = await Promise.all(deletePromises);
    
    // Check if any chats were deleted
    hasDeletedChats = results.some(result => result === true);
    
    return hasDeletedChats;
  };

  const getNextChatNumber = (): number => {
    // Initialize with 1 if no numbered chats exist
    let highestNumber = 0;
    
    // Regular expression to extract numbers from chat titles like "New chat 5"
    const regex = /New chat (\d+)/;
    
    chats.forEach(chat => {
      const match = chat.title.match(regex);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num > highestNumber) {
          highestNumber = num;
        }
      }
    });
    
    return highestNumber + 1;
  };

  const handleNewChat = async () => {
    if (isCreatingChat) return; // Prevent multiple simultaneous requests
    
    try {
      setIsCreatingChat(true);
      
      // Get the next number for the chat title
      const nextNumber = getNextChatNumber();
      const chatTitle = `New chat ${nextNumber}`;
      
      const newChatId = await createChat(chatTitle);
      // Navigate to the new chat
      navigate(`/chat/${newChatId}`);
      
      // Refresh the chat list
      const updatedChats = await getChats();
      setChats(updatedChats);
    } catch (error) {
      console.error("Error creating new chat:", error);
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      // Delete the chat from the database
      await deleteChat(chatId);
      // Update the local state to remove the deleted chat
      const filteredChats = chats.filter(chat => chat.id !== chatId);
      setChats(filteredChats);
      
      // If we just deleted the last chat, create a new one
      if (filteredChats.length === 0) {
        handleNewChat();
      } 
      // Otherwise, if we deleted the active chat, navigate to another chat
      else if (window.location.pathname.includes(`/chat/${chatId}`)) {
        navigate(`/chat/${filteredChats[0].id}`);
      }
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
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
            isCreatingChat 
              ? 'bg-blue-500 text-gray-200 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          onClick={handleNewChat}
          disabled={isCreatingChat}
          aria-disabled={isCreatingChat}
        >
          {isCreatingChat ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          <span>{isCreatingChat ? 'Creating...' : 'New Chat'}</span>
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
                  onClick={() => navigate(`/chat/${chat.id}`)}
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
                No chats yet
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
} 