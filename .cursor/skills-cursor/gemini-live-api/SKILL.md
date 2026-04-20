---
name: gemini-live-api
description: Use this skill when the user wants to build real-time voice conversations using Gemini. Provides integration guidance for the Gemini Live API with WebSocket-based audio streaming and sub-second latency.
---
# Gemini Live API Integration

**⚠️ REQUIRED: Read [integration-patterns.md](references/integration-patterns.md) for implementation patterns before proceeding.**


Build real-time conversational agents with sub-second audio latency using Gemini's Live API via WebSocket.

## Quick Reference

**API Documentation:** Use Context7 API to retrieve current docs (see integration-patterns skill)
**WebSocket URL:** `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent`

**Connection:** WebSocket with bidirectional audio streaming

## Environment Variable

- **Variable name:** `GEMINI_API_KEY`
- **Used via:** `config.geminiApiKey`
- **Note:** Woz provides this API key by default. The key is pre-configured, paid for, and will work out of the box. You don't need to worry about API limits or tier restrictions.

## Implementation Gotchas

1. **WebSocket only** - No REST endpoint; all communication via bidirectional WebSocket
2. **API key in URL** - Pass key as query parameter: `?key=YOUR_API_KEY`
3. **Setup message required** - Must send `BidiGenerateContentSetup` as first message before streaming audio
4. **Audio format** - Input: PCM16 at 16kHz mono; Output: PCM16 at 24kHz mono (configurable)
5. **Sub-second latency** - Designed for real-time voice; typical latency <500ms
6. **Voice Activity Detection** - Built-in VAD for turn detection; configurable sensitivity
7. **Function calling supported** - Define tools in setup; model can invoke them mid-conversation
8. **Multimodal input** - Can send text, audio, and images in the same session
9. **Session limits** - Sessions have a maximum duration; implement reconnection logic
10. **Interruption handling** - User speech interrupts model output automatically

## Response Structure

```typescript
// Setup message (send first)
interface BidiGenerateContentSetup {
  setup: {
    model: string;  // "models/MODEL_ID"
    generationConfig: {
      responseModalities: ['AUDIO'];  // or ['TEXT'] or ['TEXT', 'AUDIO']
      speechConfig?: {
        voiceConfig?: {
          prebuiltVoiceConfig?: {
            voiceName: string;  // e.g., "Puck", "Charon", "Kore", "Fenrir", "Aoede"
          };
        };
      };
    };
    systemInstruction?: {
      parts: Array<{ text: string }>;
    };
    tools?: Array<{
      functionDeclarations: Array<{
        name: string;
        description: string;
        parameters: object;
      }>;
    }>;
  };
}

// Client audio message
interface RealtimeInput {
  realtimeInput: {
    mediaChunks: Array<{
      mimeType: string;  // "audio/pcm;rate=16000"
      data: string;      // base64-encoded audio
    }>;
  };
}

// Server response events
interface ServerContent {
  serverContent: {
    modelTurn?: {
      parts: Array<
        | { text: string }
        | { inlineData: { mimeType: string; data: string } }  // audio chunk
      >;
    };
    turnComplete?: boolean;
  };
}
```

## Example Connection

```typescript
const ws = new WebSocket(
  `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`
);

ws.onopen = () => {
  // Step 1: Send setup message
  ws.send(JSON.stringify({
    setup: {
      model: 'models/MODEL_ID',
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' }
          }
        }
      },
      systemInstruction: {
        parts: [{ text: 'You are a helpful voice assistant.' }]
      }
    }
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.serverContent?.modelTurn?.parts) {
    for (const part of data.serverContent.modelTurn.parts) {
      if (part.inlineData) {
        // Play audio chunk (base64 PCM16 at 24kHz)
        playAudioChunk(part.inlineData.data);
      }
      if (part.text) {
        console.log('Model:', part.text);
      }
    }
  }

  if (data.serverContent?.turnComplete) {
    console.log('Model finished speaking');
  }
};

// Send user audio
function sendAudio(pcm16Buffer: ArrayBuffer): void {
  ws.send(JSON.stringify({
    realtimeInput: {
      mediaChunks: [{
        mimeType: 'audio/pcm;rate=16000',
        data: btoa(String.fromCharCode(...new Uint8Array(pcm16Buffer)))
      }]
    }
  }));
}
```

## Use Cases

- **Voice assistants** - Real-time conversational AI with natural turn-taking
- **Live translation** - Real-time speech translation
- **Accessibility** - Voice-controlled interfaces with instant response
- **Customer support** - Low-latency voice agents
- **Education** - Interactive voice-based tutoring

## Alternative Recommendations

- **OpenAI Realtime API** - Alternative real-time voice via WebRTC/WebSocket
- **ElevenLabs ConvAI** - Voice agents with 5000+ voice options

Use Gemini Live when:
- Need sub-second latency
- Want multimodal input (audio + images + text)
- Already using Gemini ecosystem
- Need function calling in real-time conversations


**For complete implementation patterns (edge functions, CORS, frontend integration, WebSocket handling):**
→ See the `integration-patterns` skill
