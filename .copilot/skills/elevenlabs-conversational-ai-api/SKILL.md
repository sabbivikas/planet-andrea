---
name: elevenlabs-conversational-ai-api
description: Use this skill when the user wants to build voice-based conversational AI agents using ElevenLabs. Provides integration guidance for ElevenAgents with real-time voice interaction, tool calling, and telephony.
---
# ElevenLabs Conversational AI (ElevenAgents) Integration

**⚠️ REQUIRED: Read [integration-patterns.md](references/integration-patterns.md) for implementation patterns before proceeding.**


Build voice-based conversational AI agents with real-time interaction, tool calling, knowledge bases, and telephony support.

## Quick Reference

**API Documentation:** Use Context7 API to retrieve current docs (see integration-patterns skill)
**Base URL:** `https://api.elevenlabs.io/v1`

**Main Endpoints:**
- `POST /convai/agents/create` - Create a new agent
- `GET /convai/agents` - List agents
- `GET /convai/agents/{agent_id}` - Get agent details
- `PATCH /convai/agents/{agent_id}` - Update agent
- `GET /convai/agents/summaries` - Get agent summaries
- `GET /convai/conversations` - List conversations
- `GET /convai/conversations/{conversation_id}` - Get conversation details

**WebSocket:** `wss://api.elevenlabs.io/v1/convai/conversation?agent_id={agent_id}`

## Environment Variable

- **Variable name:** `ELEVENLABS_API_KEY`
- **Used via:** `config.elevenLabsApiKey`
- **Note:** Woz provides this API key by default. The key is pre-configured, paid for, and will work out of the box. You don't need to worry about API limits or tier restrictions.

## Implementation Gotchas

1. **WebSocket-based conversations** - Real-time audio streamed via WebSocket, not REST
2. **Agent must be created first** - Create agent via REST API, then connect via WebSocket with agent_id
3. **5000+ voices available** - Use ElevenLabs voice library or clone custom voices
4. **31+ languages supported** - Agent auto-detects language or can be configured
5. **Knowledge base integration** - Upload documents for RAG; agent can reference them during conversation
6. **Tool calling** - Define custom tools (HTTP webhooks) that agent can invoke mid-conversation
7. **Telephony support** - Connect to phone systems via SIP/Twilio for inbound and outbound calls
8. **Batch calling** - API supports batch outbound calls for campaigns
9. **Conversation users** - Track and manage users across conversations
10. **SDKs available** - React, Swift, Kotlin, React Native SDKs for client integration

## Response Structure

```typescript
// Agent creation response
interface AgentResponse {
  agent_id: string;
  name: string;
  conversation_config: {
    agent: {
      prompt: { prompt: string };
      first_message: string;
      language: string;
    };
    tts: {
      voice_id: string;
      model_id: string;
    };
  };
}

// Conversation response
interface ConversationResponse {
  conversation_id: string;
  agent_id: string;
  status: 'active' | 'completed' | 'failed';
  transcript: Array<{
    role: 'agent' | 'user';
    message: string;
    timestamp: number;
  }>;
  metadata: Record<string, string>;
}

// WebSocket events
type ConvAIEvent =
  | { type: 'conversation_initiation_metadata'; conversation_id: string }
  | { type: 'audio'; audio: { chunk: string } }  // base64 audio
  | { type: 'agent_response'; agent_response: { message: string } }
  | { type: 'user_transcript'; user_transcript: { text: string } }
  | { type: 'tool_call'; tool_call: { name: string; parameters: object } };
```

## Example API Call

```bash
# Create an agent
curl -X POST "https://api.elevenlabs.io/v1/convai/agents/create" \
  -H "xi-api-key: $YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Support Agent",
    "conversation_config": {
      "agent": {
        "prompt": {
          "prompt": "You are a helpful customer support agent for Acme Corp."
        },
        "first_message": "Hello! How can I help you today?",
        "language": "en"
      },
      "tts": {
        "voice_id": "21m00Tcm4TlvDq8ikWAM"
      }
    }
  }'

# List conversations for an agent
curl "https://api.elevenlabs.io/v1/convai/conversations?agent_id=$AGENT_ID" \
  -H "xi-api-key: $YOUR_API_KEY"

# Get conversation transcript
curl "https://api.elevenlabs.io/v1/convai/conversations/$CONVERSATION_ID" \
  -H "xi-api-key: $YOUR_API_KEY"
```

## WebSocket Connection Example

```typescript
const ws = new WebSocket(
  `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}`
);

ws.onopen = () => {
  // Send initial config
  ws.send(JSON.stringify({
    type: 'conversation_initiation_client_data',
    custom_llm_extra_body: {},
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case 'audio':
      // Play audio chunk (base64 encoded)
      playAudioChunk(data.audio.chunk);
      break;
    case 'agent_response':
      console.log('Agent:', data.agent_response.message);
      break;
    case 'user_transcript':
      console.log('User:', data.user_transcript.text);
      break;
  }
};

// Send user audio (PCM16, 16kHz)
function sendAudio(audioChunk: ArrayBuffer): void {
  ws.send(JSON.stringify({
    type: 'user_audio_chunk',
    user_audio_chunk: btoa(String.fromCharCode(...new Uint8Array(audioChunk))),
  }));
}
```

## Use Cases

- **Customer support** - 24/7 voice-based support agents
- **Phone bots** - Inbound/outbound calling via SIP/Twilio
- **Voice assistants** - In-app conversational AI
- **Onboarding** - Interactive voice-guided setup flows
- **Sales outreach** - Batch outbound calling campaigns


**For complete implementation patterns (edge functions, CORS, frontend integration, WebSocket handling):**
→ See the `integration-patterns` skill
