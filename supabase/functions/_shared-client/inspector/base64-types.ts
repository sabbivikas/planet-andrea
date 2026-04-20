import { z } from 'zod';

const base64DataUrlRegex = /^data:[\w-]+\/[\w-]+;base64,[A-Za-z0-9+/]+=*$/;

export const MimeDataUrlSchema = z.object({
  mimeType: z.string(),
  size: z.number().optional(),
  // data URL format with base64 encoding, prefixed with "data:${mimeType};base64,""
  data: z.string().regex(base64DataUrlRegex, 'Invalid base64 data URL format'),
});

export type MimeDataUrl = z.infer<typeof MimeDataUrlSchema>;

export function convertDataUrlToParts(data: string): { mimeType: string; base64: string } | undefined {
  const matches = /^data:([^;]+);base64,(.+)$/.exec(data);
  if (!matches) {
    return;
  }

  const [, mimeType, base64] = matches;
  return { mimeType, base64 };
}
