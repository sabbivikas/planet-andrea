---
name: speech-to-text-api
description: Use this skill when the user wants to add speech-to-text transcription using ElevenLabs. Provides integration guidance for audio transcription with speaker diarization and entity detection.
---
# ElevenLabs Speech-to-Text API Integration

**⚠️ REQUIRED: Read [integration-patterns.md](references/integration-patterns.md) for implementation patterns before proceeding.**


Transcribe audio with speaker diarization and entity detection using ElevenLabs' Scribe models.

## Quick Reference

**API Documentation:** Use Context7 API to retrieve current docs (see integration-patterns skill)
**Base URL:** `https://api.elevenlabs.io/v1`

**Main Endpoint:**
- `/speech-to-text` - Transcribe audio files

## Environment Variable

- **Variable name:** `ELEVENLABS_API_KEY`
- **Used via:** `config.elevenLabsApiKey`
- **Note:** Woz provides this API key by default. The key is pre-configured, paid for, and will work out of the box. You don't need to worry about API limits or tier restrictions.

## Implementation Gotchas

1. **Use latest Scribe model** - State-of-the-art accuracy; check docs for current recommended model
2. **90+ languages** - Automatic language detection; no parameter needed
3. **32-speaker diarization** - Can identify up to 32 different speakers in audio
4. **Entity detection** - Scribe v2 can detect named entities in transcription
5. **Keyterm prompting** - Provide domain-specific terms to improve accuracy
6. **File size limit** - 50MB max file size; chunk larger files
7. **Supported formats** - MP3, MP4, MPEG, MPGA, M4A, WAV, WEBM
8. **Word-level timestamps** - Response includes precise word timing for synchronization
9. **Real-time option** - Use the realtime model with WebSocket for live transcription; supports PCM (8kHz-48kHz) and μ-law encoding

## Response Structure

```typescript
interface SpeechToTextResponse {
  text: string;  // Full transcription
  segments: Array<{
    text: string;
    start: number;  // Start time in seconds
    end: number;    // End time in seconds
    speaker?: string;  // Speaker ID if diarization enabled
  }>;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}
```

## Example API Call

```bash
# Basic transcription with scribe_v2
curl -X POST "https://api.elevenlabs.io/v1/speech-to-text" \
  -H "xi-api-key: YOUR_API_KEY" \
  -F "audio=@recording.mp3" \
  -F "model_id=MODEL_ID"

# With speaker diarization
curl -X POST "https://api.elevenlabs.io/v1/speech-to-text" \
  -H "xi-api-key: YOUR_API_KEY" \
  -F "audio=@interview.mp3" \
  -F "model_id=MODEL_ID" \
  -F "diarization=true"
```

## Use Cases

- **Meeting transcription** - Record and transcribe meetings with speaker labels
- **Podcast subtitles** - Generate captions for podcast episodes
- **Voice notes** - Convert voice memos to searchable text
- **Interview processing** - Transcribe interviews with speaker identification

## Audio Quality Tips

1. **Use good microphones** - Clear audio = better transcription
2. **Reduce background noise** - Use audio-isolation API first if needed
3. **Separate speakers** - Distinct voices improve diarization
4. **Avoid overlapping speech** - Wait for speaker to finish
5. **Standard sample rates** - 16kHz, 44.1kHz, or 48kHz recommended

## Alternative Recommendations

- **OpenAI Transcribe** - Better language support, structured output
- **Google Cloud Speech** - Enterprise features, streaming support
- **Assembly AI** - Advanced features (sentiment, entity detection)

Use ElevenLabs STT when:
- Already using ElevenLabs TTS
- Need 32-speaker diarization
- Want unified billing with voice synthesis


**For complete implementation patterns (edge functions, CORS, frontend integration, chunking):**
→ See the `integration-patterns` skill
