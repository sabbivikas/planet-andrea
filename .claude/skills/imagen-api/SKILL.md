---
name: imagen-api
description: Use this skill when the user wants to generate images using Google Imagen 4 via the Gemini API. Provides integration guidance for high-quality image generation without needing Vertex AI.
---
# Imagen 4 on Gemini API Integration

**⚠️ REQUIRED: Read [integration-patterns.md](references/integration-patterns.md) for implementation patterns before proceeding.**


Generate high-quality images using Google's Imagen 4 model directly via the Gemini API — no Vertex AI setup required.

## Quick Reference

**API Documentation:** Use Context7 API to retrieve current docs (see integration-patterns skill)
**Base URL:** `https://generativelanguage.googleapis.com/v1beta`

**Main Endpoint:**
- `POST /models/{model}:predict` - Generate images

## Environment Variable

- **Variable name:** `GEMINI_API_KEY`
- **Used via:** `config.geminiApiKey`
- **Note:** Woz provides this API key by default. The key is pre-configured, paid for, and will work out of the box. You don't need to worry about API limits or tier restrictions.

## Implementation Gotchas

1. **Gemini API, not Vertex** - Uses the Gemini API base URL, no Google Cloud project required
2. **v1beta endpoint** - Image generation is in v1beta, not v1 stable
3. **SynthID watermark** - All generated images contain invisible SynthID watermark (Google policy)
4. **Safety filtering** - Content may be blocked by Google's safety filters; handle gracefully
5. **Multiple images** - Set `sampleCount` to generate up to 4 variations per request
6. **Aspect ratios** - "1:1", "3:4", "4:3", "9:16", "16:9"
7. **Negative prompts** - Use `negativePrompt` to exclude unwanted elements
8. **Seed for reproducibility** - Provide `seed` for consistent results across generations
9. **No editing endpoint** - Imagen 4 on Gemini API is generation only; use Gemini native image gen for editing
10. **Response is base64** - Images returned as base64-encoded data; decode before displaying

## Response Structure

```typescript
// Prediction response
interface ImagenPredictResponse {
  predictions: Array<{
    bytesBase64Encoded: string;  // base64-encoded image data
    mimeType: string;  // "image/png"
  }>;
}
```

## Example API Call

```bash
# Generate an image
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/$MODEL_ID:predict?key=$YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{
      "prompt": "A photorealistic image of a mountain lake at sunrise with fog rolling over the water"
    }],
    "parameters": {
      "sampleCount": 2,
      "aspectRatio": "16:9",
      "negativePrompt": "blurry, low quality, cartoon"
    }
  }'

# Fast generation
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/$MODEL_ID:predict?key=$YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{
      "prompt": "Minimalist logo design for a coffee shop called Brew & Bean"
    }],
    "parameters": {
      "sampleCount": 4,
      "aspectRatio": "1:1"
    }
  }'

# Ultra quality
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/$MODEL_ID:predict?key=$YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{
      "prompt": "Professional product photograph of a luxury watch on marble surface with dramatic lighting"
    }],
    "parameters": {
      "sampleCount": 1,
      "aspectRatio": "4:3"
    }
  }'
```

## Use Cases

- **Marketing assets** - Generate product images and social media visuals
- **App content** - Placeholder and illustrative images
- **Design exploration** - Rapid visual concept generation
- **E-commerce** - Product photography alternatives
- **Branding** - Logo and visual identity exploration

## Alternative Recommendations

- **Gemini Native Image Gen** - Image generation within a conversation context, supports editing
- **OpenAI gpt-image-1.5** - Alternative image generation
- **Vertex AI Imagen 4** - Same model with Vertex AI features (if already using GCP)

Use Imagen 4 on Gemini API when:
- Want highest quality dedicated image generation from Google
- Don't want to set up Vertex AI / Google Cloud project
- Need fast/standard/ultra quality tiers
- Already have a Gemini API key


**For complete implementation patterns (edge functions, CORS, frontend integration, base64 handling):**
→ See the `integration-patterns` skill
