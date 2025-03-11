import { redirect } from "react-router";

export function loader() {
  return redirect("/chat");
}

export default function Index() {
  // This component won't render since we're redirecting
  return null;
} 