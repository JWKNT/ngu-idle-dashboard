/*
FILE PURPOSE

These dependency-free Node tests protect the dashboard's deployment and read-only contract. They
verify the requested first-view metrics, shared theme dependency, public endpoint discovery, and
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

test("browser client is read-only and discovers the current public laptop feed", () => {
  assert.match(app, /https:\/\/api\.github\.com\/gists\/574be4aaf834537b70c62e4505f5ea31/);
  assert.match(app, /trycloudflare\\\.com/);
  assert.match(app, /publicFeed = publicDashboardHosts\.has\(window\.location\.hostname\)/);
  assert.match(app, /:\s*"\/api\/state"/);
  assert.doesNotMatch(app, /http:\/\/127\.0\.0\.1:47635\/api\/state/);
  assert.doesNotMatch(app, /method:\s*["'](?:POST|PUT|PATCH|DELETE)/);
  assert.doesNotMatch(app, /localStorage|sessionStorage|indexedDB/);
});
