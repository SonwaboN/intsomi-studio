import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { allProjectPanels, orderedPagePanels, unplacedPanels, validateComicPages } from '../dist/comic.mjs';
import { prepareImportedProject, validateProjectBackup } from '../dist/project-validation.mjs';

const projectFixture = () => ({
  id: 'comic-project', title: 'A Creator Story', story: {}, guide: {},
  characters: [], locations: [], assets: [{ id: 'asset-1', name: 'Artwork' }], contentLanguages: ['English', 'isiXhosa'],
  scenes: [{ id: 'scene-1', title: 'River bend', panels: [
    { id: 'panel-1', description: 'A wide view', dialogue: 'Molo, mlambo.', narration: 'Ibali liyaqhubeka.', assetId: 'asset-1', textVersions: [{ id: 'version-1', field: 'dialogue', language: 'isiXhosa', relationship: 'original', sourceText: '', text: 'Molo, mlambo.', status: 'creator-entered' }] },
    { id: 'panel-2', description: 'A close view', dialogue: '', narration: '', assetId: '' }
  ] }]
});

test('comic pages preserve ordered direct panel references and expose unplaced panels', () => {
  const project = projectFixture();
  project.pages = [{ id: 'page-1', title: 'First page', gutter: 12, placements: [
    { panelId: 'panel-2', order: 1, span: 6, crop: 'contain' },
    { panelId: 'panel-1', order: 0, span: 12, crop: 'cover' }
  ] }];
  validateComicPages(project);
  assert.deepEqual(orderedPagePanels(project, project.pages[0]).map(item => item.panel.id), ['panel-1', 'panel-2']);
  assert.deepEqual(unplacedPanels(project), []);
  project.pages[0].placements.pop();
  assert.deepEqual(unplacedPanels(project).map(panel => panel.id), ['panel-1']);
  assert.equal(allProjectPanels(project)[0].sceneTitle, 'River bend');
});

test('comic backup validation accepts older projects and rejects broken or duplicate panel placements', () => {
  const older = projectFixture();
  delete older.pages;
  assert.equal(validateProjectBackup(older).pages, undefined);
  const missing = projectFixture();
  missing.pages = [{ id: 'page-1', placements: [{ panelId: 'gone', order: 0, span: 12, crop: 'cover' }] }];
  assert.throws(() => validateProjectBackup(missing), /missing storyboard panel/i);
  const duplicate = projectFixture();
  duplicate.pages = [{ id: 'page-1', placements: [
    { panelId: 'panel-1', order: 0, span: 12, crop: 'cover' },
    { panelId: 'panel-1', order: 1, span: 6, crop: 'contain' }
  ] }];
  assert.throws(() => validateProjectBackup(duplicate), /same panel more than once/i);
});

test('page layouts and creator-entered Unicode text survive JSON backup import', () => {
  const source = projectFixture();
  source.pages = [{ id: 'page-1', title: 'Iphepha 1', gutter: 8, placements: [{ panelId: 'panel-1', order: 0, span: 8, crop: 'contain' }] }];
  const backup = JSON.parse(JSON.stringify({ project: source }));
  const imported = prepareImportedProject(validateProjectBackup(backup), new Set(), prefix => `${prefix}-new`);
  assert.deepEqual(imported.project.pages, source.pages);
  assert.equal(imported.project.scenes[0].panels[0].dialogue, 'Molo, mlambo.');
  assert.equal(imported.project.scenes[0].panels[0].textVersions[0].text, 'Molo, mlambo.');
  assert.deepEqual(imported.project.contentLanguages, ['English', 'isiXhosa']);
});

test('backup validation rejects duplicate page usage and malformed text versions', () => {
  const repeated = projectFixture();
  repeated.pages = [
    { id: 'page-1', placements: [{ panelId: 'panel-1', order: 0, span: 12, crop: 'cover' }] },
    { id: 'page-2', placements: [{ panelId: 'panel-1', order: 0, span: 12, crop: 'cover' }] }
  ];
  assert.throws(() => validateProjectBackup(repeated), /more than one page/i);
  const malformedVersion = projectFixture();
  malformedVersion.scenes[0].panels[0].textVersions = [{ id: 'v1', field: 'description', relationship: 'translated', language: 'isiXhosa', sourceText: 'x', text: 'y', status: 'creator-entered' }];
  assert.throws(() => validateProjectBackup(malformedVersion), /text version has invalid/i);
});

test('app exposes the composer, reader print view, separate UI locale, and isiXhosa draft label', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const locale = JSON.parse(await readFile(new URL('../dist/locales/xh.json', import.meta.url), 'utf8'));
  assert.match(html, /Comic page composer/);
  assert.match(html, /data-interface-locale/);
  assert.match(html, /data-reader-language/);
  assert.match(html, /data-action="print-comic"/);
  assert.equal(locale.draft, true);
  assert.match(locale['settings.draftNotice'], /Uyilo/);
});

