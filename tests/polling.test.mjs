import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../assets/app.js", import.meta.url), "utf8");
const flush = async () => { for (let index = 0; index < 8; index += 1) await Promise.resolve(); };

function dashboard(hostname = "localhost") {
  const elements = new Map();
  const get = (id) => {
    if (!elements.has(id)) elements.set(id, { dataset: {}, textContent: "", hidden: true });
    return elements.get(id);
  };
  const requests = [];
  const timers = new Map();
  let nextTimer = 0;
  let interval;
  const context = {
    AbortController,
    fetch(url, options) {
      return new Promise((resolve, reject) => {
        requests.push({ url, options, resolve, reject });
        options.signal?.addEventListener("abort", () => reject(new Error("request aborted")), { once: true });
      });
    },
    window: {
      location: { hostname },
      setInterval(callback) { interval = callback; },
      setTimeout(callback, delay) { const id = ++nextTimer; timers.set(id, { callback, delay }); return id; },
      clearTimeout(id) { timers.delete(id); },
    },
    document: {
      documentElement: { dataset: { theme: "light" } },
      getElementById: get,
      querySelectorAll: () => [],
    },
  };
  vm.runInNewContext(source, context);
  return { get, requests, timers, tick: () => interval() };
}

test("a slow read-only request does not start overlapping polls", async () => {
  const ui = dashboard();
  await flush();
  assert.equal(ui.requests.length, 1);
  ui.tick();
  ui.tick();
  await flush();
  assert.equal(ui.requests.length, 1, "polls wait for the current request to finish");
  ui.requests[0].resolve({ ok: false, status: 503 });
  await flush();
  assert.equal(ui.get("connection-state").dataset.state, "offline");
  assert.equal(ui.timers.size, 0, "completed requests release their timeout");
  ui.tick();
  await flush();
  assert.equal(ui.requests.length, 2, "a failed request does not stop future polling");
});

test("a stalled local feed times out and releases the polling lock", async () => {
  const ui = dashboard();
  await flush();
  const timer = [...ui.timers.values()][0];
  assert.ok(timer, "each poll has a bounded request timeout");
  assert.equal(timer.delay, 10000);
  timer.callback();
  await flush();
  assert.equal(ui.requests[0].options.signal.aborted, true);
  assert.equal(ui.get("connection-state").dataset.state, "offline");
  assert.equal(ui.get("stale-banner").hidden, false);
  ui.tick();
  await flush();
  assert.equal(ui.requests.length, 2);
});

test("endpoint discovery and its telemetry fetch share one bounded poll", async () => {
  const ui = dashboard("jehlp.net");
  await flush();
  assert.match(ui.requests[0].url, /^https:\/\/api\.github\.com\/gists\//);
  const firstSignal = ui.requests[0].options.signal;
  ui.tick();
  await flush();
  assert.equal(ui.requests.length, 1);
  ui.requests[0].resolve({
    ok: true,
    json: async () => ({ files: { "ngu-dashboard-endpoint.json": { content: JSON.stringify({ apiBase: "https://fixture-feed.trycloudflare.com" }) } } }),
  });
  await flush();
  assert.equal(ui.requests.length, 2);
  assert.equal(ui.requests[1].url, "https://fixture-feed.trycloudflare.com/api/state");
  assert.ok(firstSignal, "discovery has a cancellation signal");
  assert.equal(ui.requests[1].options.signal, firstSignal);
  ui.tick();
  await flush();
  assert.equal(ui.requests.length, 2, "the discovery-to-feed handoff keeps the lock");
});
