/*
FILE PURPOSE

These dependency-free Node tests protect the dashboard's deployment and read-only contract. They
verify the requested first-view metrics, shared theme dependency, fixed public feed endpoint, and
absence of browser-side mutation methods without attempting to simulate live game state.
*/

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
const app = await readFile(new URL("../assets/app.js", import.meta.url), "utf8");

test("dashboard uses the shared site theme and required headline metrics", () => {
  assert.match(index, /https:\/\/jehlp\.net\/site-theme\/v1\/base\.css/);
  assert.match(index, /id="metric-rebirth"/);
  assert.match(index, /id="metric-boss"/);
  assert.match(index, /id="metric-adventure"/);
  assert.match(index, /id="metric-exp"/);
});

test("browser client is read-only and uses the fixed public laptop feed", () => {
  assert.match(app, /https:\/\/ngu-idle-laptop\.tailae7349\.ts\.net\/api\/state/);
  assert.match(app, /publicFeed = publicDashboardHosts\.has\(window\.location\.hostname\)/);
  assert.match(app, /:\s*"\/api\/state"/);
  assert.doesNotMatch(app, /http:\/\/127\.0\.0\.1:47635\/api\/state/);
  assert.doesNotMatch(app, /method:\s*["'](?:POST|PUT|PATCH|DELETE)/);
  assert.doesNotMatch(app, /localStorage|sessionStorage|indexedDB/);
});
