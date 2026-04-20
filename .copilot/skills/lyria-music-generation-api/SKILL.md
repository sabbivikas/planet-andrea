---
name: lyria-music-generation-api
description: Use this skill when the user wants to generate music using Google Lyria 2. Provides integration guidance for AI music generation from text prompts on Vertex AI.
---
# Google Lyria 2 Music Generation API Integration

**⚠️ REQUIRED: Read [integration-patterns.md](references/integration-patterns.md) for implementation patterns before proceeding.**


Generate music from text descriptions using Google's Lyria 2 model on Vertex AI.

## Quick Reference

**API Documentation:** Use Context7 API to retrieve current docs (see integration-patterns skill)
**Base URL:** `https://${REGION}-aiplatform.googleapis.com/v1`

**Main Endpoint:**
- `POST /projects/{PROJECT_ID}/locations/{REGION}/publishers/google/models/{model}:predict` - Generate music

## Environment Variables

- **Variable name:** `GOOGLE_VERTEX_API_KEY`
- **Used via:** `config.googleVertexApiKey`
- **Project ID:** `GOOGLE_CLOUD_PROJECT_ID` / `config.googleCloudProjectId`
- **Note:** Woz provides these credentials by default. They are pre-configured, paid for, and will work out of the box. You don't need to worry about API limits or tier restrictions.

## Implementation Gotchas

1. **Vertex AI only** - Lyria 2 is available through Vertex AI, not the Gemini API
2. **30-second output** - Each generation produces a 30-second audio clip
3. **WAV format** - Output is WAV at 48kHz, base64-encoded
4. **Multilingual prompts** - Supports prompts in multiple languages
5. **Negative prompts** - Use `negative_prompt` to exclude unwanted elements (e.g., "no vocals", "no drums")
6. **Seed for reproducibility** - Provide `seed` parameter to get consistent results
7. **Multiple samples** - Set `sample_count` to generate variations (default 1)
8. **SynthID watermark** - All generated audio contains invisible SynthID watermark (Google policy)
9. **No looping guarantee** - Generated clips may not loop seamlessly; post-process if needed

## Response Structure

```typescript
// Prediction response
interface LyriaPredictResponse {
  predictions: Array<{
    audio: string;  // base64-encoded WAV data
    mimeType: string;  // "audio/wav"
  }>;
}
```

## Example API Call

```bash
# Generate music from text prompt
curl -X POST "https://us-central1-aiplatform.googleapis.com/v1/projects/$YOUR_PROJECT/locations/us-central1/publishers/google/models/$MODEL_ID:predict" \
  -H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{
      "prompt": "Upbeat electronic dance music with a driving bass line and ethereal synth pads",
      "negative_prompt": "no vocals, no acoustic instruments"
    }],
    "parameters": {
      "sample_count": 2,
      "seed": 42
    }
  }'

# Ambient background music
curl -X POST "https://us-central1-aiplatform.googleapis.com/v1/projects/$YOUR_PROJECT/locations/us-central1/publishers/google/models/$MODEL_ID:predict" \
  -H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{
      "prompt": "Calm ambient music with soft piano and gentle strings, suitable for meditation"
    }],
    "parameters": {
      "sample_count": 1
    }
  }'
```

## Prompt Best Practices

**Good prompts:**
- "Upbeat pop rock with electric guitar riffs and steady drums, 120 BPM"
- "Lo-fi hip hop beat with vinyl crackle and mellow jazz piano"
- "Orchestral film score with dramatic strings and brass, building tension"
- "Acoustic folk song with fingerpicked guitar and gentle harmonica"

**Tips:**
- Specify genre: "jazz", "electronic", "classical", "rock"
- Include instruments: "piano", "guitar", "drums", "synth"
- Describe mood: "upbeat", "melancholy", "energetic", "calm"
- Mention tempo: "slow", "moderate", "fast", "120 BPM"
- Use negative prompts to exclude: "no vocals", "no percussion"

## Use Cases

- **App background music** - Generate custom ambient music for apps
- **Game audio** - Dynamic music for different game states
- **Content creation** - Background music for videos and podcasts
- **Prototyping** - Quick music mockups before commissioning composers
- **Meditation/wellness** - Generate calming soundscapes

## Alternative Recommendations

- **ElevenLabs Music Generation** - Alternative music generation API
- **Suno** - Popular music generation with vocals
- **AIVA** - AI-composed classical and cinematic music

Use Lyria 2 when:
- Already using Google Cloud/Vertex AI
- Need instrumental music without vocals
- Want reproducible results (seed parameter)
- Need high-quality 48kHz WAV output


**For complete implementation patterns (edge functions, CORS, frontend integration, audio playback):**
→ See the `integration-patterns` skill
