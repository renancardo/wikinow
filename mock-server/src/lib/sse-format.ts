export function formatSseData(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

export function formatSseKeepalive(): string {
  return ': keepalive\n\n';
}
