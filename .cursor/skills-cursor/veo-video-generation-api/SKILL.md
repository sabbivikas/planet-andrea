---
name: veo-video-generation-api
description: Use this skill when the user wants to generate videos using Google Veo 3. Provides integration guidance for text-to-video and image-to-video generation with synchronized audio on Vertex AI.
---
# Google Veo 3 Video Generation API Integration

**⚠️ REQUIRED: Read [integration-patterns.md](references/integration-patterns.md) for implementation patterns before proceeding.**


Generate cinematic videos with synchronized audio from text prompts or images using Google's Veo 3 on Vertex AI.

## Quick Reference

**API Documentation:** Use Context7 API to retrieve current docs (see integration-patterns skill)
**Base URL:** `https://${REGION}-aiplatform.googleapis.com/v1`

**Main Endpoint:**
- `POST /projects/{PROJECT_ID}/locations/{REGION}/publishers/google/models/{MODEL}:predict` - Generate video

## Environment Variables

- **Variable name:** `GOOGLE_VERTEX_API_KEY`
- **Used via:** `config.googleVertexApiKey`
- **Project ID:** `GOOGLE_CLOUD_PROJECT_ID` / `config.googleCloudProjectId`
- **Note:** Woz provides these credentials by default. They are pre-configured, paid for, and will work out of the box. You don't need to worry about API limits or tier restrictions.

## Implementation Gotchas

1. **Vertex AI only** - Veo 3 is available through Vertex AI, not the Gemini API
2. **Async generation** - Video generation takes 1-3 minutes; use polling or callbacks
3. **Duration options** - 4, 6, or 8 seconds per generation
4. **Resolution** - 720p or 1080p output
5. **Aspect ratios** - 16:9 (landscape) or 9:16 (portrait)
6. **Up to 4 videos per request** - Set `sampleCount` for multiple variations
7. **Audio included** - Veo 3 generates synchronized audio with video (can be disabled)
8. **Image-to-video** - Provide a reference image to animate; image influences first frame
9. **24fps output** - All generated videos are 24 frames per second
10. **Safety filtering** - Content may be blocked by Google's safety filters; handle gracefully

## Response Structure

```typescript
// Prediction response
interface VeoPredictResponse {
  predictions: Array<{
    video: string;  // base64-encoded video data
    mimeType: string;  // "video/mp4"
  }>;
  metadata: {
    duration: number;
    width: number;
    height: number;
  };
}

// For async operations
interface VeoOperationResponse {
  name: string;  // Operation ID for polling
  done: boolean;
  result?: VeoPredictResponse;
}
```

## Example API Call

```bash
# Text-to-video generation
curl -X POST "https://us-central1-aiplatform.googleapis.com/v1/projects/$YOUR_PROJECT/locations/us-central1/publishers/google/models/$MODEL_ID:predict" \
  -H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{
      "prompt": "A golden retriever running through a field of wildflowers at sunset, cinematic lighting"
    }],
    "parameters": {
      "sampleCount": 1,
      "durationSeconds": 6,
      "aspectRatio": "16:9",
      "resolution": "1080p",
      "generateAudio": true
    }
  }'

# Image-to-video generation
curl -X POST "https://us-central1-aiplatform.googleapis.com/v1/projects/$YOUR_PROJECT/locations/us-central1/publishers/google/models/$MODEL_ID:predict" \
  -H "Authorization: Bearer $YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{
      "prompt": "Camera slowly zooms in as the subject smiles",
      "image": {
        "bytesBase64Encoded": "BASE64_IMAGE_DATA"
      }
    }],
    "parameters": {
      "sampleCount": 1,
      "durationSeconds": 4,
      "aspectRatio": "16:9"
    }
  }'
```

## Use Cases

- **Marketing content** - Generate product videos and social media clips
- **Storytelling** - Create animated scenes from written narratives
- **Prototyping** - Quick video mockups for presentations
- **Education** - Generate illustrative video content
- **Social media** - Short-form video content generation

## Alternative Recommendations

- **Sora (OpenAI)** - Alternative video generation with different style strengths
- **Grok Video (xAI)** - Video generation with image-to-video and editing

Use Veo 3 when:
- Need synchronized audio with video
- Already using Google Cloud/Vertex AI
- Need cinematic quality output
- Portrait (9:16) video needed for mobile


**For complete implementation patterns (edge functions, CORS, frontend integration, async polling):**
→ See the `integration-patterns` skill
