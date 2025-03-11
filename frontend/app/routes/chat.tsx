import { redirect } from "react-router";
import { getChats, createChat } from "../services/chatService";

export async function loader() {
  // Get all chats
  const chats = await getChats();
  
  // If there are no chats, create one
  if (chats.length === 0) {
    const newChatId = await createChat("New chat 1");
    return redirect(`/chat/${newChatId}`);
  }
  
  // Redirect to the first available chat
  return redirect(`/chat/${chats[0].id}`);
}

export default function ChatPage() {
  // This won't render as we're redirecting
  return null;
} 