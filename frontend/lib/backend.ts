const isServerRuntime = !('window' in globalThis);

function normalizeBackendUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Railway often exposes hostnames without protocol in variable references.
  return `https://${trimmed}`;
}

const backendServerBase =
  normalizeBackendUrl(process.env.BACKEND_API_URL) ||
  normalizeBackendUrl(process.env.INTERNAL_BACKEND_URL) ||
  normalizeBackendUrl(process.env.NEXT_PUBLIC_BACKEND_URL) ||
  'http://127.0.0.1:4000';

// Always use same-origin proxy from browser (frontend /api/[...path]) so auth/cart cookies are first-party.
const backendClientBase = '';

export function getBackendApiBase() {
  return isServerRuntime ? backendServerBase : backendClientBase;
}