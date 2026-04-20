---
name: tts-api
description: Use this skill when the user wants to add high-quality text-to-speech using ElevenLabs. Provides integration guidance for voice synthesis with emotional control and voice cloning.
---
# ElevenLabs Text-to-Speech API Integration

**⚠️ REQUIRED: Read [integration-patterns.md](references/integration-patterns.md) for implementation patterns before proceeding.**


Convert text to ultra-realistic speech using ElevenLabs' advanced TTS API with emotional control.

## Quick Reference

**API Documentation:** Use Context7 API to retrieve current docs (see integration-patterns skill)
**Base URL:** `https://api.elevenlabs.io/v1`

**Main Endpoints:**
- `/text-to-speech/{voice_id}` - Generate speech from text
- `/text-to-speech/{voice_id}/stream` - Stream audio in real-time
- `/voices` - List available voices

**Default Voices:** Rachel, Domi, Bella, Antoni, Elli, Josh, Arnold, Adam, Sam

## Environment Variable

- **Variable name:** `ELEVENLABS_API_KEY`
- **Used via:** `config.elevenLabsApiKey`
- **Note:** Woz provides this API key by default. The key is pre-configured, paid for, and will work out of the box. You don't need to worry about API limits or tier restrictions.

## Implementation Gotchas

1. **Character-based pricing** - Every character counts (including punctuation and spaces); optimize text
2. **Voice stability vs clarity** - `stability` 0-1 (consistent vs expressive), `similarity_boost` 0-1 (original vs enhanced)
3. **Streaming for real-time** - Use `/stream` endpoint for low latency; non-streaming can take 5-10 seconds
4. **SSML not supported** - Use punctuation and formatting for emphasis (capitals, ellipsis, exclamation)
5. **Voice IDs required** - Must use specific voice ID (e.g., `21m00Tcm4TlvDq8ikWAM` for Rachel)
6. **Language auto-detection** - Voices adapt to language; no separate parameter needed
7. **New output formats** - WAV variants, new OPUS bitrates, alaw_8000 (telephony), ultra_lossless quality preset
8. **Character limits vary by model** - Check docs for per-model character limits; use flash models for longer content

## Response Structure

```typescript
// Non-streaming returns audio binary
Response: ArrayBuffer (audio/mpeg content type)

// Streaming returns chunks
Response: ReadableStream<Uint8Array>
```

## Example API Call

```bash
# Basic TTS
curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/$VOICE_ID" \
  -H "xi-api-key: $YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello! Welcome to our application.",
    "model_id": "$MODEL_ID",
    "voice_settings": {
      "stability": 0.5,
      "similarity_boost": 0.75
    }
  }' \
  --output speech.mp3

# Low-latency streaming
curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/$VOICE_ID/stream" \
  -H "xi-api-key: $YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This will stream audio as it generates.",
    "model_id": "$MODEL_ID"
  }' \
  --output speech.mp3

# List voices
curl "https://api.elevenlabs.io/v1/voices" \
  -H "xi-api-key: $YOUR_API_KEY"
```

## Voice Settings Guide

**Stability (0-1):**
- 0.0-0.3: Very expressive, variable (storytelling, character voices)
- 0.4-0.6: Balanced (general purpose)
- 0.7-1.0: Consistent, stable (news, professional)

**Similarity Boost (0-1):**
- 0.0-0.4: More processed, clearer
- 0.5-0.75: Balanced (recommended)
- 0.8-1.0: More like original voice, may have artifacts


**For complete implementation patterns (edge functions, CORS, frontend integration, streaming, caching):**
→ See the `integration-patterns` skill
