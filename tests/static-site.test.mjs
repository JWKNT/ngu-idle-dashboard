/*
FILE PURPOSE

These dependency-free Node tests protect the dashboard's information architecture and read-only
contract. They verify the first-view metrics, adjacent priorities/current-route view, complete
resource maps, active growth, Adventure journal, inventory/equipped-gear glances, comprehensive
game-state sections, public endpoint discovery, DOM target
completeness, and absence of mutation methods.
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
  assert.match(index, /id="metric-challenge"/);
  assert.match(index, /id="metric-boss"/);
  assert.match(index, /id="metric-boss-record"/);
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

test("dashboard exposes the player overview and complete progression reference", () => {
  for (const id of ["priorities", "now", "resources", "growth", "activity", "alerts", "combat", "character", "inventory", "permanent", "unlocks", "events"]) {
    assert.match(index, new RegExp(`id="${id}"`));
  }
  for (const body of ["gear-body", "inventory-body", "item-list-body", "perks-body", "exp-purchases-body", "ap-purchases-body", "ngu-body", "hacks-body", "wishes-body", "fruit-body", "digger-beard-body"]) {
    assert.match(index, new RegExp(`id="${body}"`));
  }
  assert.match(index, /Not yet unlocked/);
  assert.match(app, /renderUnlocks/);
  assert.match(app, /mechanicUnlocks/);
  assert.match(app, /rebirthNumberNonRegression/);
  assert.match(app, /function renderPriorities/);
  assert.match(app, /function renderAllocationList/);
  assert.match(app, /function renderGrowth/);
  assert.match(app, /function renderActivity/);
  assert.match(app, /resourceAllocationSummary/);
  assert.match(app, /envelope\.adventureLog/);
  assert.match(index, /id="gear-glance-list"/);
  assert.match(app, /Array\.isArray\(s\.equippedGear\)/);
});

test("current strategy stays explicit without the redundant next-actions section", () => {
  for (const id of ["rebirth-policy", "challenge-admission"]) {
    assert.match(index, new RegExp(`id="${id}"`));
  }
  assert.doesNotMatch(index, /What can happen next/);
  assert.doesNotMatch(index, /id="execution"/);
  assert.doesNotMatch(app, /function renderExecution/);
  assert.match(app, /Quarantined/);
});

test("large reference tables use text nodes and local filtering", () => {
  assert.match(app, /document\.createElement\("td"\)/);
  assert.match(app, /data-filter-target/);
  assert.doesNotMatch(app, /insertAdjacentHTML|document\.write/);
});

test("every JavaScript DOM binding resolves to an element in the dashboard shell", () => {
  const declared = new Set([...index.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const referenced = new Set([
    ...app.matchAll(/\b(?:byId|setText)\("([^"]+)"/g),
  ].map((match) => match[1]));
  const missing = [...referenced].filter((id) => !declared.has(id)).sort();
  assert.deepEqual(missing, [], `unbound dashboard element IDs: ${missing.join(", ")}`);
});

test("telemetry rendering preserves unavailable values and allocation proof fields", () => {
  assert.match(app, /optionalNumber/);
  assert.match(app, /nativeBindingsComplete/);
  assert.match(app, /resourceAllocationSummary/);
  assert.match(app, /summary\.groups/);
  assert.doesNotMatch(app, /nativeBindingFailureCount\s*\|\|\s*0/);
});
