import { orderedPagePanels } from './comic.mjs';
import { esc } from './stewardship.mjs';

export function normalizeLanguages(project) {
  const languages = [...new Set((project.contentLanguages || []).filter(x => typeof x === 'string' && x.trim()))];
  if (project.language?.trim() && !languages.includes(project.language)) languages.unshift(project.language);
  if (!project.language && languages.length) project.language = languages[0];
  project.contentLanguages = languages;
  return project;
}
export function readingText(panel, field, language = '', primary = '') {
  const source = panel[field] || '';
  if (!language || language === primary) return { text: source, missing: false, stale: false };
  const version = [...(panel.textVersions || [])].reverse().find(x => x.field === field && x.language === language);
  return version ? { text: version.text, missing: false, stale: version.sourceText !== source } : { text: source, missing: Boolean(source), stale: false };
}
export function layoutValues(placement = {}, page = {}) {
  const number = (x, fallback, min, max) => Number.isFinite(Number(x)) && x !== undefined ? Math.min(max, Math.max(min, Number(x))) : fallback;
  return { gutter: number(page.gutter, 10, 0, 28), height: number(placement.height, 180, 80, 600), fontSize: number(placement.fontSize, 15, 10, 30), spacing: number(placement.spacing, 1.45, 1, 2.2), position: number(placement.position, 50, 0, 100) };
}
export function printDocument(project, assetSrc, language = '') {
  const asset = id => project.assets.find(x => x.id === id);
  const image = id => asset(id) ? `<img src="${esc(assetSrc(asset(id)))}" alt="${esc(asset(id).name)}">` : '';
  const pages = (project.pages || []).filter(x => x.placements.length);
  const story = pages.map(page => `<section class="sheet"><header>${esc(page.title)}</header><div class="panels" style="gap:${layoutValues({},page).gutter}px">${orderedPagePanels(project,page).map(({panel,placement}) => {
    const v=layoutValues(placement,page);
    return `<article style="grid-column:span ${placement.span};font-size:${v.fontSize}px;line-height:${v.spacing}"><div class="frame" style="height:${v.height}px;--fit:${placement.crop||'cover'};--position:${v.position}%">${image(panel.assetId)}</div><div class="caption">${['dialogue','narration'].map(field=>{const t=readingText(panel,field,language,project.language);return t.text?`<p>${esc(t.text)}</p>${t.missing||t.stale?'<small>Language version needs review; source text may be shown.</small>':''}`:''}).join('')}</div></article>`;
  }).join('')}</div><footer>Idrafti · ${esc(project.title)}</footer></section>`).join('');
  const notes=(project.publicationNotes||[]).map(note=>`<section class="sheet notes"><header>${esc(note.title)}</header>${note.paragraphs.map(t=>`<p>${esc(t)}</p>`).join('')}<footer>Idrafti yokuphononongwa</footer></section>`).join('');
  return `<!doctype html><html lang="${project.language==='isiXhosa'?'xh':'en'}"><meta charset="utf-8"><title>${esc(project.title)} — review</title><style>@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;background:#ddd;color:#292a27;font:15px/1.5 Georgia,serif}.toolbar{padding:18px;font:14px system-ui;background:#f5ebdf}.sheet{width:210mm;min-height:297mm;background:#fffefa;margin:20px auto;padding:14mm;position:relative;break-after:page}.sheet:last-child{break-after:auto}header{font-size:23px;margin-bottom:18px}footer{font:10px system-ui;margin-top:18px;color:#777}.panels{display:grid;grid-template-columns:repeat(12,minmax(0,1fr))}article{border:1px solid #ccc;break-inside:avoid;min-width:0}.frame img{width:100%;height:100%;object-fit:var(--fit);object-position:50% var(--position)}.caption{padding:10px 14px;overflow-wrap:anywhere}.caption p{margin:0 0 8px;white-space:pre-wrap}.cover img{width:100%;height:175mm;object-fit:cover}.cover h1{font-size:32px}.notes p{white-space:pre-wrap;overflow-wrap:anywhere;font-size:14px}.overflow{outline:3px solid #b95f43}@media print{body{background:white}.toolbar{display:none}.sheet{margin:0;min-height:0;height:297mm}.sheet.overflow{height:auto;min-height:297mm}}@media screen and (max-width:800px){.sheet{width:100%;min-height:0;padding:20px}.cover img{height:auto}}</style><div class="toolbar"><b>Review edition — artwork and isiXhosa await creator / fluent-speaker review.</b><p id="ready">Loading images…</p><button id="print" disabled>Print / Save as PDF</button></div><section class="sheet cover"><h1>${esc(project.title)}</h1>${image(project.coverAssetId)}<p>${esc(project.introduction||project.synopsis||'')}</p></section>${story}${notes}<script>Promise.all([...document.images].map(i=>i.decode())).then(()=>document.fonts.ready).then(()=>{let overflow=[...document.querySelectorAll('.sheet')].filter(s=>s.scrollHeight>1123);overflow.forEach(s=>s.classList.add('overflow'));document.getElementById('ready').textContent=overflow.length?'Some pages exceed A4. Reduce artwork height or caption size before printing.':'All images loaded. Review every page before printing.';document.getElementById('print').disabled=overflow.length>0;}).catch(()=>document.getElementById('ready').textContent='An image failed to load. Return to the project and restore the artwork before printing.');document.getElementById('print').onclick=()=>window.print();</script></html>`;
}
