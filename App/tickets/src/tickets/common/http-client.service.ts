import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class HttpClientService {
  private readonly logger = new Logger(HttpClientService.name);

  async get<T>(url: string, token?: string): Promise<T> {
    const response = await fetch(url, {
      headers: this.buildHeaders(token),
    });

    if (!response.ok) {
      this.logger.error(`GET ${url} failed: ${response.status} ${response.statusText}`);
      throw new Error(`Error fetching ${url}: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async post<T>(url: string, body: unknown, token?: string): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(token),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`POST ${url} failed: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async patch<T>(url: string, body: unknown, token?: string): Promise<T> {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(token),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`PATCH ${url} failed: ${response.statusText}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  private buildHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      // Validamos si ya trae "Bearer ", si no, se lo concatenamos
      headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    return headers;
  }
}