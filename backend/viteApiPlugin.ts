import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ServerResponse } from 'node:http';
import type { Connect, Plugin, ViteDevServer } from 'vite';

const API_HANDLERS = {
  dashboard: true,
  properties: true,
  payments: true,
} as const;

type ApiHandler = (
  request: VercelRequest,
  response: VercelResponse
) => Promise<unknown> | unknown;

async function readRequestBody(request: Connect.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > 1_048_576) {
      throw new Error('Request body exceeds the 1 MB development limit.');
    }
    chunks.push(buffer);
  }

  if (size === 0) return undefined;
  const rawBody = Buffer.concat(chunks).toString('utf8');
  if (!request.headers['content-type']?.includes('application/json')) {
    return rawBody;
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    throw new Error('Request body contains invalid JSON.');
  }
}

function getApiHandler(
  server: ViteDevServer,
  route: string
): Promise<{ default: ApiHandler }> | null {
  if (!(route in API_HANDLERS)) return null;
  return server.ssrLoadModule(`/api/${route}.ts`) as Promise<{ default: ApiHandler }>;
}

function createVercelResponse(response: ServerResponse): VercelResponse {
  const adaptedResponse = Object.assign(response, {
    status(statusCode: number) {
      response.statusCode = statusCode;
      return adaptedResponse;
    },
    json(body: unknown) {
      response.setHeader('Content-Type', 'application/json; charset=utf-8');
      response.end(JSON.stringify(body));
      return adaptedResponse;
    },
  });

  return adaptedResponse as VercelResponse;
}

export function viteApiPlugin(): Plugin {
  return {
    name: 'estate-analytics-api',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const requestUrl = new URL(request.url ?? '/', 'http://localhost');
        if (!requestUrl.pathname.startsWith('/api/')) {
          next();
          return;
        }

        void (async () => {
          const route = requestUrl.pathname.slice('/api/'.length).replace(/\/+$/, '');
          const loadHandler = getApiHandler(server, route);
          if (!loadHandler) {
            response.statusCode = 404;
            response.setHeader('Content-Type', 'application/json; charset=utf-8');
            response.end(JSON.stringify({ error: 'API route not found.' }));
            return;
          }

          let body: unknown;
          try {
            body = await readRequestBody(request);
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Invalid request body.';
            response.statusCode = message.includes('1 MB') ? 413 : 400;
            response.setHeader('Content-Type', 'application/json; charset=utf-8');
            response.end(JSON.stringify({ error: message }));
            return;
          }

          const query: Record<string, string | string[]> = {};
          for (const [key, value] of requestUrl.searchParams) {
            const existing = query[key];
            query[key] = existing === undefined
              ? value
              : Array.isArray(existing)
                ? [...existing, value]
                : [existing, value];
          }

          const apiRequest = Object.assign(
            Object.create(request) as Connect.IncomingMessage,
            { query, body }
          ) as VercelRequest;

          try {
            const { default: handler } = await loadHandler;
            await handler(apiRequest, createVercelResponse(response));
          } catch (error) {
            console.error(`Local API route failed (${requestUrl.pathname}):`, error);
            if (!response.headersSent) {
              response.statusCode = 500;
              response.setHeader('Content-Type', 'application/json; charset=utf-8');
              response.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
          }
        })();
      });
    },
  };
}
