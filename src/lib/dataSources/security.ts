/**
 * Security controls for external data retrieval:
 * - Domain allowlisting to prevent SSRF against internal hosts / cloud metadata
 * - HTTPS enforcement
 * - Strict timeout guards
 * - Response size capping
 */

const ALLOWED_HOSTS = new Set([
  'api.open-meteo.com',
  'geocoding-api.open-meteo.com',
  'archive-api.open-meteo.com',
  'api.worldbank.org',
  'www.alphavantage.co',
  'query1.finance.yahoo.com',
  'api.coingecko.com',
  'api.weatherapi.com'
]);

export interface SafeFetchOptions extends RequestInit {
  timeoutMs?: number;
  maxSizeBytes?: number;
}

export async function safeFetch(urlStr: string, options: SafeFetchOptions = {}): Promise<Response> {
  const { timeoutMs = 12000, maxSizeBytes = 5 * 1024 * 1024, ...fetchOptions } = options;

  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw new Error(`Invalid URL specified: "${urlStr}"`);
  }

  // 1. Force HTTPS
  if (parsed.protocol !== 'https:') {
    throw new Error(`Security rejection: Only HTTPS destinations are allowed. Received: ${parsed.protocol}`);
  }

  // 2. Reject private/internal IPs, localhost, AWS metadata
  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('172.16.') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.local') ||
    hostname === '169.254.169.254'
  ) {
    throw new Error(`SSRF Guard: Prohibited private host destination: ${hostname}`);
  }

  // 3. Verify against allowed destination hosts
  if (!ALLOWED_HOSTS.has(hostname)) {
    throw new Error(`Destination not in approved connector allowlist: ${hostname}`);
  }

  // 4. Timeout abort controller
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(urlStr, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GenUI-DataEngine/1.0 (+https://genui.ai)',
        ...fetchOptions.headers
      }
    });
    clearTimeout(timer);

    // 5. Response size guard
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > maxSizeBytes) {
      throw new Error(`Response size exceeds security cap of ${maxSizeBytes} bytes.`);
    }

    return response;
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`External data request timed out after ${timeoutMs}ms.`);
    }
    throw err;
  }
}
