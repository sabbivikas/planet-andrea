/**
 * Checks if the project name follows the patter "project-[uuid]", e.g. project-396ac13a-0dd5-4f2d-b932-1a1fa92b083f
 * Used to filter project names that haven't been customized by the user and still use the default generated name format.
 */
export function isDefaultProjectName(projectName: string): boolean {
  const projectUuidRegex = /^project-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return projectUuidRegex.test(projectName);
}

export function generateRandomBase64Uuid(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bytesToBase64(bytes);
}

// Create a compact representation of a uuid using base64 (URL-safe, no padding):
// This gives you a 22-character URL-safe string with no padding.
export function uuidToBase64(uuid: string): string {
  const hex = uuid.replace(/-/g, '');
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytesToBase64(bytes);
}

function bytesToBase64(bytes: Uint8Array<ArrayBuffer>): string {
  // Build a binary string from the raw bytes
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  const base64 = btoa(binary);

  // turn regular base64 to url-safe base64
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Convert url-safe base64
export function base64ToUuid(base64UuidUrlSafe: string): string {
  // turn url-safe base64 to regular base64
  const base64 = base64UuidUrlSafe
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(base64UuidUrlSafe.length / 4) * 4, '=');

  const binary = atob(base64);
  const hex = Array.from(binary, (ch) => ch.charCodeAt(0).toString(16).padStart(2, '0')).join('');
  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20, 32),
  ].join('-');
}
