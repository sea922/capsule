import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const KINDS = ['clones', 'views'];

// GitHub keeps only 14 days of traffic, so each run folds the window into the
// stored history; a day inside the window replaces its older, partial count.
export function mergeTraffic(store, kind, response) {
  const days = response?.[kind];
  if (!Array.isArray(days)) throw new Error(`traffic response has no ${kind} list`);
  const merged = { ...(store[kind] ?? {}) };
  for (const { timestamp, count, uniques } of days) merged[timestamp.slice(0, 10)] = { count, uniques };
  return { ...store, [kind]: merged };
}

export function total(store, kind) {
  return Object.values(store[kind] ?? {}).reduce((sum, day) => sum + day.count, 0);
}

export function compact(count) {
  for (const [size, suffix] of [[1e6, 'M'], [1e3, 'k']]) {
    if (count >= size) return `${Number((count / size).toFixed(1))}${suffix}`;
  }
  return String(count);
}

export function badge(label, count, color) {
  return { schemaVersion: 1, label, message: compact(count), color };
}

async function fetchTraffic(repository, kind, token) {
  const response = await fetch(`https://api.github.com/repos/${repository}/traffic/${kind}`, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28' },
  });
  if (!response.ok) throw new Error(`GitHub traffic ${kind} request failed: ${response.status}`);
  return response.json();
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const directory = resolve(process.argv[2] ?? '.');
  const { GITHUB_REPOSITORY: repository, TRAFFIC_TOKEN: token } = process.env;
  if (!repository || !token) throw new Error('Set GITHUB_REPOSITORY and TRAFFIC_TOKEN');
  const storePath = join(directory, 'traffic.json');
  let store = existsSync(storePath) ? JSON.parse(readFileSync(storePath, 'utf8')) : {};
  for (const kind of KINDS) store = mergeTraffic(store, kind, await fetchTraffic(repository, kind, token));
  mkdirSync(directory, { recursive: true });
  writeFileSync(storePath, JSON.stringify(store, null, 2) + '\n');
  writeFileSync(join(directory, 'clones.json'), JSON.stringify(badge('clones', total(store, 'clones'), 'blue')) + '\n');
  writeFileSync(join(directory, 'views.json'), JSON.stringify(badge('views', total(store, 'views'), 'green')) + '\n');
  console.log(`clones ${total(store, 'clones')}, views ${total(store, 'views')}`);
}
