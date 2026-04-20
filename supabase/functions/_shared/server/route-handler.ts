import { JwtPayload } from '@supabase/supabase-js';
import { z } from 'zod';

import type {
  HttpMethod,
  RouteSchema,
  RoutesDefinition,
  StreamType,
  TypedReadableStream
} from '../../_shared-client/api-client/api-schema-types.ts';
import { streamContentTypes } from '../../_shared-client/api-client/api-schema-types.ts';
import { serveFunction, statusResponse, statusResponseWithType } from './func-server.ts';

/**
 * Typed response wrapper that preserves type safety while allowing custom status/headers.
 */
export type TypedResponse<T> = {
  __typed: true;
  status: number;
  data: T;
  contentType?: string;
  headers?: Record<string, string>;
};

/**
 * Stream response wrapper.
 */
export type StreamResponse = {
  __stream: true;
  stream: ReadableStream<Uint8Array>;
  contentType: string;
  headers?: Record<string, string>;
};

type ResponseOptions = {
  contentType?: string;
  headers?: Record<string, string>;
};

/**
 * Exclude all Stream types from a union type to get non-stream return types.
 */
type NonStreamReturns<T> = Exclude<T, TypedReadableStream<unknown>>;

/**
 * Response helpers with typed data.
 */
export type ResponseHelpers<TReturns> = {
  /** Return 200 OK with typed data (auto-detects streams if schema has streamType) */
  ok: (data: TReturns, options?: ResponseOptions) => TypedResponse<NonStreamReturns<TReturns>> | StreamResponse;
  /** Return 201 Created with typed data */
  created: (data: NonStreamReturns<TReturns>, options?: ResponseOptions) => TypedResponse<NonStreamReturns<TReturns>>;
  /** Return custom status with typed data */
  response: (
    status: number,
    data: NonStreamReturns<TReturns>,
    options?: ResponseOptions,
  ) => TypedResponse<NonStreamReturns<TReturns>>;
  /** Return error response (untyped, for errors) */
  error: (status: number, message: string | Record<string, unknown>) => Response;
};

/**
 * Context passed to route handlers with typed params.
 */
export type RouteContext<T extends RouteSchema> = {
  pathParams: T['pathParams'] extends z.ZodTypeAny ? z.infer<T['pathParams']> : undefined;
  queryParams: T['queryParams'] extends z.ZodTypeAny ? z.infer<T['queryParams']> : undefined;
  headers: T['headers'] extends z.ZodTypeAny ? z.infer<T['headers']> : undefined;
  body: T['body'] extends z.ZodTypeAny ? z.infer<T['body']> : undefined;
  request: Request;
  /** JWT claims if verifyJwt is enabled */
  claims: JwtPayload | undefined;
} & ResponseHelpers<z.infer<T['returns']>>;

/**
 * Handler function type for a route.
 */
export type RouteHandler<T extends RouteSchema> = (
  ctx: RouteContext<T>,
) => Promise<TypedResponse<NonStreamReturns<z.infer<T['returns']>>> | StreamResponse | Response>;

/**
 * Extract stream type from a Zod schema (checks schema and union options)
 */
function getStreamTypeFromSchema(schema: z.ZodTypeAny): StreamType | undefined {
  // Check if schema itself has _streamType
  if ('_streamType' in schema && typeof (schema as any)._streamType === 'string') {
    return (schema as any)._streamType as StreamType;
  }

  // Check if it's a union and one of the options has _streamType
  if (schema._def && 'options' in schema._def) {
    const options = (schema._def as { options: z.ZodTypeAny[] }).options;
    for (const option of options) {
      if ('_streamType' in option && typeof (option as any)._streamType === 'string') {
        return (option as any)._streamType as StreamType;
      }
    }
  }

  return undefined;
}

/**
 * Create response helpers for a handler.
 */
function createResponseHelpers<TReturns>(streamType?: StreamType): ResponseHelpers<TReturns> {
  const streamContentType = streamType ? streamContentTypes[streamType] : undefined;

  return {
    ok: (data: TReturns, options?: ResponseOptions) => {
      // Auto-detect streams
      if (data instanceof ReadableStream) {
        const contentType = options?.contentType ?? streamContentType ?? 'application/octet-stream';
        return {
          __stream: true as const,
          stream: data,
          contentType,
          headers: options?.headers,
        };
      }
      return {
        __typed: true as const,
        status: 200,
        data: data as NonStreamReturns<TReturns>,
        contentType: options?.contentType,
        headers: options?.headers,
      };
    },
    created: (data: NonStreamReturns<TReturns>, options?: ResponseOptions) => ({
      __typed: true as const,
      status: 201,
      data,
      contentType: options?.contentType,
      headers: options?.headers,
    }),
    response: (status: number, data: NonStreamReturns<TReturns>, options?: ResponseOptions) => ({
      __typed: true as const,
      status,
      data,
      contentType: options?.contentType,
      headers: options?.headers,
    }),
    error: (status: number, message: string | Record<string, unknown>) =>
      statusResponse(status, typeof message === 'string' ? { error: message } : message),
  };
}

/**
 * Check if a value is a TypedResponse.
 */
function isTypedResponse(value: unknown): value is TypedResponse<unknown> {
  return typeof value === 'object' && value !== null && '__typed' in value && value.__typed === true;
}

/**
 * Check if a value is a StreamResponse.
 */
function isStreamResponse(value: unknown): value is StreamResponse {
  return typeof value === 'object' && value !== null && '__stream' in value && value.__stream === true;
}

/**
 * Determine how to parse the request body based on the Zod schema type and content-type.
 */
async function parseBodyBySchema(req: Request, schema: z.ZodTypeAny): Promise<unknown> {
  const contentType = req.headers.get('content-type') ?? '';

  // Check content-type first for binary/form data
  if (contentType.includes('application/octet-stream')) {
    return req.arrayBuffer();
  }
  if (contentType.includes('multipart/form-data')) {
    return req.formData();
  }

  // Handle union types - check if it could be a string
  if (schema instanceof z.ZodUnion) {
    const options = (schema.def as unknown as { options: readonly z.ZodTypeAny[] }).options;
    const hasString = options.some((opt) => opt instanceof z.ZodString);
    const hasObjectOrArray = options.some((opt) => opt instanceof z.ZodObject || opt instanceof z.ZodArray);

    // If union includes both, try JSON first, fall back to text
    if (hasString && hasObjectOrArray) {
      const text = await req.text();
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }
    if (hasString) return req.text();
  }

  // Plain string
  if (schema instanceof z.ZodString) {
    return req.text();
  }

  // Default: JSON for objects, arrays, and most other types
  return req.json().catch(() => ({}));
}

/**
 * Internal route registration entry.
 */
type RegisteredRoute = {
  method: HttpMethod | HttpMethod[];
  pathPattern: URLPattern;
  schema: RouteSchema;
  handler: RouteHandler<RouteSchema>;
};

/**
 * Router that handles type-safe route registration and request dispatching.
 */
export class Router<T extends RoutesDefinition> {
  private routes = new Map<keyof T, RegisteredRoute>();
  private schemas: T;

  constructor(schemas: T) {
    this.schemas = schemas;
  }

  /**
   * Register a handler for a specific route.
   */
  handle<K extends keyof T>(actionName: K, handler: RouteHandler<T[K]>): this {
    const schema = this.schemas[actionName];
    const pathPattern = new URLPattern({ pathname: schema.path });

    this.routes.set(actionName, {
      method: schema.method,
      pathPattern,
      schema,
      handler: handler as RouteHandler<RouteSchema>,
    });

    return this;
  }

  /**
   * Match an incoming request to a registered route.
   */
  private matchRoute(req: Request): { route: RegisteredRoute; match: URLPatternResult } | undefined {
    const method = req.method as HttpMethod;

    for (const [, route] of this.routes) {
      const methods = Array.isArray(route.method) ? route.method : [route.method];
      if (!methods.includes(method)) continue;

      const match = route.pathPattern.exec(req.url);
      if (match) {
        return { route, match };
      }
    }

    return undefined;
  }

  /**
   * Parse and validate request data against the schema.
   */
  private async parseRequest(
    req: Request,
    match: URLPatternResult,
    schema: RouteSchema,
    claims: JwtPayload | undefined,
  ): Promise<{ success: true; ctx: RouteContext<RouteSchema> } | { success: false; error: Response }> {
    try {
      // Parse path params
      let pathParams: unknown = undefined;
      if (schema.pathParams) {
        const rawPathParams = match.pathname.groups;
        pathParams = schema.pathParams.parse(rawPathParams);
      }

      // Parse query params
      let queryParams: unknown = undefined;
      if (schema.queryParams) {
        const url = new URL(req.url);
        const rawQueryParams: Record<string, string> = {};
        url.searchParams.forEach((value, key) => {
          rawQueryParams[key] = value;
        });
        queryParams = schema.queryParams.parse(rawQueryParams);
      }

      // Parse headers
      let headers: unknown = undefined;
      if (schema.headers) {
        const rawHeaders: Record<string, string> = {};
        req.headers.forEach((value, key) => {
          rawHeaders[key] = value;
        });
        headers = schema.headers.parse(rawHeaders);
      }

      // Parse body based on schema type
      let body: unknown = undefined;
      if (schema.body) {
        const rawBody = await parseBodyBySchema(req, schema.body);
        body = schema.body.parse(rawBody);
      }

      // Extract stream type from the returns schema
      const streamType = getStreamTypeFromSchema(schema.returns);

      const ctx = {
        pathParams,
        queryParams,
        headers,
        body,
        request: req,
        claims,
        ...createResponseHelpers(streamType),
      } as RouteContext<RouteSchema>;

      return { success: true, ctx };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: statusResponse(400, {
            error: 'Validation error',
            details: error.issues,
          }),
        };
      }
      throw error;
    }
  }

  /**
   * Handle an incoming request.
   */
  async handleRequest(req: Request, claims: JwtPayload | undefined): Promise<Response> {
    const matched = this.matchRoute(req);

    if (!matched) {
      return statusResponse(404, { error: 'Route not found' });
    }

    const { route, match } = matched;

    // Parse and validate request
    const parseResult = await this.parseRequest(req, match, route.schema, claims);
    if (!parseResult.success) {
      return parseResult.error;
    }

    // Call handler
    const result = await route.handler(parseResult.ctx);

    // If handler returned a Response directly, use it as-is
    if (result instanceof Response) {
      return result;
    }

    // Handle StreamResponse
    if (isStreamResponse(result)) {
      return statusResponseWithType(200, result.contentType ?? 'text/event-stream', result.stream);
    }

    // Handle TypedResponse
    if (isTypedResponse(result)) {
      // Validate response data
      if (route.schema.returns) {
        const validated = route.schema.returns.safeParse(result.data);
        if (!validated.success) {
          console.error('Response validation failed:', validated.error);
          return statusResponse(500, { error: 'Internal server error: invalid response' });
        }
      }

      // Build response with custom status/content-type
      if (result.contentType) {
        return statusResponseWithType(result.status, result.contentType, JSON.stringify(result.data));
      }
      return statusResponse(result.status, result.data);
    }

    // Should not reach here with proper typing
    return statusResponse(500, { error: 'Internal server error: invalid handler response' });
  }
}

/**
 * Create a new router from route definitions.
 */
export function createRouter<T extends RoutesDefinition>(schemas: T): Router<T> {
  return new Router(schemas);
}

/**
 * Options for serving a router.
 */
export type ServeRouterOptions = {
  verifyJwt?: boolean;
};

/**
 * Serve a router using the existing serveFunction infrastructure.
 */
export function serveRouter<T extends RoutesDefinition>(router: Router<T>, options: ServeRouterOptions = {}): void {
  const { verifyJwt = true } = options;

  serveFunction(verifyJwt, async (req: Request, claims?: JwtPayload): Promise<Response> => {
    try {
      return await router.handleRequest(req, claims);
    } catch (error) {
      console.error('Router error:', error);
      return statusResponse(500, {
        error: error instanceof Error ? error.message : JSON.stringify(error),
      });
    }
  });
}
