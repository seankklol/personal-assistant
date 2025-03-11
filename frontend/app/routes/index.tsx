import { Chat } from "../components/Chat";

export function meta() {
  return [
    { title: "Personal AI Assistant" },
    { name: "description", content: "Chat with your personal AI assistant" },
  ];
}

export default function Index() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat with AI Assistant</h1>
      <Chat />
    </div>
  );
} 