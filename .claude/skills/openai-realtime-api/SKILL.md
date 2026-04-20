---
name: openai-realtime-api
description: Use this skill when the user wants to build real-time voice conversations using OpenAI. Provides integration guidance for WebRTC, WebSocket, and SIP-based voice agents with function calling.
---
# OpenAI Realtime API Integration

**⚠️ REQUIRED: Read [integration-patterns.md](references/integration-patterns.md) for implementation patterns before proceeding.**


Build real-time voice conversations with GPT models using WebRTC, WebSocket, or SIP connections.

## Quick Reference

**API Documentation:** Use Context7 API to retrieve current docs (see integration-patterns skill)
**Base URL:** `https://api.openai.com/v1`

**Main Endpoints:**
- `POST /realtime/calls` - Create a WebRTC session
- `POST /realtime/client_secrets` - Generate ephemeral client token
- `wss://api.openai.com/v1/realtime` - WebSocket connection
- SIP: `sip.openai.com` - Telephony integration

## Environment Variable

- **Variable name:** `OPENAI_API_KEY`
- **Used via:** `config.openaiApiKey`
- **Note:** Woz provides this API key by default. The key is pre-configured, paid for, and will work out of the box. You don't need to worry about API limits or tier restrictions.

## Connection Methods

| Method | Best For |
|--------|----------|
| **WebRTC** | Browser/mobile apps — handles NAT traversal, echo cancellation |
| **WebSocket** | Server-side agents — full control, raw audio frames |
| **SIP** | Telephony — connect to phone systems via Twilio/Vonage |

## Implementation Gotchas

1. **Use ephemeral tokens for frontend** - Never expose API key in browser; generate client secrets via `/realtime/client_secrets` endpoint
2. **60-minute session limit** - Sessions expire after 60 minutes; implement reconnection logic
3. **Voice Activity Detection (VAD)** - Server-side VAD enabled by default; configure `turn_detection` for sensitivity
4. **Audio format** - WebRTC uses Opus codec; WebSocket uses raw PCM16 at 24kHz
5. **Function calling supported** - Define tools just like Chat Completions; model can invoke them mid-conversation
6. **Image input supported** - Send images alongside audio for multimodal conversations
7. **Text + audio output** - Model can return both text transcript and audio simultaneously
8. **Interruption handling** - User can interrupt the model mid-speech; handle `response.cancelled` events

## Voices

alloy, ash, ballad, coral, echo, sage, shimmer, verse, marin, cedar

## Response Structure

```typescript
// WebRTC session creation response
interface RealtimeCallResponse {
  id: string;
  object: 'realtime.call';
  sdp: string;  // SDP answer for WebRTC
  model: string;
}

// Client secret response
interface ClientSecretResponse {
  client_secret: {
    value: string;
    expires_at: number;  // Unix timestamp
  };
}

// WebSocket events (bidirectional)
type ServerEvent =
  | { type: 'session.created'; session: object }
  | { type: 'response.audio.delta'; delta: string }  // base64 audio chunk
  | { type: 'response.audio_transcript.delta'; delta: string }
  | { type: 'response.function_call_arguments.delta'; delta: string }
  | { type: 'response.done'; response: object }
  | { type: 'input_audio_buffer.speech_started' }
  | { type: 'input_audio_buffer.speech_stopped' };
```

## Example API Call

```bash
# Step 1: Create ephemeral client token (from backend)
curl -X POST "https://api.openai.com/v1/realtime/client_secrets" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MODEL_ID",
    "voice": "coral"
  }'

# Step 2: Create WebRTC session (from frontend, using ephemeral token)
curl -X POST "https://api.openai.com/v1/realtime/calls" \
  -H "Authorization: Bearer EPHEMERAL_TOKEN" \
  -H "Content-Type: application/sdp" \
  -d '<SDP_OFFER>'

# WebSocket connection (from server)
wscat -c "wss://api.openai.com/v1/realtime?model=MODEL_ID" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "OpenAI-Beta: realtime=v1"
```

## WebRTC Frontend Example

```typescript
// 1. Get ephemeral token from your backend
const tokenRes = await fetch('/api/realtime-token');
const { client_secret } = await tokenRes.json();

// 2. Create peer connection
const pc = new RTCPeerConnection();

// 3. Add local audio track
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
stream.getTracks().forEach(track => pc.addTrack(track, stream));

// 4. Handle remote audio
pc.ontrack = (event) => {
  const audio = new Audio();
  audio.srcObject = event.streams[0];
  audio.play();
};

// 5. Create and send offer
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

const res = await fetch('https://api.openai.com/v1/realtime/calls', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${client_secret.value}`,
    'Content-Type': 'application/sdp',
  },
  body: offer.sdp,
});

const answer = await res.text();
await pc.setRemoteDescription({ type: 'answer', sdp: answer });
```

## Use Cases

- **Voice assistants** - Conversational AI with natural turn-taking
- **Customer support** - Phone-based AI agents via SIP
- **Language tutoring** - Real-time pronunciation feedback
- **Accessibility** - Voice-controlled app interfaces
- **Live translation** - Real-time speech-to-speech translation


**For complete implementation patterns (edge functions, CORS, frontend integration, WebSocket handling):**
→ See the `integration-patterns` skill
