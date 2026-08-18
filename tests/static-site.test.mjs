/*
FILE PURPOSE

These dependency-free Node tests protect the dashboard's information architecture, deployment,
and read-only contract. They verify the first-view metrics, comprehensive game-state sections,
locked-system presentation, public endpoint discovery, and absence of mutation methods.
*/

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
const app = await readFile(new URL("../assets/app.js", import.meta.url), "utf8");
const styles = await readFile(new URL("../assets/styles.css", import.meta.url), "utf8");

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

test("dashboard exposes the complete progression reference beneath the first view", () => {
  for (const id of ["now", "resources", "combat", "character", "inventory", "permanent", "unlocks", "events"]) {
    assert.match(index, new RegExp(`id="${id}"`));
  }
  for (const body of ["gear-body", "inventory-body", "item-list-body", "perks-body", "exp-purchases-body", "ap-purchases-body", "ngu-body", "hacks-body", "wishes-body", "fruit-body", "digger-beard-body"]) {
    assert.match(index, new RegExp(`id="${body}"`));
  }
  assert.match(index, /Not yet unlocked/);
  assert.match(app, /renderUnlocks/);
  assert.match(app, /mechanicUnlocks/);
  assert.match(app, /rebirthNumberNonRegression/);
});

test("current strategy is explicit and soft semantic surfaces remain theme-safe", () => {
  for (const id of ["strategy-loadout-title", "strategy-resource-title", "strategy-route-title", "strategy-spend-title"]) {
    assert.match(index, new RegExp(`id="${id}"`));
  }
  assert.match(app, /function renderStrategy/);
  assert.match(app, /strict Number \+ catch-up XP/);
  assert.match(styles, /--soft-blue:/);
  assert.match(styles, /--soft-green:/);
  assert.match(styles, /background: var\(--paper\)/);
  assert.doesNotMatch(styles, /var\(--background|var\(--bg\)/);
});

test("large reference tables use text nodes and local filtering", () => {
  assert.match(app, /document\.createElement\("td"\)/);
  assert.match(app, /data-filter-target/);
  assert.doesNotMatch(app, /insertAdjacentHTML|document\.write/);
});
