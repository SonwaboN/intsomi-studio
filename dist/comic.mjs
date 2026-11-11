const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function allProjectPanels(project) {
  return (project.scenes || []).flatMap(scene => (scene.panels || []).map(panel => ({
    ...panel,
    sceneId: scene.id,
    sceneTitle: scene.title
  })));
}

export function validateComicPages(project) {
  if (project.pages !== undefined && !Array.isArray(project.pages)) throw new Error('Comic pages must be a list.');
  const knownPanels = new Set(allProjectPanels(project).map(panel => panel.id));
  const pageIds = new Set();
  const projectPlacedPanels = new Set();
  for (const page of project.pages || []) {
    if (!object(page) || typeof page.id !== 'string' || !page.id.trim() || pageIds.has(page.id)) throw new Error('Comic pages must each have a unique id.');
    pageIds.add(page.id);
    if (!Array.isArray(page.placements)) throw new Error(`Page “${page.title || page.id}” has invalid panel placements.`);
    const placed = new Set();
    for (const placement of page.placements) {
      if (!object(placement) || typeof placement.panelId !== 'string' || !knownPanels.has(placement.panelId)) throw new Error(`Page “${page.title || page.id}” refers to a missing storyboard panel.`);
      if (placed.has(placement.panelId)) throw new Error(`Page “${page.title || page.id}” places the same panel more than once.`);
      if (projectPlacedPanels.has(placement.panelId)) throw new Error(`Comic panel “${placement.panelId}” is placed on more than one page.`);
      placed.add(placement.panelId);
      projectPlacedPanels.add(placement.panelId);
      if (!Number.isInteger(placement.order) || placement.order < 0) throw new Error(`Page “${page.title || page.id}” has an invalid reading order.`);
      if (!Number.isInteger(placement.span) || placement.span < 3 || placement.span > 12) throw new Error(`Page “${page.title || page.id}” has an invalid panel width.`);
      if (placement.crop !== undefined && !['cover', 'contain'].includes(placement.crop)) throw new Error(`Page “${page.title || page.id}” has an invalid image crop setting.`);
    }
    if (new Set(page.placements.map(placement => placement.order)).size !== page.placements.length) throw new Error(`Page “${page.title || page.id}” has duplicate reading order values.`);
  }
  return project;
}

export function unplacedPanels(project) {
  const placed = new Set((project.pages || []).flatMap(page => page.placements.map(item => item.panelId)));
  return allProjectPanels(project).filter(panel => !placed.has(panel.id));
}

export function orderedPagePanels(project, page) {
  const panels = new Map(allProjectPanels(project).map(panel => [panel.id, panel]));
  return [...(page?.placements || [])].sort((a, b) => a.order - b.order).map(placement => ({ placement, panel: panels.get(placement.panelId) })).filter(item => item.panel);
}
