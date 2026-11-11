import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,readdirSync,mkdirSync} from 'node:fs';
const require=createRequire(import.meta.url), sharp=require(process.env.INTSOMI_NODE_MODULES+'/sharp');
for(const name of readdirSync('dist/art/maqoma').filter(x=>x.endsWith('.png'))) await sharp('dist/art/maqoma/'+name).jpeg({quality:88}).toFile('dist/art/maqoma/'+name.replace('.png','.jpg'));
let code=readFileSync('scripts/build-maqoma.mjs','utf8');
code=code.replace("await mkdir('dist'", "const reused={17:18,19:2,20:6,21:18,22:18,23:16,24:2};for(const [target,source] of Object.entries(reused)){let a=project.assets.find(a=>a.id==='maqoma-art-'+target);a.demoSrc='art/maqoma/panel-'+String(source).padStart(2,'0')+'.jpg';a.description+=' Reuses existing draft artwork; not a new depiction of this event.';}\nawait mkdir('dist'");
writeFileSync('scripts/build-maqoma.mjs',code);
const h=readFileSync('dist/index.html','utf8');mkdirSync('../../work',{recursive:true});writeFileSync('../../work/inline.mjs',h.split('<script type="module">')[1].split('</script>')[0]);
