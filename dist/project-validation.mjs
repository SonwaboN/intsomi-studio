import { validateMaterials } from './stewardship.mjs';
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const array = value => Array.isArray(value);
const uniqueIds = (items, label) => {
  const ids = new Set();
  for (const item of items) {
    if (!object(item) || typeof item.id !== 'string' || !item.id.trim()) throw new Error(`${label} must each have an id.`);
    if (ids.has(item.id)) throw new Error(`${label} contain a duplicate id.`);
    ids.add(item.id);
  }
};

export function validateProjectBackup(value) {
  const project = value?.project ?? value;
  if (!object(project) || typeof project.id !== 'string' || !project.id.trim() || typeof project.title !== 'string' || !project.title.trim()) throw new Error('This file is not a valid Intsomi project export.');
  for (const key of ['story', 'guide']) if (!object(project[key])) throw new Error(`Project ${key} data is missing or invalid.`);
  for (const key of ['characters', 'locations', 'assets', 'scenes']) if (!array(project[key])) throw new Error(`Project ${key} data is missing or invalid.`);
  uniqueIds(project.characters, 'Characters');
  uniqueIds(project.locations, 'Locations');
  uniqueIds(project.assets, 'Assets');
  uniqueIds(project.scenes, 'Scenes');
  for (const character of project.characters) if (typeof character.name !== 'string' || !character.name.trim()) throw new Error('Each character must have a name.');
  for (const location of project.locations) if (typeof location.name !== 'string' || !location.name.trim()) throw new Error('Each location must have a name.');
  for (const scene of project.scenes) if (typeof scene.title !== 'string' || !scene.title.trim()) throw new Error('Each scene must have a title.');
  const allPanels = [];
  for (const scene of project.scenes) {
    if (!array(scene.panels)) throw new Error(`Scene “${scene.title || scene.id}” has invalid panel data.`);
    uniqueIds(scene.panels, `Panels in scene “${scene.title || scene.id}”`);
    if (scene.characterIds !== undefined && !array(scene.characterIds)) throw new Error(`Scene “${scene.title || scene.id}” has invalid character references.`);
    if (scene.characterIds?.some(id => typeof id !== 'string')) throw new Error(`Scene “${scene.title || scene.id}” has invalid character references.`);
    for (const panel of scene.panels) {
      if (panel.assetId !== undefined && typeof panel.assetId !== 'string') throw new Error(`Scene “${scene.title}” has an invalid artwork reference.`);
      allPanels.push(panel);
    }
  }
  uniqueIds(allPanels, 'Project panels');
  for (const asset of project.assets) {
    if (typeof asset.name !== 'string' || !asset.name.trim()) throw new Error('Each asset must have a name.');
    if (asset.data !== undefined) {
      if (typeof asset.data !== 'string') throw new Error(`Image data for “${asset.name}” is invalid.`);
      const match = asset.data.match(/^data:image\/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/]*={0,2})$/i);
      if (!match || !match[2].length || match[2].length % 4 !== 0) throw new Error(`Image data for “${asset.name}” must be PNG, JPEG, WebP, or GIF.`);
      const bytes = Math.floor(match[2].length * 3 / 4) - (match[2].endsWith('==') ? 2 : match[2].endsWith('=') ? 1 : 0);
      if (bytes > 4 * 1024 * 1024) throw new Error(`Image “${asset.name}” exceeds the 4 MB limit.`);
    }
  }
  validateMaterials(project);
  return project;
}

export function prepareImportedProject(project, existingIds, createId) {
  const incoming = JSON.parse(JSON.stringify(project));
  if (existingIds.has(incoming.id)) incoming.id = createId('project');
  const media = [];
  const assetIdMap = new Map();
  for (const asset of incoming.assets) {
    const oldId = asset.id;
    const newId = createId('asset');
    assetIdMap.set(oldId, newId);
    asset.id = newId;
    if (asset.data) {
      const match = asset.data.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/]*={0,2})$/i);
      const binary = atob(match[2]);
      const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
      media.push({ id: newId, blob: new Blob([bytes], { type: match[1] }) });
      delete asset.data;
    }
  }
  for (const scene of incoming.scenes) for (const panel of scene.panels) if (assetIdMap.has(panel.assetId)) panel.assetId = assetIdMap.get(panel.assetId);
  for(const m of incoming.materials||[]) for(const l of m.links){if(l.type==='asset'&&assetIdMap.has(l.id))l.id=assetIdMap.get(l.id);if(l.type==='project'&&l.id===project.id)l.id=incoming.id;}
  return { project: incoming, media };
}
