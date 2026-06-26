import type { Context } from 'hono';

import { FIXTURE_CATALOG } from '../fixtures/catalog.js';
import { filterEntries } from '../lib/filters.js';
import { decodeCursor, paginateEntries, withDuplicateBoundary } from '../lib/pagination.js';
import { consumeRestError, getScenarioState } from '../lib/scenarios.js';
import type { RecentChangesQuery, WikiRecentChangesResponse } from '../types.js';

function parseRecentChangesQuery(c: Context): RecentChangesQuery | null {
  const action = c.req.query('action');
  const list = c.req.query('list');

  if (action !== 'query' || list !== 'recentchanges') {
    return null;
  }

  const rclimit = Number(c.req.query('rclimit') ?? '10');
  const rcnamespaceRaw = c.req.query('rcnamespace');
  const rctypeRaw = c.req.query('rctype');

  return {
    rclimit: Number.isFinite(rclimit) && rclimit > 0 ? rclimit : 10,
    rcnamespace: rcnamespaceRaw !== undefined ? Number(rcnamespaceRaw) : undefined,
    rctype: rctypeRaw as RecentChangesQuery['rctype'],
    rccontinue: c.req.query('rccontinue'),
  };
}

export function handleRecentChanges(c: Context, baseUrl: string) {
  const query = parseRecentChangesQuery(c);

  if (!query) {
    return c.json(
      {
        error: {
          code: 'badrequest',
          info: 'Only action=query&list=recentchanges is supported.',
        },
      } satisfies WikiRecentChangesResponse,
      400,
    );
  }

  if (consumeRestError()) {
    return c.json(
      {
        error: {
          code: 'mockserver',
          info: 'Simulated server error from mock scenario.',
        },
      } satisfies WikiRecentChangesResponse,
      500,
    );
  }

  const scenario = getScenarioState();

  if (scenario.restEmpty) {
    return c.json({
      batchcomplete: true,
      query: { recentchanges: [] },
    } satisfies WikiRecentChangesResponse);
  }

  const filtered = filterEntries(FIXTURE_CATALOG, {
    rcnamespace: query.rcnamespace,
    rctype: query.rctype,
  });

  const { page, nextCursor } = paginateEntries(filtered, query.rclimit, query.rccontinue);
  let recentchanges =
    scenario.restDuplicateBoundary && !query.rccontinue
      ? withDuplicateBoundary(filtered, query.rclimit)
      : page;

  if (scenario.restDuplicateBoundary && query.rccontinue) {
    const decoded = decodeCursor(query.rccontinue);
    const overlap = decoded
      ? filtered.find((entry) => entry.rcid === decoded.rcid)
      : undefined;

    if (overlap) {
      recentchanges = [overlap, ...page];
    }
  }

  const response: WikiRecentChangesResponse = {
    batchcomplete: !nextCursor,
    query: { recentchanges },
  };

  if (nextCursor && !scenario.restDuplicateBoundary) {
    response.continue = {
      rccontinue: nextCursor,
      continue: '-||',
    };
  }

  void baseUrl;
  return c.json(response);
}
