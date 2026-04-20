---
name: gemini-image-generation-api
description: Use this skill when the user wants to generate images using Gemini models natively. Provides integration guidance for inline image generation and editing via the Gemini API without needing a separate image model.
---
# Gemini Native Image Generation API Integration

**⚠️ REQUIRED: Read [integration-patterns.md](references/integration-patterns.md) for implementation patterns before proceeding.**


Generate and edit images inline using Gemini models via the standard generateContent endpoint — no separate image model needed.

## Quick Reference

**API Documentation:** Use Context7 API to retrieve current docs (see integration-patterns skill)
**Base URL:** `https://generativelanguage.googleapis.com/v1beta`

**Main Endpoint:**
- `POST /models/{model}:generateContent` - Generate or edit images (same endpoint as text/chat)

## Environment Variable

- **Variable name:** `GEMINI_API_KEY`
- **Used via:** `config.geminiApiKey`
- **Note:** Woz provides this API key by default. The key is pre-configured, paid for, and will work out of the box. You don't need to worry about API limits or tier restrictions.

## Implementation Gotchas

1. **Must set responseModalities** - Include `['TEXT', 'IMAGE']` or `['IMAGE']` in generationConfig; without this, only text is returned
2. **Images returned as base64** - Response contains `inline_data` with base64-encoded image and MIME type
3. **SynthID watermark** - All generated images contain invisible SynthID watermark (Google policy)
4. **Multi-turn editing** - Send conversation history to iteratively edit images; model remembers context
5. **Up to 14 reference images** - Can provide multiple input images for editing, style transfer, or composition
6. **Aspect ratio control** - Set `aspectRatio` in generationConfig: "1:1", "3:4", "4:3", "9:16", "16:9"
7. **Image size options** - `imageSize`: 512, 1024 (default), 2048, or 4096 pixels
8. **Mixed text+image output** - Model can return both text explanation and generated image in one response
9. **v1beta required** - Image generation is in v1beta, not v1 stable

## Response Structure

```typescript
// generateContent response with image
interface GeminiImageResponse {
  candidates: Array<{
    content: {
      parts: Array<
        | { text: string }
        | { inline_data: { mime_type: string; data: string } }  // base64 image
      >;
    };
    finishReason: string;
  }>;
}
```

## Example API Call

```bash
# Generate an image from text
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/$MODEL_ID:generateContent?key=$YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{"text": "Generate an image of a cozy cabin in the mountains during winter"}]
    }],
    "generationConfig": {
      "responseModalities": ["TEXT", "IMAGE"],
      "aspectRatio": "16:9",
      "imageSize": 1024
    }
  }'

# Edit an existing image
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/$MODEL_ID:generateContent?key=$YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [
        {"text": "Change the sky to sunset colors"},
        {"inline_data": {"mime_type": "image/png", "data": "BASE64_IMAGE_DATA"}}
      ]
    }],
    "generationConfig": {
      "responseModalities": ["TEXT", "IMAGE"]
    }
  }'
```

## Multi-Turn Editing Example

```typescript
// First turn: generate
const response1 = await generateContent({
  model: 'MODEL_ID',
  contents: [{ parts: [{ text: 'Draw a simple house with a red roof' }] }],
  generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
});

// Second turn: edit (include previous conversation)
const response2 = await generateContent({
  model: 'MODEL_ID',
  contents: [
    { role: 'user', parts: [{ text: 'Draw a simple house with a red roof' }] },
    { role: 'model', parts: response1.candidates[0].content.parts },
    { role: 'user', parts: [{ text: 'Add a garden with flowers in front' }] },
  ],
  generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
});
```

## Use Cases

- **Conversational image creation** - Generate images within a chat context
- **Iterative design** - Edit images through natural language conversation
- **Content creation** - Generate illustrations alongside text explanations
- **Style transfer** - Apply styles from reference images
- **Product mockups** - Quick visual prototypes from descriptions

## Alternative Recommendations

- **Imagen 4** - Higher quality dedicated image generation (Gemini API or Vertex AI)
- **OpenAI gpt-image-1.5** - Alternative image generation
- **Grok Image** - xAI image generation

Use Gemini Native Image Gen when:
- Want image generation within a conversation flow
- Need iterative editing with natural language
- Already using Gemini for text and want images inline
- Need mixed text+image responses


**For complete implementation patterns (edge functions, CORS, frontend integration, base64 handling):**
→ See the `integration-patterns` skill
