---
name: openai-image-generation-api
description: Use this skill when the user wants to add AI image generation using OpenAI GPT Image. Provides integration guidance for creating, editing, and iterating on images from text descriptions.
---
# OpenAI Image Generation API Integration

**⚠️ REQUIRED: Read [integration-patterns.md](references/integration-patterns.md) for implementation patterns before proceeding.**


Generate and edit images using OpenAI's GPT Image API with transparent backgrounds, streaming, and multi-turn editing.

## Quick Reference

**API Documentation:** Use Context7 API to retrieve current docs (see integration-patterns skill)
**Base URL:** `https://api.openai.com/v1`

**Main Endpoints:**
- `/images/generations` - Generate images from text prompts
- `/images/edits` - Edit images with prompts

## Environment Variable

- **Variable name:** `OPENAI_API_KEY`
- **Used via:** `config.openaiApiKey`
- **Note:** Woz provides this API key by default. The key is pre-configured, paid for, and will work out of the box. You don't need to worry about API limits or tier restrictions.

## Implementation Gotchas

1. **New size format** - GPT Image uses `1024x1024`, `1536x1024`, `1024x1536` (not DALL-E size options)
2. **Quality levels changed** - `low`, `medium`, `high` (not `standard`/`hd`)
3. **Up to 10 images** - Use `n` parameter (1-10) for batch generation
4. **Transparent backgrounds** - Set `background: "transparent"` (GPT Image exclusive feature)
5. **Output formats** - PNG (default), JPEG, WebP; use `output_compression` (0-100%) for JPEG/WebP
6. **URL expiration** - Image URLs expire after 1 hour; download and store immediately
7. **Content policy strict** - Avoid prompts with faces, violence, copyrighted content; API returns error
8. **Streaming partial images** - Use `partial_images` (0-3) in Responses API for progressive rendering
9. **Image editing simplified** - No mask required; just describe what to change (unlike DALL-E 2)

## Request Parameters

| Parameter | Type | Values | Notes |
|-----------|------|--------|-------|
| `model` | string | Required | Image generation model |
| `prompt` | string | Required | Text description |
| `n` | integer | 1-10 | Number of images |
| `size` | string | `1024x1024`, `1536x1024`, `1024x1536` | Default: 1024x1024 |
| `quality` | string | `low`, `medium`, `high` | Default: medium |
| `output_format` | string | `png`, `jpeg`, `webp` | Default: png |
| `output_compression` | integer | 0-100 | JPEG/WebP compression % |
| `background` | string | `opaque`, `transparent` | Default: opaque |
| `response_format` | string | `url`, `b64_json` | How to return images |

## Response Structure

```typescript
interface ImageGenerationResponse {
  created: number;  // Unix timestamp
  data: Array<{
    url?: string;         // Temporary URL (expires in 1 hour)
    b64_json?: string;    // Base64-encoded image (if requested)
    revised_prompt?: string;  // Model may revise your prompt
  }>;
}
```

## Example API Call

```bash
# Generate image
curl -X POST "https://api.openai.com/v1/images/generations" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MODEL_ID",
    "prompt": "A serene mountain landscape at sunset with a lake reflection",
    "size": "1536x1024",
    "quality": "high",
    "n": 1
  }'

# Transparent background (logos, icons)
curl -X POST "https://api.openai.com/v1/images/generations" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MODEL_ID",
    "prompt": "A cute robot mascot on a transparent background",
    "background": "transparent",
    "output_format": "png",
    "n": 1
  }'

# Image editing (no mask needed)
curl -X POST "https://api.openai.com/v1/images/edits" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "image=@original.png" \
  -F "prompt=Add a red hat to the character" \
  -F "model=MODEL_ID"

# Batch generation
curl -X POST "https://api.openai.com/v1/images/generations" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MODEL_ID",
    "prompt": "A cartoon robot mascot",
    "size": "1024x1024",
    "n": 4
  }'
```


**For complete implementation patterns (edge functions, CORS, frontend integration, caching, error handling):**
→ See the `integration-patterns` skill
