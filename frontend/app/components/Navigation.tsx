import { Link } from "react-router-dom";

export function Navigation() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-xl">AI Assistant</Link>
        <ul className="flex space-x-4">
          <li>
            <Link to="/memories" className="hover:text-blue-300">Memories</Link>
          </li>
          <li>
            <Link to="/admin" className="hover:text-blue-300">Admin</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
} 