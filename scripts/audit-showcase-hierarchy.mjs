// Audit all released/experimental stories, following local imports rather than
// judging reuse from the story filename. Repeated platform adapters are not duplicate APIs.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const root=process.cwd();
const require=createRequire(path.join(root,'showcase/web/package.json'));
const ts=require('typescript');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):/\.tsx?$/.test(e.name)?[path.join(dir,e.name)]:[])}
const sourceFiles=['web','native'].flatMap(p=>files(path.join(root,'showcase',p,'src')));
const nodes=new Map(sourceFiles.map(file=>{const source=fs.readFileSync(file,'utf8');const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const imports=[];const titles=[];function visit(n){if(ts.isImportDeclaration(n)&&ts.isStringLiteral(n.moduleSpecifier))imports.push(n.moduleSpecifier.text);if(ts.isPropertyAssignment(n)&&n.name.getText(ast)==='title'&&ts.isStringLiteral(n.initializer)&&/^(배포|실험)\//.test(n.initializer.text))titles.push(n.initializer.text);ts.forEachChild(n,visit)}visit(ast);return[file,{imports,titles,source}]}));
function resolveLocal(file,spec){const base=path.resolve(path.dirname(file),spec.replace(/\.js$/,''));return [base,base+'.tsx',base+'.ts',path.join(base,'index.tsx')].find(p=>nodes.has(p))}
function trace(file,seen=new Set(),api=new Set()){if(seen.has(file))return{seen,api};seen.add(file);for(const spec of nodes.get(file)?.imports??[]){if(spec.startsWith('@hjmds/'))api.add(spec);else if(spec.startsWith('.')){const target=resolveLocal(file,spec);if(target)trace(target,seen,api)}}return{seen,api}}
const rows=[];for(const [file,n] of nodes)if(file.includes('.stories.'))for(const title of n.titles){const {seen,api}=trace(file);rows.push({platform:file.includes('/native/')?'Native':'Web',title,source:path.relative(root,file),dependencies:[...seen].map(p=>path.relative(root,p)).sort(),hjm:[...api].sort()})}
rows.sort((a,b)=>a.title.localeCompare(b.title)||a.platform.localeCompare(b.platform));
const counts={};for(const r of rows){const key=[r.platform,...r.title.split('/').slice(0,2)].join('/');counts[key]=(counts[key]??0)+1}
const result={scope:'Static import coverage, not visual or semantic equivalence proof',counts,stories:rows};
const output='docs/audits/showcase-hierarchy-2026-10-06.json';fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({stories:rows.length,counts,noHjm:rows.filter(r=>!r.hjm.length).map(r=>r.title)},null,2));
