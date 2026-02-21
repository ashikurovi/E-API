declare module '@vercel/node' {
  import { IncomingMessage, ServerResponse } from 'http';

  export interface VercelRequest extends IncomingMessage {
    query?: Record<string, string | string[]>;
    body?: unknown;
    cookies?: Record<string, string>;
    method?: string;
    url?: string;
  }

  export interface VercelResponse extends ServerResponse {
    status(code: number): this;
    send(body?: unknown): this;
    json(body?: unknown): this;
    end(cb?: () => void): this;
    setHeader(name: string, value: string | number | string[]): this;
  }
}
