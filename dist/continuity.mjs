const array = value => Array.isArray(value) ? value : [];

/** Deterministic structural checks only; never infer meaning from story prose. */
export function inspectContinuity(project) {
  const findings = [];
  const characters = array(project?.characters);
  const locations = array(project?.locations);
  const assets = array(project?.assets);
  const scenes = array(project?.scenes);
  const characterIds = new Set(characters.map(item => item?.id).filter(Boolean));
  const locationIds = new Set(locations.map(item => item?.id).filter(Boolean));
  const assetIds = new Set(assets.map(item => item?.id).filter(Boolean));

  const add = (code, severity, message, evidence, sceneId = '', panelId = '') => {
    findings.push({ code, severity, message, evidence, sceneId, panelId });
  };

  scenes.forEach((scene, sceneIndex) => {
    const sceneName = scene?.title || `Scene ${sceneIndex + 1}`;
    if (scene?.location && !locationIds.has(scene.location)) {
      add('missing-location', 'warning', 'This scene points to a location that is not in the Production Bible.', `${sceneName} · location id: ${scene.location}`, scene.id || '');
    }
    for (const characterId of array(scene?.characterIds)) {
      if (!characterIds.has(characterId)) {
        add('missing-character', 'warning', 'This scene points to a character that is not in the Production Bible.', `${sceneName} · character id: ${characterId}`, scene.id || '');
      }
    }
    array(scene?.panels).forEach((panel, panelIndex) => {
      const panelName = `Panel ${panelIndex + 1}`;
      if (panel?.assetId && !assetIds.has(panel.assetId)) {
        add('missing-asset', 'warning', 'This panel points to an asset that is not in the project library.', `${sceneName} · ${panelName} · asset id: ${panel.assetId}`, scene.id || '', panel.id || '');
      }
      const duration = Number(panel?.duration);
      if (!Number.isInteger(duration) || duration < 1 || duration > 120) {
        add('invalid-duration', 'warning', 'Panel duration must be a whole number from 1 to 120 seconds.', `${sceneName} · ${panelName} · duration: ${String(panel?.duration)}`, scene.id || '', panel.id || '');
      }
    });
  });
  return findings;
}
