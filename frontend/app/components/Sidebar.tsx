import { Plus } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-gray-100 min-h-screen border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="font-bold text-xl">AI Assistant</h1>
      </div>
      
      <div className="p-3">
        <button 
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>New Chat</span>
        </button>
      </div>
      
      <div className="overflow-y-auto flex-1">
        <div className="p-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Recent Chats</h2>
          <div className="space-y-1">
            <div className="px-3 py-2 rounded-md bg-gray-800 text-white font-medium cursor-pointer hover:bg-gray-700">
              New chat
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
} 