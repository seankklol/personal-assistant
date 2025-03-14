import { useParams } from "react-router";
import { Chat } from "../components/Chat";

export function meta() {
  return [
    { title: "Chat with AI Assistant" },
    { name: "description", content: "Chat with your AI assistant" },
  ];
}

export default function ChatDetailPage() {
  const { chatId } = useParams();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat with AI Assistant</h1>
      <Chat chatId={chatId} />
    </div>
  );
} 