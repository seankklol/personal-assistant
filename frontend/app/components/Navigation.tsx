import { Link } from "react-router-dom";

export function Navigation() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">AI Assistant</div>
        <ul className="flex space-x-4">
          <li>
            <Link to="/" className="hover:text-blue-300">Home</Link>
          </li>
          <li>
            <Link to="/chat" className="hover:text-blue-300">Chat</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
} 