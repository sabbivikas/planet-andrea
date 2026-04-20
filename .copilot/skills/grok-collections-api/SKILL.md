---
name: grok-collections-api
description: Use this skill when the user wants to build RAG applications or search uploaded documents with Grok Collections. Provides integration guidance for knowledge base management and document retrieval.
---
# Grok Collections API Integration

**⚠️ REQUIRED: Read [integration-patterns.md](references/integration-patterns.md) for implementation patterns before proceeding.**


Build RAG applications and search uploaded knowledge bases using xAI's Grok Collections API.

## Quick Reference

**API Documentation:** Use Context7 API to retrieve current docs (see integration-patterns skill)
**Main API Base URL:** `https://api.x.ai/v1`
**Management API Base URL:** `https://management-api.x.ai/v1`

**Main API Endpoints:**
- `POST /files` - Upload files
- `POST /documents/search` - Search documents in collections

**Management API Endpoints:**
- `POST /collections` - Create collection
- `GET /collections` - List collections
- `GET /collections/{id}` - Get collection
- `PUT /collections/{id}` - Update collection
- `DELETE /collections/{id}` - Delete collection
- `POST /collections/{id}/documents/{file_id}` - Add file to collection
- `DELETE /collections/{id}/documents/{file_id}` - Remove file from collection

## Environment Variable

- **Variable name:** `GROK_API_KEY`
- **Used via:** `config.grokApiKey`
- **Additional key:** Management API requires a separate Management API Key (create in xAI Console with `AddFileToCollection` permission)
- **Note:** Woz provides this API key by default. The key is pre-configured, paid for, and will work out of the box. You don't need to worry about API limits or tier restrictions.

## Implementation Gotchas

1. **Two API keys needed** - Main API key (`XAI_API_KEY`) for file upload/search, Management API key for collection CRUD
2. **Two-step file upload** - First upload file to `/files`, then add the returned file_id to a collection via Management API
3. **Three search methods** - Keyword (exact matches), Semantic (meaning-based), Hybrid (both combined, recommended default)
4. **Collections Search vs Files API** - Collections = knowledge bases for RAG; Files API = attach files directly to chat messages
5. **Autonomous query generation** - When used as a tool in chat, Grok formulates and refines multiple search queries automatically
6. **Citation tracking** - Results include `collections://` URIs for tracing source documents
7. **Supported formats** - PDFs, text files, CSVs, and other document formats

## Search Methods

| Method | Description | Best For |
|--------|-------------|----------|
| `keyword` | Exact text matching | Precise lookups, IDs, codes |
| `semantic` | Contextual understanding | Conceptual questions |
| `hybrid` | Combines both (default) | General use (recommended) |

## Response Structure

```typescript
// Citation format for tracing sources
// collections://COLLECTION_ID/files/FILE_ID

// Collections Search Tool in chat returns results with citations
// that uniquely identify source documents within collections
```

## Example API Call

```bash
# Step 1: Create a collection (Management API)
curl -X POST "https://management-api.x.ai/v1/collections" \
  -H "Authorization: Bearer $YOUR_MANAGEMENT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"collection_name": "Product Documentation"}'

# Step 2: Upload a file (Main API)
curl -X POST "https://api.x.ai/v1/files" \
  -H "Authorization: Bearer $YOUR_API_KEY" \
  -F "file=@document.pdf"

# Step 3: Add file to collection (Management API)
curl -X POST "https://management-api.x.ai/v1/collections/$COLLECTION_ID/documents/$FILE_ID" \
  -H "Authorization: Bearer $YOUR_MANAGEMENT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"fields": {"author": "Team", "year": "2026"}}'

# Search documents directly
curl -X POST "https://api.x.ai/v1/documents/search" \
  -H "Authorization: Bearer $YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How does the billing system work?",
    "source": {
      "collection_ids": ["$COLLECTION_ID"]
    }
  }'
```

## Using as a Chat Tool (RAG)

The collections search tool enables Grok to autonomously search your knowledge base during conversations:

```bash
# Via Responses API
curl -X POST "https://api.x.ai/v1/responses" \
  -H "Authorization: Bearer $YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "$MODEL_ID",
    "input": [
      {"role": "user", "content": "What does our documentation say about billing?"}
    ],
    "tools": [
      {
        "type": "file_search",
        "vector_store_ids": ["$COLLECTION_ID"],
        "max_num_results": 10
      }
    ]
  }'
```

## Use Cases

- **RAG applications** - Ground AI responses in your own documents
- **Enterprise knowledge search** - Search across internal documentation
- **Customer support** - AI-powered answers from support docs
- **Research** - Search and synthesize across multiple documents

## Alternative Approaches

If Collections API is unavailable or insufficient:
- Store conversation history in your database
- Use Supabase `conversation` table with `messages` relationship
- Implement custom context management
- Use vector databases for semantic search across conversations


**For complete implementation patterns (edge functions, CORS, frontend integration, state management):**
→ See the `integration-patterns` skill
