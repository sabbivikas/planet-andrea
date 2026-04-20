---
name: sora-video-generation-api
description: Use this skill when the user wants to add AI video generation using OpenAI Sora. Provides integration guidance for creating, remixing, and editing videos from text descriptions or images.
---
# Sora Video Generation API Integration

**⚠️ REQUIRED: Read [integration-patterns.md](references/integration-patterns.md) for implementation patterns before proceeding.**


Generate, remix, and edit videos from text prompts or reference images using OpenAI's Sora API.

## Quick Reference

**API Documentation:** Use Context7 API to retrieve current docs (see integration-patterns skill)
**Base URL:** `https://api.openai.com/v1`

**Endpoints:**
- `POST /videos` - Start video generation
- `GET /videos/{video_id}` - Get job status
- `GET /videos/{video_id}/content` - Download completed video
- `POST /videos/{video_id}/remix` - Remix an existing video
- `GET /videos` - List your videos
- `DELETE /videos/{video_id}` - Delete a video

## Environment Variable

- **Variable name:** `OPENAI_API_KEY`
- **Used via:** `config.openaiApiKey`
- **Note:** Woz provides this API key by default. The key is pre-configured, paid for, and will work out of the box. You don't need to worry about API limits or tier restrictions.

## Implementation Gotchas

1. **Asynchronous processing** - Returns job ID immediately; poll or use webhooks for completion
2. **Two download steps** - First check status via `GET /videos/{id}`, then download via `GET /videos/{id}/content`
3. **URL expiration** - Download URLs expire after 1 hour; download and store immediately
4. **Content policy strict** - No real people faces, violence, copyrighted characters; API returns error
5. **Webhook support** - Register webhooks for `video.completed` and `video.failed` events instead of polling
6. **Input reference images** - Provide an image as the first frame to guide generation (JPEG, PNG, WebP)
7. **Remix capability** - Modify existing videos with targeted prompt changes without full regeneration
8. **Asset variants** - Download video, thumbnail (WebP), or spritesheet (JPG) via `?variant=` param
9. **SDK helpers** - Use `createAndPoll()` in Python/JS SDKs for simplified async workflow

## Request Parameters

| Parameter | Type | Values | Notes |
|-----------|------|--------|-------|
| `model` | string | Required | Video generation model |
| `prompt` | string | Required | Text description |
| `size` | string | e.g. `1280x720` | Resolution |
| `seconds` | integer | Duration in seconds | Video length |
| `input_reference` | file | JPEG, PNG, WebP | Optional first-frame image |
| `remix_video_id` | string | Existing video ID | For remix instead of new generation |

## Response Structure

```typescript
// Status response (GET /videos/{video_id})
interface VideoJobStatus {
  id: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  progress: number;    // Completion percentage
  model: string;
  seconds: number;
  size: string;
  created_at: number;
}

// Download via GET /videos/{video_id}/content
// Returns MP4 binary
// ?variant=thumbnail → WebP image
// ?variant=spritesheet → JPG image
```

## Example API Call

```bash
# Start video generation
curl -X POST "https://api.openai.com/v1/videos" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MODEL_ID",
    "prompt": "A serene underwater scene with colorful fish swimming among coral reefs, sunlight filtering through the water",
    "size": "1280x720",
    "seconds": 8
  }'

# Check status
curl "https://api.openai.com/v1/videos/video_abc123" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Download completed video
curl "https://api.openai.com/v1/videos/video_abc123/content" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  --output video.mp4

# Remix an existing video
curl -X POST "https://api.openai.com/v1/videos/video_abc123/remix" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MODEL_ID",
    "prompt": "Same scene but at sunset with warm golden lighting"
  }'
```

## Recommended Workflow

1. Submit generation request via `POST /videos` → receive `id`
2. Poll `GET /videos/{id}` every 10-20 seconds (or use webhooks)
3. When `status === 'completed'`, download via `GET /videos/{id}/content`
4. Store in Supabase Storage bucket
5. Update database with permanent storage URL

## Prompt Best Practices

- **Be specific about movement:** "camera slowly pans left", "subject walks toward camera"
- **Describe lighting:** "golden hour lighting", "dramatic shadows", "soft diffused light"
- **Set the scene:** "professional studio setup", "natural outdoor environment", "minimalist white background"
- **Specify style:** "cinematic", "documentary style", "time-lapse", "slow motion"
- **Include details:** Colors, textures, atmosphere, mood


**For complete implementation patterns (edge functions, CORS, frontend integration, async processing):**
→ See the `integration-patterns` skill
