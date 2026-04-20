---
name: grok-chat-api
description: Use this skill when the user wants to add xAI Grok chat capabilities. Provides integration guidance for conversational AI with reasoning, web search, structured outputs, and vision.
---
# Grok Chat API Integration

**⚠️ REQUIRED: Read [integration-patterns.md](references/integration-patterns.md) for implementation patterns before proceeding.**


Build conversational AI applications using xAI's Grok API with reasoning, web search, vision, and structured output capabilities.

## Quick Reference

**API Documentation:** Use Context7 API to retrieve current docs (see integration-patterns skill)
**Base URL:** `https://api.x.ai/v1`

**Endpoints:**
- `POST /responses` - **Primary** (stateful, supports all features)
- `POST /chat/completions` - **Legacy** (stateless, limited new features)
- `GET /responses/{response_id}` - Retrieve a previous response
- `DELETE /responses/{response_id}` - Delete a stored response

## Environment Variable

- **Variable name:** `GROK_API_KEY`
- **Used via:** `config.grokApiKey`
- **Note:** Woz provides this API key by default. The key is pre-configured, paid for, and will work out of the box. You don't need to worry about API limits or tier restrictions.

## Implementation Gotchas

1. **Responses API is primary** - Chat Completions is legacy; new features ship to Responses API first
2. **Stateful conversations** - Responses API stores conversation server-side; use `previous_response_id` to continue
3. **OpenAI SDK compatible** - Works with OpenAI Python/JS SDKs (change base URL and API key)
4. **Reasoning models** - Do NOT support `presencePenalty`, `frequencyPenalty`, or `stop` parameters
5. **System message rules** - Single system/developer message must be first in messages array
6. **30-day retention** - Stored responses expire after 30 days
7. **Disable storage** - Set `store: false` if you don't want server-side storage
8. **No `instructions` param** - The `instructions` parameter is not supported; use system messages instead

## Built-in Server-Side Tools

These tools run server-side and can be added to requests:
- `web_search` - Real-time web search
- `x_search` - Search X posts and trends
- `code_execution` - Execute code server-side
- `collections_search` - RAG search over uploaded documents (see grok-collections-api skill)

## Response Structure

```typescript
// Responses API
interface GrokResponse {
  id: string;
  object: 'response';
  model: string;
  output: Array<{
    type: 'message';
    role: 'assistant';
    content: Array<{
      type: 'output_text';
      text: string;
    }>;
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}
```

## Example API Call

```bash
# Responses API (recommended)
curl -X POST "https://api.x.ai/v1/responses" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MODEL_ID",
    "input": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "What are the latest developments in AI?"
      }
    ]
  }'

# Continue a conversation (stateful)
curl -X POST "https://api.x.ai/v1/responses" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MODEL_ID",
    "previous_response_id": "resp_abc123",
    "input": [
      {
        "role": "user",
        "content": "Tell me more about that."
      }
    ]
  }'

# Legacy Chat Completions (still works)
curl -X POST "https://api.x.ai/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MODEL_ID",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

## Vision (Image Understanding)

Grok models accept images in chat messages:
- Max size: 20MiB
- Formats: JPEG, PNG
- Detail levels: `auto` (default), `low`, `high`
- Pass images via `image_url` in content array (base64 or URL)

## Migration from OpenAI

**Change only:**
1. Base URL: `https://api.openai.com/v1` → `https://api.x.ai/v1`
2. API key: `config.openaiApiKey` → `config.grokApiKey`
3. Model name: update to current Grok model

**Keep same:**
- OpenAI SDK works directly (just change base URL + key)
- Request structure (for both Responses API and Chat Completions)
- Streaming logic
- Function calling format


**For complete implementation patterns (edge functions, CORS, frontend integration, streaming):**
→ See the `integration-patterns` skill
