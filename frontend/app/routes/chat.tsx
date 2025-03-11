import { getChats } from "../services/chatService";
import { Chat } from "../components/Chat";

export async function loader() {
  // Get all chats for sidebar, but don't redirect
  const chats = await getChats();
  return { chats };
}

export function meta() {
  return [
    { title: "Chat with AI Assistant" },
    { name: "description", content: "Chat with your AI assistant" },
  ];
}

export default function ChatPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat with AI Assistant</h1>
      <Chat />
    </div>
  );
} 