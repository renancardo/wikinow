export type SseClient = {
  id: string;
  write: (chunk: string) => void;
  close: () => void;
};

const clients = new Map<string, SseClient>();

export function registerSseClient(client: SseClient): void {
  clients.set(client.id, client);
}

export function unregisterSseClient(id: string): void {
  clients.delete(id);
}

export function getActiveSseClientCount(): number {
  return clients.size;
}

export function broadcastToSseClients(chunk: string): void {
  for (const client of clients.values()) {
    client.write(chunk);
  }
}

export function closeAllSseClients(): void {
  for (const client of clients.values()) {
    client.close();
  }
}

export function forEachSseClient(callback: (client: SseClient) => void): void {
  for (const client of clients.values()) {
    callback(client);
  }
}
