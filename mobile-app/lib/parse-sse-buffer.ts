/**
 * Parse incremental SSE text chunks into JSON payloads from `data:` lines.
 * Keeps an incomplete trailing line in `pending.buffer`.
 */
export function extractSseDataPayloads(
  chunk: string,
  pending: { buffer: string },
): string[] {
  pending.buffer += chunk;
  const lines = pending.buffer.split('\n');
  pending.buffer = lines.pop() ?? '';

  const payloads: string[] = [];

  for (const line of lines) {
    if (!line.startsWith('data: ')) {
      continue;
    }

    const payload = line.slice(6).trim();
    if (payload) {
      payloads.push(payload);
    }
  }

  return payloads;
}
