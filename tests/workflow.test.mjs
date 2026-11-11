import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { inspectContinuity } from '../dist/continuity.mjs';
import { prepareImportedProject, validateProjectBackup } from '../dist/project-validation.mjs';

const projectFixture = () => ({
  id: 'p1', title: 'Test project', story: {}, guide: {},
  characters: [{ id: 'c1', name: 'Nandi' }],
  locations: [{ id: 'l1', name: 'River bend' }],
  assets: [{ id: 'a1', name: 'Sketch', data: 'data:image/png;base64,aGVsbG8=' }],
  scenes: [{ id: 's1', title: 'The bend', location: 'l1', characterIds: ['c1'], panels: [{ id: 'panel1', assetId: 'a1', duration: 4 }] }]
});

test('continuity inspector reports structural references and timing with evidence only', () => {
  const project = projectFixture();
  project.scenes[0].location = 'missing-location';
  project.scenes[0].characterIds.push('missing-character');
  project.scenes[0].panels[0].assetId = 'missing-asset';
  project.scenes[0].panels[0].duration = 0.5;
  const before = structuredClone(project);
  const findings = inspectContinuity(project);
  assert.deepEqual(findings.map(item => item.code), ['missing-location', 'missing-character', 'missing-asset', 'invalid-duration']);
  assert.ok(findings.every(item => item.evidence.includes('The bend')));
  assert.deepEqual(project, before, 'the review must not change project content');
});

test('continuity inspector accepts valid links and valid panel durations', () => {
  assert.deepEqual(inspectContinuity(projectFixture()), []);
});

test('backup validation accepts a portable project and rejects malformed records', () => {
  const valid = projectFixture();
  assert.equal(validateProjectBackup({ project: valid }).title, valid.title);
  assert.throws(() => validateProjectBackup({ project: { ...valid, scenes: {} } }), /scenes data/i);
  const duplicate = projectFixture();
  duplicate.assets.push({ id: 'a1', name: 'Duplicate' });
  assert.throws(() => validateProjectBackup(duplicate), /duplicate id/i);
  const unnamedCharacter = projectFixture();
  unnamedCharacter.characters[0].name = '';
  assert.throws(() => validateProjectBackup(unnamedCharacter), /character must have a name/i);
  const invalidImage = projectFixture();
  invalidImage.assets[0].data = 'data:text/html;base64,PGgxPm5vPC9oMT4=';
  assert.throws(() => validateProjectBackup(invalidImage), /must be PNG, JPEG, WebP, or GIF/i);
});

test('backup preparation remaps image IDs and linked panels without mutating the source', () => {
  const source = projectFixture();
  let next = 0;
  const result = prepareImportedProject(source, new Set(['p1']), prefix => `${prefix}-new-${++next}`);
  assert.equal(result.project.id, 'project-new-1');
  assert.equal(result.project.assets[0].id, 'asset-new-2');
  assert.equal(result.project.scenes[0].panels[0].assetId, 'asset-new-2');
  assert.equal(result.project.assets[0].data, undefined);
  assert.equal(result.media.length, 1);
  assert.equal(result.media[0].blob.type, 'image/png');
  assert.equal(result.media[0].blob.size, 5);
  assert.equal(source.assets[0].data, 'data:image/png;base64,aGVsbG8=');
});

test('app exposes the continuity and guarded-asset workflow in the served page', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  assert.match(html, /Continuity check/);
  assert.match(html, /Characters in this scene/);
  assert.match(html, /data-action="review-continuity"/);
  assert.match(html, /assetUsage\(a\.id\)\.length\?/);
  assert.match(html, /Remove it from those panels first/);
  assert.match(html, /prepareImportedProject\(validated/);
});
