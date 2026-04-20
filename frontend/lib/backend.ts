const isServerRuntime = !('window' in globalThis);

const backendServerBase =
  process.env.BACKEND_API_URL ||
  process.env.INTERNAL_BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://127.0.0.1:4000';

const backendClientBase = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export function getBackendApiBase() {
  return isServerRuntime ? backendServerBase : backendClientBase;
}