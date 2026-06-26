import type { Context } from 'hono';

import { getActiveSseClientCount } from '../lib/sse-clients.js';
import {
  applyScenario,
  getScenarioState,
  SCENARIO_OPTIONS,
  triggerDropAllConnections,
  type ScenarioName,
} from '../lib/scenarios.js';

const SCENARIO_NAMES = new Set<ScenarioName>(SCENARIO_OPTIONS.map((option) => option.name));

function renderPanelHtml(baseUrl: string, port: number): string {
  const state = getScenarioState();
  const buttons = SCENARIO_OPTIONS.map(
    (option) => `
      <form method="post" action="/mock/scenarios/${option.name}" class="scenario-form">
        <button type="submit"${state.name === option.name ? ' class="active"' : ''}>
          ${option.label}
        </button>
        <p>${option.description}</p>
      </form>
    `,
  ).join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>WikiNow Mock Server</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 720px; line-height: 1.5; color: #111; }
      h1 { margin-bottom: 0.25rem; }
      .meta { color: #555; margin-bottom: 1.5rem; }
      .scenario-form { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; }
      .scenario-form button { font: inherit; padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid #ccc; background: #f7f7f7; cursor: pointer; }
      .scenario-form button.active { background: #2563eb; color: white; border-color: #2563eb; }
      .scenario-form p { margin: 0.5rem 0 0; color: #444; }
      code, pre { background: #f5f5f5; border-radius: 6px; }
      code { padding: 0.1rem 0.35rem; }
      pre { padding: 1rem; overflow-x: auto; }
      .actions { display: flex; gap: 0.75rem; margin: 1rem 0 2rem; }
      .actions form { margin: 0; }
    </style>
  </head>
  <body>
    <h1>WikiNow Mock Server</h1>
    <p class="meta">
      Active scenario: <strong>${state.label}</strong><br />
      SSE clients connected: <strong>${getActiveSseClientCount()}</strong><br />
      Base URL: <code>${baseUrl}</code> (port ${port})
    </p>

    <div class="actions">
      <form method="post" action="/mock/scenarios/reset">
        <button type="submit">Reset to normal</button>
      </form>
      <form method="post" action="/mock/drop-all">
        <button type="submit">Drop all SSE connections</button>
      </form>
    </div>

    <h2>Scenarios</h2>
    ${buttons}

    <h2>Connect the app</h2>
    <p>Set these in <code>v1/mobile-app/.env</code> and restart Expo:</p>
    <pre>EXPO_PUBLIC_API_BASE_URL=${baseUrl}
EXPO_PUBLIC_STREAM_BASE_URL=${baseUrl}</pre>
    <ul>
      <li>iOS simulator: <code>localhost</code> works.</li>
      <li>Android emulator: use <code>http://10.0.2.2:${port}</code>.</li>
      <li>Physical device: use your machine LAN IP, e.g. <code>http://192.168.x.x:${port}</code>.</li>
    </ul>
  </body>
</html>`;
}

export function handleMockPanel(c: Context, baseUrl: string, port: number) {
  return c.html(renderPanelHtml(baseUrl, port));
}

export function handleMockStatus(c: Context, baseUrl: string, port: number) {
  return c.json({
    baseUrl,
    port,
    activeSseClients: getActiveSseClientCount(),
    scenario: getScenarioState(),
  });
}

export function handleScenarioAction(c: Context) {
  const name = c.req.param('name');

  if (name === 'reset') {
    applyScenario('normal');
    return c.redirect('/mock');
  }

  if (!SCENARIO_NAMES.has(name as ScenarioName)) {
    return c.text('Unknown scenario', 404);
  }

  applyScenario(name as ScenarioName);
  return c.redirect('/mock');
}

export function handleDropAll(c: Context) {
  triggerDropAllConnections();
  return c.redirect('/mock');
}
