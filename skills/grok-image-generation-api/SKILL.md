---
name: grok-image-generation-api
description: Use this skill when the user wants to add xAI Grok image generation or editing. Provides integration guidance for AI-powered image creation, editing, and style transfer.
---
# Grok Image Generation API Integration

**⚠️ REQUIRED: Read [integration-patterns.md](references/integration-patterns.md) for implementation patterns before proceeding.**


Generate and edit images from text prompts using xAI's Grok image generation capabilities.

## Quick Reference

**API Documentation:** Use Context7 API to retrieve current docs (see integration-patterns skill)
**Base URL:** `https://api.x.ai/v1`

**Endpoints:**
- `POST /images/generations` - Generate images from text prompts
- `POST /images/edits` - Edit existing images with natural language

## Environment Variable

- **Variable name:** `GROK_API_KEY`
- **Used via:** `config.grokApiKey`
- **Note:** Woz provides this API key by default. The key is pre-configured, paid for, and will work out of the box. You don't need to worry about API limits or tier restrictions.

## Implementation Gotchas

1. **Temporary URLs** - Generated image URLs expire quickly; download and store immediately
2. **Max 10 images per request** - Use the `n` parameter (up to 10)
3. **Aspect ratio, not pixel size** - Use `aspect_ratio` (e.g., `"16:9"`) instead of pixel dimensions
4. **Resolution options** - `"1k"` or `"2k"` only
5. **Image editing** - Can edit up to 3 source images simultaneously via `image_url` or `images` parameter
6. **Multi-turn editing** - Iteratively refine images through multiple edit requests
7. **Content moderation** - Strict content policy; prohibited prompts return errors
8. **Base64 support** - Use `response_format: "b64_json"` for direct embedding without URL download

## Request Parameters

| Parameter | Type | Values | Notes |
|-----------|------|--------|-------|
| `prompt` | string | Required | Text description |
| `model` | string | Required | Image generation model |
| `n` | integer | 1-10 | Number of images |
| `aspect_ratio` | string | `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `2:1`, `1:2`, `19.5:9`, `20:9`, `auto` | Aspect ratio |
| `resolution` | string | `1k`, `2k` | Output resolution |
| `response_format` | string | `url` (default), `b64_json` | How to return images |
| `image_url` | string | URL or base64 data URI | Source image for editing |

## Response Structure

```typescript
interface ImageGenerationResponse {
  created: number;
  data: Array<{
    url?: string;          // Temporary URL (download immediately)
    b64_json?: string;     // Base64-encoded image data
    revised_prompt?: string;
  }>;
}
```

## Example API Call

```bash
# Generate image
curl -X POST "https://api.x.ai/v1/images/generations" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MODEL_ID",
    "prompt": "A futuristic cityscape at sunset with flying vehicles",
    "n": 1,
    "aspect_ratio": "16:9",
    "resolution": "2k"
  }'

# Edit an existing image
curl -X POST "https://api.x.ai/v1/images/edits" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MODEL_ID",
    "prompt": "Change the sky to a dramatic sunset with orange and purple clouds",
    "image_url": "https://example.com/original-image.jpg"
  }'

# Get base64 response (no URL download needed)
curl -X POST "https://api.x.ai/v1/images/generations" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MODEL_ID",
    "prompt": "A cute robot mascot",
    "response_format": "b64_json"
  }'
```

## Prompt Best Practices

- **Be specific:** "photorealistic portrait" vs "picture of person"
- **Include style:** "digital art", "oil painting", "3D render", "sketch"
- **Describe lighting:** "soft natural light", "dramatic shadows", "golden hour"
- **Set composition:** "close-up", "wide angle", "aerial view"
- **Add details:** Colors, mood, atmosphere, textures

## Alternative Recommendations

If Grok image generation is unavailable or limited:
- **DALL-E 3** - Best quality, reliable API
- **Midjourney** (via unofficial API) - Artistic style
- **Stable Diffusion** - Open source, self-hosted option
- **Replicate** - Access multiple image models via one API

Use Grok Image when:
- Already integrated with Grok ecosystem
- Need consistency with Grok's style/capabilities
- Need image editing alongside generation


**For complete implementation patterns (edge functions, CORS, frontend integration, image storage):**
→ See the `integration-patterns` skill
