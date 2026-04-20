import { type SSE, type SseStream } from '../../_shared-client/api-client/api-schema-types.ts';
import { type ApiProgressHandler } from '../ApiProgressHandler.ts';

export const SSE_DATA_DONE = '[DONE]';

/**
 * Create an SSE message from typed data.
 */
export function makeEventStreamMessage<T>(sse: SSE<T>): Uint8Array;
export function makeEventStreamMessage<T>(data: T, eventName?: string): Uint8Array;
export function makeEventStreamMessage<T>(dataOrSse: T | SSE<T>, eventName?: string): Uint8Array {
  let data: T;
  let event: string | undefined = eventName;

  // Check if dataOrSse is an SSE object (has 'data' property and optionally 'event')
  if (
    typeof dataOrSse === 'object' &&
    dataOrSse !== null &&
    'data' in dataOrSse &&
    (Object.keys(dataOrSse).length === 1 || (Object.keys(dataOrSse).length === 2 && 'event' in dataOrSse))
  ) {
    const sse = dataOrSse;
    data = sse.data;
    event = sse.event ?? eventName;
  } else {
    data = dataOrSse as T;
  }

  const chunkText = typeof data === 'string' ? data : JSON.stringify(data);
  // https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format
  const text = `${event ? `event: ${event}\n` : ''}data: ${chunkText}\n\n`;
  return new TextEncoder().encode(text);
}

/**
 * Type-safe SSE stream controller wrapper.
 */
export type SSEStreamController<T> = {
  /** Enqueue a typed SSE message */
  enqueue: (sse: SSE<T>) => void;
  /** Enqueue raw data with optional event name */
  enqueueData: (data: T, eventName?: string) => void;
  /** Send the done signal */
  done: () => void;
  /** Access the underlying controller */
  readonly controller: ReadableStreamDefaultController<Uint8Array>;
};

/**
 * Create a typed SSE stream controller wrapper.
 */
export function createSSEController<T>(
  controller: ReadableStreamDefaultController<Uint8Array>,
): SSEStreamController<T> {
  return {
    enqueue: (sse: SSE<T>) => {
      controller.enqueue(makeEventStreamMessage(sse));
    },
    enqueueData: (data: T, eventName?: string) => {
      controller.enqueue(makeEventStreamMessage(data, eventName));
    },
    done: () => {
      controller.enqueue(makeEventStreamMessage(SSE_DATA_DONE));
    },
    controller,
  };
}

export async function sendResultOrEventStream<T, TStreamItem = unknown>(
  process: (progress?: ApiProgressHandler, eventStream?: SSEStreamController<TStreamItem>) => Promise<T>,
  useOutputStream: boolean,
  abortController?: AbortController,
): Promise<SseStream<TStreamItem> | T> {
  if (useOutputStream) {
    return new Promise((resolve, reject) => {
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const sseController = createSSEController<TStreamItem>(controller);
            const progressHandler: ApiProgressHandler = {
              // we want to wait with returning a stream until the api server has responded
              // this way, if there was an error, we won't initiate the stream
              onRequestInitiated: (promise) => {
                promise
                  .then(() => {
                    // Resolve once the Api server has responded
                    // Cast to SSEStream since we know this stream outputs SSE<TStreamItem>
                    resolve(stream as SseStream<TStreamItem>);
                  })
                  .catch(() => {
                    //console.log(e);
                  });
              },
            };
            const _res = await process(progressHandler, sseController);
            // only close the output stream once we are done with the processing
            controller.close();
            console.log('out-stream processing done');
          } catch (e) {
            console.error(`out-stream processing error: ${e instanceof Error ? e.message : e}`);
            abortController?.abort(e);
            controller.close(); // use close as error would leave the client connection open until timeout
            // rethrow the error so the client will be told about it
            reject(e instanceof Error ? e : new Error(String(e)));
          }
        },
        cancel() {
          abortController?.abort();
          console.log('out-stream processing cancelled');
        },
      });
    });
  } else {
    const res = await process();
    console.log('non-stream processing done');
    return res;
  }
}

/**
 * Create an NDJSON (newline-delimited JSON) message from typed data.
 */
export function makeNdjsonMessage<T>(data: T): Uint8Array {
  const text = JSON.stringify(data) + '\n';
  return new TextEncoder().encode(text);
}

/**
 * Type-safe NDJSON stream controller wrapper.
 */
export type NdjsonStreamController<T> = {
  /** Enqueue a typed NDJSON line */
  enqueue: (data: T) => void;
  /** Access the underlying controller */
  readonly controller: ReadableStreamDefaultController<Uint8Array>;
};

/**
 * Create a typed NDJSON stream controller wrapper.
 */
export function createNdjsonController<T>(
  controller: ReadableStreamDefaultController<Uint8Array>,
): NdjsonStreamController<T> {
  return {
    enqueue: (data: T) => {
      controller.enqueue(makeNdjsonMessage(data));
    },
    controller,
  };
}

/**
 * Generic stream controller for binary or custom formats.
 */
export type GenericStreamController = {
  /** Enqueue raw bytes */
  enqueue: (data: Uint8Array) => void;
  /** Enqueue string data (will be encoded as UTF-8) */
  enqueueText: (text: string) => void;
  /** Access the underlying controller */
  readonly controller: ReadableStreamDefaultController<Uint8Array>;
};

/**
 * Create a generic stream controller wrapper.
 */
export function createGenericController(
  controller: ReadableStreamDefaultController<Uint8Array>,
): GenericStreamController {
  const encoder = new TextEncoder();
  return {
    enqueue: (data: Uint8Array) => {
      controller.enqueue(data);
    },
    enqueueText: (text: string) => {
      controller.enqueue(encoder.encode(text));
    },
    controller,
  };
}
