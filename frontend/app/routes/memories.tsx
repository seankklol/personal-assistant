import { useGetMemories, useDeleteMemory, useCreateMemory } from "../services/memoryService";
import { format } from "date-fns";
import { useState } from "react";

export default function Memories() {
  const { data: memories, isLoading, error, refetch } = useGetMemories();
  const deleteMemoryMutation = useDeleteMemory();
  const createMemoryMutation = useCreateMemory();
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [newMemory, setNewMemory] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Handle memory deletion
  const handleDelete = async (memoryId: string) => {
    if (!memoryId || isDeleting[memoryId]) return;
    
    // Set this memory as being deleted
    setIsDeleting(prev => ({ ...prev, [memoryId]: true }));
    
    try {
      await deleteMemoryMutation.mutateAsync({ memoryId });
      // Refresh the memories list after successful deletion
      await refetch();
    } catch (error) {
      console.error("Error deleting memory:", error);
      alert("Failed to delete memory. Please try again.");
    } finally {
      // Remove the deleting state
      setIsDeleting(prev => ({ ...prev, [memoryId]: false }));
    }
  };

  // Handle memory creation
  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.trim() || isCreating) return;
    
    setIsCreating(true);
    
    try {
      await createMemoryMutation.mutateAsync({ content: newMemory.trim() });
      setNewMemory(""); // Clear the input
      await refetch(); // Refresh the memories list
    } catch (error) {
      console.error("Error creating memory:", error);
      alert("Failed to create memory. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Memories</h1>
        <p>Loading memories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Memories</h1>
        <p className="text-red-500">Error loading memories: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Memories</h1>
      
      {/* Memory creation form */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-3">Create New Memory</h2>
        <form onSubmit={handleCreateMemory} className="flex flex-col space-y-3">
          <textarea
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            placeholder="Enter a new memory to store..."
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={isCreating}
          />
          <button
            type="submit"
            disabled={!newMemory.trim() || isCreating}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 self-end"
          >
            {isCreating ? "Creating..." : "Create Memory"}
          </button>
        </form>
      </div>
      
      {memories && memories.length > 0 ? (
        <div className="grid gap-4">
          {memories.map((memory) => {
            // Handle different timestamp formats
            let formattedDate;
            try {
              const timestamp = memory.timestamp instanceof Date 
                ? memory.timestamp 
                : new Date(memory.timestamp);
              formattedDate = format(timestamp, "MMM d, yyyy 'at' h:mm a");
            } catch (err) {
              formattedDate = "Unknown date";
            }

            return (
              <div 
                key={memory.id} 
                className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm relative"
              >
                <button
                  onClick={() => handleDelete(memory.id as string)}
                  disabled={isDeleting[memory.id as string]}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 disabled:opacity-50"
                  title="Delete this memory"
                >
                  {isDeleting[memory.id as string] ? (
                    <span className="text-sm">Deleting...</span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                <p className="text-lg mb-2 pr-8">{memory.content}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <p>{memory.source ? `From: "${memory.source.substring(0, 50)}${memory.source.length > 50 ? '...' : ''}"` : 'Manually added'}</p>
                  <p>{formattedDate}</p>
                </div>
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {memory.isGlobal ? "Global" : "Project"} Memory
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No memories found. Start chatting to create memories!</p>
      )}
    </div>
  );
} 