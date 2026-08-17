<!--
FILE PURPOSE

This is the public entrypoint for the standalone NGU Idle Dashboard repository. It explains the
deployment boundary, the relationship to the laptop's read-only autopilot bridge, and why no save
data or game-control code is hosted here.
-->

# NGU Idle Dashboard

A static, read-only dashboard for the NGU Idle Autopilot. The deployed client follows the shared
[jehlp.net site theme](https://jehlp.net/site-theme/) and presents the current rebirth plan, boss
projection, Adventure route, purchase targets, resource allocation, equipment policy, Basic
Training, and key events.

The public site contains no save file, telemetry archive, authentication token, injector, or game
control endpoint. It discovers the laptop's current HTTPS Cloudflare Quick Tunnel from a public
GitHub Gist containing only the tunnel URL. The bridge accepts read-only requests and keeps no
public history; if the laptop sleeps or the game/bridge stops, the dashboard stays online but
reports the feed as offline. Anyone with the public URL can view the live snapshot.

## Deployment

GitHub Pages serves the repository root at
[jehlp.net/ngu-idle-dashboard](https://jehlp.net/ngu-idle-dashboard/).

The dashboard is dependency-free:

- `index.html` owns semantic structure and the first-view progression summary.
- `assets/styles.css` extends the shared jehlp.net design tokens without cards, gradients, or a
  separate visual system.
- `assets/app.js` polls the fixed public read API on jehlp.net and same-origin API in local/private
  deployments, then renders confirmed telemetry.
- `tests/static-site.test.mjs` verifies the read-only boundary and required top-level metrics.

The autopilot repository retains a matching local copy of the static client because its bridge
must serve the dashboard when offline. Bot strategy, injection, and telemetry production do not
belong in this repository. The supervised tunnel and endpoint publisher run on the laptop.
