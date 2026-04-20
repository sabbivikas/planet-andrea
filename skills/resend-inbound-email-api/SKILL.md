---
name: resend-inbound-email-api
description: Use this skill when the user wants to receive and process inbound emails using Resend. Provides integration guidance for email receiving via webhooks, parsing content and attachments, and forwarding.
---
# Resend Inbound Email API Integration

**⚠️ REQUIRED: Read [integration-patterns.md](references/integration-patterns.md) for implementation patterns before proceeding.**


Receive and process inbound emails via webhooks using Resend's receiving API.

## Quick Reference

**API Documentation:** Use Context7 API to retrieve current docs (see integration-patterns skill)
**Base URL:** `https://api.resend.com`

**Main Endpoints:**
- `GET /emails/receiving` - List received emails
- `GET /emails/receiving/{id}` - Get received email with full content
- `GET /emails/receiving/{email_id}/attachments` - List attachments
- `GET /emails/receiving/{email_id}/attachments/{id}` - Get attachment with download URL

**Webhook Event:** `email.received` — sent to your endpoint when an email arrives

## Environment Variable

- **Variable name:** `RESEND_API_KEY`
- **Used via:** `config.resendApiKey`
- **Note:** Woz provides this API key by default. The key is pre-configured, paid for, and will work out of the box. You don't need to worry about API limits or tier restrictions.

## Implementation Gotchas

1. **Webhook contains metadata only** - The webhook payload does NOT include email body or attachment content; you must call the API to retrieve them
2. **Two receiving options** - Default `.resend.app` domain (no DNS needed) or custom domain (requires MX record)
3. **MX record priority** - Resend's MX record must have the lowest priority value (highest priority) for the domain
4. **Use a subdomain** - To avoid conflicts with existing email (Gmail, Outlook), add MX record on a subdomain like `inbound.yourdomain.com`
5. **Attachment download URLs expire** - URLs expire after 1 hour; call the API again for a fresh URL
6. **Verify webhooks** - Use Svix headers (`svix-id`, `svix-timestamp`, `svix-signature`) to verify webhook authenticity
7. **Emails stored even if webhook fails** - Resend stores all inbound emails immediately; retrievable via API even if your webhook is down
8. **Webhook retries** - Automatic retries with exponential backoff if your endpoint doesn't return HTTP 200

## Response Structure

```typescript
// Webhook payload (metadata only)
interface InboundWebhookPayload {
  type: 'email.received';
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    attachments: Array<{
      id: string;
      filename: string;
      content_type: string;
      content_disposition: string;
      content_id: string;
    }>;
  };
}

// Full received email (from GET /emails/receiving/{id})
interface ReceivedEmail {
  id: string;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  reply_to: string[];
  subject: string;
  html: string | null;
  text: string | null;
  headers: Record<string, string>;
  message_id: string;
  created_at: string;
  raw: {
    download_url: string;  // Signed URL for raw email file
    expires_at: string;
  };
  attachments: Array<{
    id: string;
    filename: string;
    content_type: string;
  }>;
}

// Attachment (from GET /emails/receiving/{email_id}/attachments/{id})
interface ReceivedAttachment {
  id: string;
  filename: string;
  size: number;  // bytes
  content_type: string;
  content_disposition: string;
  content_id: string;
  download_url: string;  // Signed URL, expires after 1 hour
  expires_at: string;
}
```

## Example API Call

```bash
# List received emails
curl "https://api.resend.com/emails/receiving" \
  -H "Authorization: Bearer $YOUR_API_KEY"

# Get full email content
curl "https://api.resend.com/emails/receiving/$EMAIL_ID" \
  -H "Authorization: Bearer $YOUR_API_KEY"

# List attachments for an email
curl "https://api.resend.com/emails/receiving/$EMAIL_ID/attachments" \
  -H "Authorization: Bearer $YOUR_API_KEY"

# Get attachment download URL
curl "https://api.resend.com/emails/receiving/$EMAIL_ID/attachments/$ATTACHMENT_ID" \
  -H "Authorization: Bearer $YOUR_API_KEY"
```

## Webhook Handler Example

```typescript
// Edge function to handle inbound email webhook
import { serveFunction, okResponse } from '../_shared/server/func-server.ts';
import { config } from '../_shared/config.ts';

serveFunction(false, async (req) => {
  const payload = await req.json();

  // IMPORTANT: Verify webhook signature before processing (see Webhook Verification section below)

  if (payload.type !== 'email.received') {
    return okResponse({ ignored: true });
  }

  const { email_id, from, subject } = payload.data;

  // Fetch full email content
  const emailRes = await fetch(
    `https://api.resend.com/emails/receiving/${email_id}`,
    { headers: { Authorization: `Bearer ${config.resendApiKey}` } }
  );
  const email = await emailRes.json();

  // Process email body
  const body = email.html ?? email.text;
  console.log(`From: ${from}, Subject: ${subject}`);
  console.log(`Body: ${body}`);

  // Process attachments if any
  if (email.attachments?.length > 0) {
    for (const att of email.attachments) {
      const attRes = await fetch(
        `https://api.resend.com/emails/receiving/${email_id}/attachments/${att.id}`,
        { headers: { Authorization: `Bearer ${config.resendApiKey}` } }
      );
      const attachment = await attRes.json();
      // Download file from attachment.download_url
    }
  }

  return okResponse({ processed: true });
});
```

## Webhook Verification

```typescript
import { Resend } from 'resend';

const resend = new Resend(config.resendApiKey);

// Verify webhook signature
const isValid = resend.webhooks.verify({
  payload: JSON.stringify(req.body),
  headers: {
    id: req.headers.get('svix-id'),
    timestamp: req.headers.get('svix-timestamp'),
    signature: req.headers.get('svix-signature'),
  },
  webhookSecret: config.resendWebhookSecret,
});
```

## DNS Setup for Custom Domain

1. Choose a subdomain (e.g., `inbound.yourdomain.com`) to avoid conflicts with existing email
2. Add MX record from Resend dashboard with priority 10
3. Wait for DNS propagation (usually < 1 hour)
4. Test by sending an email to `test@inbound.yourdomain.com`

## Use Cases

- **Customer support** - Receive and route support emails to agents
- **Email parsing** - Extract data from structured emails (invoices, receipts)
- **Reply handling** - Process replies to transactional emails
- **Email-to-app** - Create records from emails (e.g., email-to-task)
- **Forwarding** - Route and transform inbound emails

## Alternative Recommendations

- **SendGrid Inbound Parse** - More mature, higher volume
- **Mailgun Routes** - Flexible routing rules
- **AWS SES** - Cheapest for high volume, more complex

Use Resend Inbound when:
- Already using Resend for outbound email
- Want simple webhook-based receiving
- Need quick setup with default `.resend.app` domain
- Moderate inbound volume


**For complete implementation patterns (edge functions, CORS, webhook handling, error handling):**
→ See the `integration-patterns` skill
