# Personal Assistant Backend

This is the backend service for the Personal Assistant application. It's built with Express.js and TypeScript, and integrates with the Nebius AI API for intelligent responses.

## Setup

1. Install dependencies:
   ```
   bun install
   ```

2. Configure environment variables:
   - Copy the `.env` file and update with your Nebius API key
   - Get your API key from the [Nebius AI Portal](https://nebius.cloud)

3. Run the development server:
   ```
   bun run dev
   ```

## Nebius AI Integration

### Configuration

The backend integrates with the Nebius QwQ-32B model. To enable this:

1. Get your API key from Nebius
2. Add your API key to the `.env` file:
   ```
   NEBIUS_API_KEY=your_api_key_here
   ```

### Test Mode

If the Nebius API key is not configured, the application will run in test mode:
- All requests to the chat endpoint will return simulated responses
- The AI will indicate that it's running in test mode
- This allows development and testing without an API key

### Troubleshooting

Common issues:
- **Connection errors**: Ensure your firewall allows outbound connections to the Nebius API
- **Authorization errors**: Verify your API key is correctly set in the `.env` file
- **Error messages mentioning test mode**: Add a valid API key to enable the real AI

## API Endpoints

- `GET /health` - Check if the server is running
- `GET /` - Basic server info
- `POST /trpc/chat.sendMessage` - Send a message to the AI assistant
- `GET /trpc/chat.getMessages` - Get chat history

## Development

The backend uses tRPC for type-safe API development with the frontend. Key files:

- `src/index.ts` - Server entry point
- `src/routers/chat.ts` - Chat functionality
- `src/services/nebius.ts` - Nebius AI integration
- `src/config.ts` - Configuration management
