---
name: grok-video-generation-api
description: Use this skill when the user wants to add xAI Grok video generation. Provides integration guidance for AI-powered video creation, image-to-video, and video editing.
---
# Grok Video Generation API Integration

**⚠️ REQUIRED: Read [integration-patterns.md](references/integration-patterns.md) for implementation patterns before proceeding.**


Generate and edit videos from text prompts, images, or existing videos using xAI's Grok video generation capabilities.

## Quick Reference

**API Documentation:** Use Context7 API to retrieve current docs (see integration-patterns skill)
**Base URL:** `https://api.x.ai/v1`

**Endpoints:**
- `POST /videos/generations` - Start video generation (returns request_id)
- `GET /videos/{request_id}` - Poll for completion status

## Environment Variable

- **Variable name:** `GROK_API_KEY`
- **Used via:** `config.grokApiKey`
- **Note:** Woz provides this API key by default. The key is pre-configured, paid for, and will work out of the box. You don't need to worry about API limits or tier restrictions.

## Implementation Gotchas

1. **Asynchronous processing** - Generation takes up to several minutes; returns a `request_id` for polling
2. **Two-step flow** - Submit request → poll status until `done` or `expired`
3. **Temporary URLs** - Video URLs are ephemeral; download and store immediately
4. **Duration limits** - Text-to-video: 1-15 seconds max. Video editing input: 8.7 seconds max.
5. **Resolution options** - `480p` (default) or `720p` only
6. **SDK auto-polling** - Python/JS SDKs handle polling automatically with configurable timeout (default 10 min) and interval
7. **Editing constraints** - Video editing does NOT support custom `duration`, `aspect_ratio`, or `resolution` — uses source video properties
8. **Content moderation** - Strict content filtering applies

## Request Parameters

| Parameter | Type | Values | Notes |
|-----------|------|--------|-------|
| `prompt` | string | Required | Text description of desired video |
| `model` | string | Required | Video generation model |
| `duration` | integer | 1-15 seconds | Generation only (not editing) |
| `aspect_ratio` | string | `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3` | Defaults to `16:9` |
| `resolution` | string | `480p`, `720p` | Defaults to `480p` |
| `video_url` | string | URL or base64 data URI | Source for image-to-video or video editing |

## Response Structure

```typescript
// Initial response (POST /videos/generations)
interface VideoGenerationStart {
  request_id: string;
}

// Status response (GET /videos/{request_id})
interface VideoGenerationStatus {
  status: 'pending' | 'done' | 'expired';
  video?: {
    url: string;          // Temporary video URL
    duration: number;     // Duration in seconds
    respect_moderation: boolean;
  };
  model: string;
}
```

## Features

**Text-to-Video:** Generate from natural language prompts (1-15 seconds).

**Image-to-Video:** Transform a still image into video by providing `video_url` with an image. Output defaults to input aspect ratio unless overridden.

**Video Editing:** Edit an existing video by providing the source `video_url` with a text prompt. The model understands video content and applies changes. Preserves original duration (capped 8.7s) and resolution (capped 720p).

## Example API Call

```bash
# Start text-to-video generation
curl -X POST "https://api.x.ai/v1/videos/generations" \
  -H "Authorization: Bearer $YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "$MODEL_ID",
    "prompt": "A time-lapse of a flower blooming, close-up shot with soft lighting",
    "duration": 5,
    "aspect_ratio": "16:9",
    "resolution": "720p"
  }'

# Poll for completion
curl "https://api.x.ai/v1/videos/$REQUEST_ID" \
  -H "Authorization: Bearer $YOUR_API_KEY"

# Image-to-video
curl -X POST "https://api.x.ai/v1/videos/generations" \
  -H "Authorization: Bearer $YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "$MODEL_ID",
    "prompt": "Animate this scene with gentle wind blowing through the trees",
    "video_url": "https://example.com/landscape.jpg",
    "duration": 5
  }'
```

## Recommended Workflow

1. Submit generation request via `POST /videos/generations`
2. Store `request_id` in database with user reference
3. Poll `GET /videos/{request_id}` (SDKs auto-poll; manual: every 5-10 seconds with backoff)
4. When status is `done`, download video to Supabase Storage immediately
5. Update database with permanent storage URL
6. Notify user via push notification or in-app alert

## Prompt Best Practices

- **Keep it simple:** Short, focused descriptions work best for short videos
- **Specify camera movement:** "camera pans left", "zoom in", "static shot"
- **Describe action:** "person walking", "leaves falling", "water flowing"
- **Set the scene:** Lighting, time of day, environment
- **Be realistic:** Current models struggle with complex physics and interactions

## Alternative Recommendations

For production video generation:
- **Runway ML** - Gen-2 model, better documented
- **Pika Labs** - Simpler, more reliable
- **Stable Video Diffusion** - Open source option

Use Grok Video when:
- Already integrated with Grok ecosystem
- Need image-to-video or video editing capabilities
- Want a single API for generation and editing


**For complete implementation patterns (edge functions, async jobs, webhooks, video storage):**
→ See the `integration-patterns` skill
