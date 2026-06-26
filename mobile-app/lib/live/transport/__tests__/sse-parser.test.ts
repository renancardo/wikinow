import { extractSseDataPayloads } from '@/lib/live/transport/sse-parser';

describe('extractSseDataPayloads', () => {
  it('parses complete SSE lines from a chunk', () => {
    const pending = { buffer: '' };
    const payloads = extractSseDataPayloads(
      'event: message\ndata: {"id":1}\n\n',
      pending,
    );

    expect(payloads).toEqual(['{"id":1}']);
    expect(pending.buffer).toBe('');
  });

  it('keeps a partial trailing line across chunks', () => {
    const pending = { buffer: '' };

    const first = extractSseDataPayloads('data: {"id":1}\ndata: {"id":', pending);
    expect(first).toEqual(['{"id":1}']);
    expect(pending.buffer).toBe('data: {"id":');

    const second = extractSseDataPayloads('2}\n', pending);
    expect(second).toEqual(['{"id":2}']);
    expect(pending.buffer).toBe('');
  });

  it('ignores non-data lines', () => {
    const pending = { buffer: '' };
    const payloads = extractSseDataPayloads(':ok\nevent: message\nid: 1\n', pending);

    expect(payloads).toEqual([]);
  });
});
