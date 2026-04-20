---
name: openai-structured-outputs-api
description: Use this skill when the user wants to get structured JSON responses from OpenAI models. Provides integration guidance for JSON schema-constrained outputs that guarantee valid, typed responses.
---
# OpenAI Structured Outputs API Integration

**⚠️ REQUIRED: Read [integration-patterns.md](references/integration-patterns.md) for implementation patterns before proceeding.**


Get guaranteed JSON responses matching a provided schema from GPT models.

## Quick Reference

**API Documentation:** Use Context7 API to retrieve current docs (see integration-patterns skill)
**Base URL:** `https://api.openai.com/v1`

**Supported Endpoints:**
- `/chat/completions` - Via `response_format` parameter
- `/responses` - Via `text.format` parameter
- Assistants API and Batch API also supported

## Environment Variable

- **Variable name:** `OPENAI_API_KEY`
- **Used via:** `config.openaiApiKey`
- **Note:** Woz provides this API key by default. The key is pre-configured, paid for, and will work out of the box. You don't need to worry about API limits or tier restrictions.

## Implementation Gotchas

1. **`strict: true` required** - Must set `strict: true` in the schema for guaranteed output matching
2. **All fields must be `required`** - Optional fields not supported in strict mode; use nullable types instead
3. **`additionalProperties: false`** - Must be set on all objects in strict mode
4. **Supported types** - String, number, boolean, integer, object, array, enum, anyOf, null
5. **No regex/format constraints** - `pattern`, `format`, `minimum`, `maximum` not enforced in strict mode
6. **Nesting depth limit** - Max 5 levels of nested objects/arrays
7. **Schema caching** - First request with a new schema has added latency; subsequent requests are faster
8. **Refusal handling** - Model may refuse with `refusal` field instead of content if request violates safety policies
9. **100 object properties max** - Each object can have at most 100 properties

## Response Structure

```typescript
// Chat Completions response with structured output
interface StructuredChatResponse {
  choices: Array<{
    message: {
      content: string;   // JSON string matching your schema
      refusal: string | null;  // Non-null if model refused
    };
    finish_reason: 'stop' | 'length';
  }>;
}

// Parsed content (after JSON.parse)
// Matches your provided schema exactly
```

## Example API Call

```bash
# Chat Completions with structured output
curl -X POST "https://api.openai.com/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MODEL_ID",
    "messages": [
      {"role": "system", "content": "Extract event information from the text."},
      {"role": "user", "content": "The concert is on March 15 at Madison Square Garden, doors open at 7pm."}
    ],
    "response_format": {
      "type": "json_schema",
      "json_schema": {
        "name": "event_info",
        "strict": true,
        "schema": {
          "type": "object",
          "properties": {
            "event_name": { "type": "string" },
            "date": { "type": "string" },
            "venue": { "type": "string" },
            "time": { "type": ["string", "null"] }
          },
          "required": ["event_name", "date", "venue", "time"],
          "additionalProperties": false
        }
      }
    }
  }'

# Responses API with structured output
curl -X POST "https://api.openai.com/v1/responses" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MODEL_ID",
    "input": "Extract: The meeting is Tuesday at 3pm in Room 204.",
    "text": {
      "format": {
        "type": "json_schema",
        "name": "meeting_info",
        "strict": true,
        "schema": {
          "type": "object",
          "properties": {
            "day": { "type": "string" },
            "time": { "type": "string" },
            "location": { "type": "string" }
          },
          "required": ["day", "time", "location"],
          "additionalProperties": false
        }
      }
    }
  }'
```

## Schema Examples

```typescript
// Form data extraction
const formSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    email: { type: "string" },
    age: { type: ["integer", "null"] },
    interests: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["name", "email", "age", "interests"],
  additionalProperties: false
};

// Classification with enum
const classificationSchema = {
  type: "object",
  properties: {
    category: { type: "string", enum: ["bug", "feature", "question", "other"] },
    priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
    summary: { type: "string" }
  },
  required: ["category", "priority", "summary"],
  additionalProperties: false
};
```

## Use Cases

- **Data extraction** - Pull structured data from unstructured text
- **Form generation** - Generate form fields and validation from descriptions
- **Classification** - Categorize content into predefined types
- **API response formatting** - Ensure LLM output matches expected API shapes
- **Content moderation** - Get structured verdicts with reasoning


**For complete implementation patterns (edge functions, CORS, frontend integration, error handling):**
→ See the `integration-patterns` skill
