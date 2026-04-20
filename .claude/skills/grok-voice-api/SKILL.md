---
name: grok-voice-api
description: Use this skill when the user wants to add xAI Grok voice capabilities. Provides integration guidance for text-to-speech and real-time voice agent conversations.
---
# Grok Voice API Integration

**⚠️ REQUIRED: Read [integration-patterns.md](references/integration-patterns.md) for implementation patterns before proceeding.**


Build voice-enabled AI applications using xAI's Grok Voice APIs for text-to-speech and real-time interactive voice conversations.

## Quick Reference

**API Documentation:** Use Context7 API to retrieve current docs (see integration-patterns skill)
**Base URL:** `https://api.x.ai/v1`

**Endpoints:**
- `POST /tts` - Text-to-speech conversion
- `wss://api.x.ai/v1/realtime` - Voice Agent (real-time WebSocket)

## Environment Variable

- **Variable name:** `GROK_API_KEY`
- **Used via:** `config.grokApiKey`
- **Note:** Woz provides this API key by default. The key is pre-configured, paid for, and will work out of the box. You don't need to worry about API limits or tier restrictions.

## Available Voices

| Voice | Type | Characteristics |
|-------|------|-----------------|
| `eve` | Female | Energetic, upbeat (default) |
| `ara` | Female | Warm, friendly, conversational |
| `rex` | Male | Confident, clear, professional |
| `sal` | Neutral | Smooth, balanced, versatile |
| `leo` | Male | Authoritative, strong, instructional |

## Language Support

20+ languages with automatic detection: English, Arabic (3 variants), Bengali, Chinese, French, German, Hindi, Indonesian, Italian, Japanese, Korean, Portuguese (2 variants), Russian, Spanish (2 variants), Turkish, Vietnamese — plus additional languages with varying accuracy.

## Audio Formats

- **MP3** - Compressed, wide compatibility (TTS only)
- **WAV** - Lossless for editing (TTS only)
- **PCM (Linear16)** - Configurable 8kHz-48kHz sample rates
- **G.711 μ-law** - US telephony optimized
- **G.711 A-law** - International telephony standard

## Implementation Gotchas

1. **Two separate APIs** - TTS (`/tts`) is a simple REST endpoint; Voice Agent (`/realtime`) is a WebSocket for interactive conversations
2. **Voice Agent is WebSocket-only** - Uses `wss://api.x.ai/v1/realtime`, not REST
3. **Region restriction** - Voice Agent currently available in `us-east-1` only
4. **Session limits** - Voice Agent: 30-minute max session, 100 concurrent sessions
5. **Tool calling in voice** - Voice Agent supports web search, X search, collections search, and custom functions
6. **Telephony integration** - Native support for Twilio, Vonage, and SIP providers
7. **Inline speech tags** - TTS supports expressive delivery via inline speech tags

## Response Structure

```typescript
// Text-to-speech returns audio binary
Response: ArrayBuffer (audio/mpeg, audio/wav, or raw PCM)

// Voice Agent uses WebSocket message protocol
// See xAI Voice Agent docs for WebSocket message format
```

## Example API Call

```bash
# Text-to-speech
curl -X POST "https://api.x.ai/v1/tts" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MODEL_ID",
    "input": "Hello, this is Grok speaking!",
    "voice": "eve",
    "response_format": "mp3"
  }' \
  --output speech.mp3
```

## Voice Agent Architecture

Three reference patterns for real-time voice:

1. **Web Voice Agent** - React browser client → FastAPI/Express backend → WebSocket to xAI
2. **Phone Voice Agent (Twilio)** - SIP-based phone → Twilio → WebSocket bridge → xAI
3. **WebRTC Voice Agent** - WebRTC client → WebSocket server bridge → xAI

## Third-Party Integrations

Native Grok Voice Agent support available for:
- **LiveKit** - Open-source framework, WebRTC
- **Voximplant** - Open-source framework, SIP
- **Pipecat** - Open-source framework, conversation management

## Voice Agent Tool Calling

Voice agents can execute tools during conversation:
- `web_search` - Real-time web information
- `x_search` - X posts and trends
- `collections_search` - RAG-powered document search
- Custom functions via JSON schemas (CRMs, calendars, ticketing, databases)

## Use Cases

- **Voice assistants** - Real-time spoken interactions with AI
- **Phone systems** - IVR and customer support via Twilio/SIP
- **Voice commands** - Voice-controlled app features
- **Accessibility** - Voice alternatives for text interfaces
- **Interactive storytelling** - Narrated content with multiple voices


**For complete implementation patterns (edge functions, CORS, frontend integration, streaming):**
→ See the `integration-patterns` skill
