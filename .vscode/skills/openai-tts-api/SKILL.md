---
name: openai-tts-api
description: Use this skill when the user wants to add text-to-speech capabilities using OpenAI TTS. Provides integration guidance with steerable voice control via instructions parameter.
---
# OpenAI Text-to-Speech API Integration

**⚠️ REQUIRED: Read [integration-patterns.md](references/integration-patterns.md) for implementation patterns before proceeding.**


Convert text to natural-sounding speech using OpenAI's TTS API with steerable voice control.

## Quick Reference

**API Documentation:** Use Context7 API to retrieve current docs (see integration-patterns skill)
**Base URL:** `https://api.openai.com/v1`

**Main Endpoint:**
- `/audio/speech` - Convert text to speech

## Environment Variable

- **Variable name:** `OPENAI_API_KEY`
- **Used via:** `config.openaiApiKey`
- **Note:** Woz provides this API key by default. The key is pre-configured, paid for, and will work out of the box. You don't need to worry about API limits or tier restrictions.

## Implementation Gotchas

1. **Instructions parameter** - Latest models support `instructions` parameter for controlling tone, pacing, emotion, style
2. **Not all models support instructions** - Check API docs for which models support the `instructions` parameter
3. **Max 2000 input tokens** - Chunk longer text at sentence boundaries
4. **Speed control** - Adjust speed from 0.25x to 4.0x (`speed` parameter)
5. **Format options** - Supports mp3, opus, aac, flac, wav, pcm (mp3 recommended for web/mobile)
6. **Cache aggressively** - Same text + voice generates same audio; cache to save costs
7. **Chunking strategy** - Split on sentence boundaries, not arbitrary character counts

## Response Structure

**Response:** Audio file as binary data (ArrayBuffer/Blob)

**Content-Type header indicates format:**
- `audio/mpeg` - MP3 format
- `audio/opus` - Opus format
- `audio/aac` - AAC format
- `audio/wav` - WAV format

## Example API Call

```bash
# TTS with instructions (steerable)
curl -X POST "https://api.openai.com/v1/audio/speech" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MODEL_ID",
    "input": "Hello! Welcome to our application.",
    "voice": "coral",
    "instructions": "Speak in a cheerful and welcoming tone with moderate pacing.",
    "response_format": "mp3"
  }' \
  --output speech.mp3

# Basic TTS
curl -X POST "https://api.openai.com/v1/audio/speech" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MODEL_ID",
    "input": "Hello! This is a test.",
    "voice": "alloy",
    "response_format": "mp3",
    "speed": 1.0
  }' \
  --output speech.mp3
```


**For complete implementation patterns (edge functions, CORS, frontend integration, caching, error handling):**
→ See the `integration-patterns` skill
