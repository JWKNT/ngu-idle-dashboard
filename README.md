<!--
FILE PURPOSE

This is the public entrypoint for the standalone NGU Idle Dashboard repository. It explains the
deployment boundary, the relationship to the local autopilot bridge, and why no live state or
game-control code is hosted here.
-->

# NGU Idle Dashboard

A static, read-only dashboard for the NGU Idle Autopilot. The deployed client follows the shared
[jehlp.net site theme](https://jehlp.net/site-theme/) and presents the current rebirth plan, boss
projection, Adventure route, purchase targets, resource allocation, equipment policy, Basic
Training, and key events.

The public site contains no save file, telemetry archive, authentication token, injector, or game
control endpoint. It attempts to read `http://127.0.0.1:47635/api/state` from the loopback bridge
started by the locally installed autopilot. When browser local-network policy blocks that request,
the page links to the same dashboard served directly by the local bridge.

## Deployment

GitHub Pages serves the repository root at
[jehlp.net/ngu-idle-dashboard](https://jehlp.net/ngu-idle-dashboard/).

The dashboard is dependency-free:

- `index.html` owns semantic structure and the first-view progression summary.
- `assets/styles.css` extends the shared jehlp.net design tokens without cards, gradients, or a
  separate visual system.
- `assets/app.js` polls only the fixed loopback read API and renders confirmed telemetry.
- `tests/static-site.test.mjs` verifies the local-only boundary and required top-level metrics.

The autopilot repository retains a matching local copy of the static client because its bridge
must serve the dashboard when offline. Bot strategy, injection, and telemetry production do not
belong in this repository.
