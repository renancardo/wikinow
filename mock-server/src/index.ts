import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import {
  handleDropAll,
  handleMockPanel,
  handleMockStatus,
  handleScenarioAction,
} from './routes/mock-panel.js';
import { handleRecentChanges } from './routes/recent-changes.js';
import { handleRecentChangeStream } from './routes/stream.js';

const port = Number(process.env.PORT ?? 3000);
const baseUrl = (process.env.BASE_URL ?? `http://localhost:${port}`).replace(/\/$/, '');

const app = new Hono();

app.use('*', logger());
app.use('*', cors());

app.get('/health', (c) => c.json({ ok: true, baseUrl }));

app.get('/mock', (c) => handleMockPanel(c, baseUrl, port));
app.get('/mock/status', (c) => handleMockStatus(c, baseUrl, port));
app.post('/mock/scenarios/:name', handleScenarioAction);
app.post('/mock/drop-all', handleDropAll);

app.get('/w/api.php', (c) => handleRecentChanges(c, baseUrl));
app.get('/v2/stream/recentchange', (c) => handleRecentChangeStream(c, baseUrl));

app.get('/wiki/:title', (c) => {
  const title = decodeURIComponent(c.req.param('title'));
  return c.html(`<!doctype html><html><head><title>${title}</title></head><body><h1>${title}</h1><p>Mock wiki page stub.</p></body></html>`);
});

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`WikiNow mock server listening on http://localhost:${info.port}`);
    console.log(`Control panel: http://localhost:${info.port}/mock`);
  },
);
