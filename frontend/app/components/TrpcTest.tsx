import { useState } from 'react';
import { trpc } from '../utils/trpc';

export function TrpcTest() {
  const [name, setName] = useState('');
  const greeting = trpc.hello.greeting.useQuery({ name: name || undefined });

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-bold mb-4">tRPC Test</h2>
      
      <div className="mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="p-2 border rounded"
        />
      </div>
      
      {greeting.isLoading ? (
        <p>Loading...</p>
      ) : greeting.error ? (
        <p className="text-red-500">Error: {greeting.error.message}</p>
      ) : (
        <div>
          <p>{greeting.data?.greeting}</p>
          <p className="text-sm text-gray-500">
            Timestamp: {greeting.data?.timestamp.toString()}
          </p>
        </div>
      )}
    </div>
  );
} 