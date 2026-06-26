import { formatSseData, formatSseKeepalive } from '../src/lib/sse-format.js';

describe('sse-format', () => {
  it('formats JSON payloads as SSE data lines', () => {
    expect(formatSseData({ id: 1 })).toBe('data: {"id":1}\n\n');
  });

  it('formats keepalive comments', () => {
    expect(formatSseKeepalive()).toBe(': keepalive\n\n');
  });
});
