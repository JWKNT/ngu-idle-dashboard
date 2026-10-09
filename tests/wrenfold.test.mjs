import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('dashboard search controls retain their original mono role', () => {
 const css=readFileSync(new URL('../assets/styles.css',import.meta.url),'utf8');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(css,/\.table-search input \{[^}]*font: var\(--text-ui, \.875rem\)\/1\.4 var\(--mono\)/);
 assert.match(html,/assets\/styles\.css\?v=20261009-reading-folio/);
});
