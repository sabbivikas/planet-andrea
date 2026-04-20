import { JwtPayload } from '@supabase/supabase-js';

import { config } from '../config.ts';
import { getJwtFromHeader, makeClient } from '../supabaseClient.ts';
import { corsHeaders } from './cors.ts';

export function isSecretKey(token: string): boolean {
  return token.startsWith('sb_secret_') || token === config.supabase.serviceRoleKey;
}

export function parseURL(
  url: string,
): [string | null | undefined, string | null | undefined, string | null | undefined] {
  // For more details on URLPattern, check https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API
  const taskPattern = new URLPattern({ pathname: '/:function/:action/:id?' });
  const matchingPath = taskPattern.exec(url);
  const func = matchingPath ? matchingPath.pathname.groups.function : null;
  const action = matchingPath ? matchingPath.pathname.groups.action : null;
  const id = matchingPath ? matchingPath.pathname.groups.id : null;

  return [func, action, id];
}

/**
 * Parses the URL and returns the search parameters as an object.
 * @param url The URL to parse.
 * @returns An object containing the search parameters.
 */
export function getSearchParamsFromURL(url: string): Record<string, string | null> {
  const urlObj = new URL(url);
  const params: Record<string, string | null> = {};
  for (const [key, value] of urlObj.searchParams.entries()) {
    params[key] = value;
  }
  return params;
}

// deno-lint-ignore no-explicit-any
export function okResponse(value?: ReadableStream | any): Response {
  return statusResponse(200, value);
}

// deno-lint-ignore no-explicit-any
export function statusResponse(status: number, value?: ReadableStream | any): Response {
  // Return empty response
  if (!value) {
    return new Response(undefined, { headers: corsHeaders, status: status });
  }

  // Return stream response
  if (value instanceof ReadableStream) {
    return statusResponseWithType(status, 'text/event-stream', value);
  }

  // Return JSON response
  return statusResponseWithType(status, 'application/json', JSON.stringify(value));
}

/**
 * Returns a response with the specified status and content type.
 * @param status The HTTP status code.
 * @param contentType The content type of the response.
 * @param value The response body, optional.
 * @returns A Response object.
 */
export function statusResponseWithType(
  status: number,
  contentType: string,
  value?: ReadableStream | string | null,
): Response {
  // Return empty response
  if (!value) {
    return new Response(undefined, {
      headers: { ...corsHeaders, 'Content-Type': contentType },
      status: status,
    });
  }

  // Return JSON response
  return new Response(value, {
    headers: { ...corsHeaders, 'Content-Type': contentType },
    status: status,
  });
}

export function serveFunction(verifyJwt: boolean, func: (req: Request, claims?: JwtPayload) => Promise<Response>) {
  Deno.serve(async (req: Request) => {
    // This is needed if you're planning to invoke your function from a browser.
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    let claims: JwtPayload | undefined = undefined;
    if (verifyJwt) {
      const token = getJwtFromHeader(req.headers);
      if (!token) return new Response('Unauthorized', { status: 401 });

      // TODO: Add secret key validation (no easy solution found with supabase)
      if (!isSecretKey(token)) {
        const supabaseClient = makeClient(req.headers);
        const res = await supabaseClient.auth.getClaims(token);
        if (res.data?.claims) {
          claims = res.data.claims;
        }
        if (res.error) return new Response('Unauthorized', { status: 401 });
      }
    }

    try {
      console.log(`function start: ${req.url}`);
      const res = await func(req, claims);
      if (res.body instanceof ReadableStream) {
        console.log(`function streaming response: ${req.url}`);
      } else {
        console.log(`function done: ${req.url}`);
      }
      return res;
    } catch (error: unknown) {
      console.error(error);
      return statusResponse(400, { error: error instanceof Error ? error.message : error });
    }
  });
}
